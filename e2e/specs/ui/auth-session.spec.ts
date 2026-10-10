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
    test('formularz logowania nie wysyła hasła przed hydracją', async ({
        page,
    }) => {
        await page.route('**/*.js', (route) => route.abort());
        await page.goto('/login');

        const form = page.locator('form.login-form');

        await expect(form).toHaveAttribute('method', 'post');
        await expect(
            page.getByRole('button', { name: 'Zaloguj się' }),
        ).toBeDisabled();

        await expect(page).toHaveURL(/\/login$/);
    });

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

    test('zalogowany manager otwierający login trafia do swojego widoku', async ({
        baseURL,
        context,
        page,
    }) => {
        await authenticateMockUser(context, baseURL!, 'MANAGER');

        await page.goto('/login');

        await expect(page).toHaveURL(/\/manager\/osk$/);
        await expect(
            page.getByRole('heading', { name: 'Szkoły jazdy' }),
        ).toBeVisible();
        await expect(page.getByText('Zalogowany jako')).toHaveCount(0);
    });

    test('udane logowanie utrzymuje loader formularza do przejścia do widoku roli', async ({
        baseURL,
        context,
        page,
    }) => {
        await page.addInitScript(() => {
            document.addEventListener('DOMContentLoaded', () => {
                new MutationObserver(() => {
                    if (
                        document.body.textContent?.includes('Zalogowany jako')
                    ) {
                        sessionStorage.setItem(
                            'login-account-card-seen',
                            'true',
                        );
                    }

                    if (document.body.textContent?.includes('Zalogowano')) {
                        sessionStorage.setItem(
                            'login-success-toast-seen',
                            'true',
                        );
                    }

                    if (
                        document.body.textContent?.includes(
                            'Otwieramy pulpit',
                        ) ||
                        document.body.textContent?.includes(
                            'Trwa przejście do aplikacji',
                        )
                    ) {
                        sessionStorage.setItem(
                            'login-intermediate-seen',
                            'true',
                        );
                    }
                }).observe(document.body, {
                    childList: true,
                    subtree: true,
                    characterData: true,
                });
            });
        });

        await page.goto('/login');
        await waitForNuxtHydration(page);
        await authenticateMockUser(context, baseURL!, 'MANAGER');
        await page.route('**/api/auth/login', (route) =>
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    success: true,
                    data: {
                        user: {
                            id: '3',
                            email: 'manager001@post.pl',
                            name: 'Jan Kierownik',
                            role: 'MANAGER',
                            drivingSchools: [],
                            defaultOskId: null,
                        },
                    },
                }),
            }),
        );

        let releaseDefaultResponse!: () => void;
        const defaultResponseGate = new Promise<void>((resolve) => {
            releaseDefaultResponse = resolve;
        });

        await page.route('**/api/driving-schools/default', async (route) => {
            await defaultResponseGate;
            await route.continue();
        });

        await page.getByLabel('Adres e-mail').fill('manager001@post.pl');
        await page.getByLabel('Hasło', { exact: true }).fill('manager001');
        const defaultSchoolRequest = page.waitForRequest((request) =>
            request.url().endsWith('/api/driving-schools/default'),
        );

        await page.getByRole('button', { name: 'Zaloguj się' }).click();
        await defaultSchoolRequest;

        await expect(page).toHaveURL(/\/login$/);
        await expect(page.getByLabel('Adres e-mail')).toBeVisible();
        await expect(
            page.getByRole('button', { name: 'Logowanie…' }),
        ).toBeDisabled();
        await expect(
            page.getByRole('heading', { name: 'Dobrze Cię widzieć' }),
        ).toBeVisible();

        releaseDefaultResponse();

        await expect(page).toHaveURL(/\/manager\/osk$/);
        await expect(
            page.getByRole('heading', { name: 'Szkoły jazdy' }),
        ).toBeVisible();
        expect(
            await page.evaluate(() =>
                sessionStorage.getItem('login-account-card-seen'),
            ),
        ).toBeNull();
        expect(
            await page.evaluate(() =>
                sessionStorage.getItem('login-success-toast-seen'),
            ),
        ).toBeNull();
        expect(
            await page.evaluate(() =>
                sessionStorage.getItem('login-intermediate-seen'),
            ),
        ).toBeNull();
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

    test('po wylogowaniu z pulpitu nie pokazuje widoku bez przypisanej roli', async ({
        baseURL,
        context,
        page,
    }) => {
        await authenticateMockUser(context, baseURL!, 'MANAGER');
        await page.addInitScript(() => {
            document.addEventListener('DOMContentLoaded', () => {
                const observeDashboard = () => {
                    if (
                        document.body?.textContent?.includes(
                            'Brak dostępnego pulpitu',
                        )
                    ) {
                        sessionStorage.setItem('logout-fallback-seen', 'true');
                    }
                };

                new MutationObserver(observeDashboard).observe(document.body, {
                    childList: true,
                    subtree: true,
                    characterData: true,
                });
            });
        });

        await page.goto('/');
        await waitForNuxtHydration(page);
        await expect(
            page.getByRole('button', { name: 'Wyloguj' }),
        ).toBeVisible();
        await page.evaluate(() =>
            sessionStorage.setItem('logout-fallback-seen', 'false'),
        );

        const authMeRequestsAfterLogout: string[] = [];

        page.on('request', (request) => {
            if (request.url().endsWith('/api/auth/me')) {
                authMeRequestsAfterLogout.push(request.url());
            }
        });

        await page.getByRole('button', { name: 'Wyloguj' }).click();

        await expect(page).toHaveURL(/\/login$/);
        await expect(page.getByLabel('Adres e-mail')).toBeVisible();
        await waitForNuxtHydration(page);
        expect(authMeRequestsAfterLogout).toEqual([]);
        expect(
            await page.evaluate(() =>
                sessionStorage.getItem('logout-fallback-seen'),
            ),
        ).toBe('false');
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
