import { expect, test } from '@playwright/test';
import {
    authenticateMockUser,
    authenticateMockUserThroughRefresh,
    authenticateMockUserWithInvalidRefresh,
} from '../../support/mockAuth';

async function waitForNuxtHydration(page: import('@playwright/test').Page) {
    await page.locator('html[data-app-ready="true"]').waitFor();
}

test.describe('UI smoke: sesja i routing', () => {
    test('zapamiętuje chronioną trasę i przekierowuje na login', async ({
        context,
        page,
    }) => {
        await page.goto('/manager/students?status=ACTIVE');

        await expect(page).toHaveURL(/\/login$/);
        await expect(page.getByLabel('Adres e-mail')).toBeVisible();
        await expect(page.getByLabel('Hasło', { exact: true })).toBeVisible();

        const returnCookie = (await context.cookies()).find(
            ({ name }) => name === 'auth_return_to',
        );

        expect(decodeURIComponent(returnCookie?.value || '')).toContain(
            '/manager/students?status=ACTIVE',
        );
    });

    test('wpuszcza managera na chronioną stronę i wylogowuje', async ({
        baseURL,
        context,
        page,
    }) => {
        await authenticateMockUser(context, baseURL!, 'MANAGER');

        const clientSessionCheck = page.waitForResponse(
            (response) =>
                response.url().endsWith('/api/auth/me') && response.ok(),
        );

        await page.goto('/manager/students');
        await clientSessionCheck;
        await waitForNuxtHydration(page);

        await expect(page).toHaveURL(/\/manager\/students$/);
        await expect(
            page
                .getByRole('heading', { name: 'Kursanci', exact: true })
                .first(),
        ).toBeVisible();

        const logoutResponse = page.waitForResponse((response) =>
            response.url().endsWith('/api/auth/logout'),
        );

        await page
            .getByRole('button', { name: 'Wyloguj', exact: true })
            .click();
        expect((await logoutResponse).ok()).toBe(true);

        await expect(page).toHaveURL(/\/login$/);
        expect(
            (await context.cookies()).some(
                ({ name }) => name === 'access_token',
            ),
        ).toBe(false);
    });

    test('blokuje kursantowi trasę managera', async ({
        baseURL,
        context,
        page,
    }) => {
        await authenticateMockUser(context, baseURL!, 'STUDENT');
        await page.goto('/manager/students');

        await expect(page).toHaveURL(/\/$/);
        await expect(page).not.toHaveURL(/\/manager\/students/);
    });

    test('endpoint refresh odnawia wygasły access token', async ({
        baseURL,
        context,
        page,
    }) => {
        await authenticateMockUserThroughRefresh(context, baseURL!, 'STUDENT');

        const refreshResponse = await context.request.post(
            `${baseURL}/api/auth/refresh`,
        );

        expect(refreshResponse.ok()).toBe(true);

        await page.goto('/my-lessons');

        await expect(page).toHaveURL(/\/my-lessons$/);
        await expect(
            page
                .getByRole('heading', { name: 'Moje lekcje', exact: true })
                .first(),
        ).toBeVisible();
    });

    test('SSR przekazuje nowy access cookie między refresh i ponownym /me', async ({
        baseURL,
        context,
        page,
    }) => {
        await authenticateMockUserThroughRefresh(context, baseURL!, 'STUDENT');
        const expiredAccessToken = (await context.cookies()).find(
            ({ name }) => name === 'access_token',
        )?.value;

        await page.goto('/my-lessons');

        await expect(page).toHaveURL(/\/my-lessons$/);
        await expect(
            page
                .getByRole('heading', { name: 'Moje lekcje', exact: true })
                .first(),
        ).toBeVisible();

        const refreshedAccessToken = (await context.cookies()).find(
            ({ name }) => name === 'access_token',
        )?.value;

        expect(refreshedAccessToken).toBeTruthy();
        expect(refreshedAccessToken).not.toBe(expiredAccessToken);

        await page.reload();
        await expect(page).toHaveURL(/\/my-lessons$/);
    });

    test('czyści sesję, gdy refresh token jest nieprawidłowy', async ({
        baseURL,
        context,
        page,
    }) => {
        await authenticateMockUserWithInvalidRefresh(
            context,
            baseURL!,
            'STUDENT',
        );

        await page.goto('/my-lessons');

        await expect(page).toHaveURL(/\/login$/);

        const cookieNames = (await context.cookies()).map(({ name }) => name);

        expect(cookieNames).not.toContain('access_token');
        expect(cookieNames).not.toContain('refresh_token');
    });
});
