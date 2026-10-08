import { expect, test, type Page } from '@playwright/test';

type AuditRole = 'STUDENT' | 'INSTRUCTOR' | 'MANAGER';

const roleAccounts: Record<
    AuditRole,
    { emailKey: string; passwordKey: string }
> = {
    STUDENT: {
        emailKey: 'E2E_STUDENT_EMAIL',
        passwordKey: 'E2E_STUDENT_PASSWORD',
    },
    INSTRUCTOR: {
        emailKey: 'E2E_INSTRUCTOR_EMAIL',
        passwordKey: 'E2E_INSTRUCTOR_PASSWORD',
    },
    MANAGER: {
        emailKey: 'E2E_MANAGER_EMAIL',
        passwordKey: 'E2E_MANAGER_PASSWORD',
    },
};

function todayInWarsaw(): string {
    return new Intl.DateTimeFormat('sv-SE', {
        timeZone: 'Europe/Warsaw',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).format(new Date());
}

async function loginAs(page: Page, role: AuditRole): Promise<string> {
    const account = roleAccounts[role];
    const email = process.env[account.emailKey];
    const password = process.env[account.passwordKey];

    test.skip(
        !email || !password,
        `Wymagane: ${account.emailKey} i ${account.passwordKey}.`,
    );

    await page.goto('/login');
    await page.locator('html[data-app-ready="true"]').waitFor();
    await page.getByLabel('Adres e-mail').fill(email!);
    await page.getByLabel('Hasło', { exact: true }).fill(password!);
    await page.getByRole('button', { name: 'Zaloguj się' }).click();
    await expect(page).toHaveURL((url) => url.pathname === '/');

    const accessToken = (await page.context().cookies()).find(
        ({ name }) => name === 'access_token',
    )?.value;

    expect(accessToken, `Brak sesji BE dla roli ${role}.`).toBeTruthy();

    return accessToken!;
}

async function assertDirectRouteBlocked(
    page: Page,
    route: string,
    protectedHeading: string,
): Promise<void> {
    await page.goto(route);
    await expect(page).toHaveURL((url) => url.pathname === '/');
    await page.locator('html[data-app-ready="true"]').waitFor();
    await expect(
        page.getByRole('heading', { name: protectedHeading, exact: true }),
    ).toHaveCount(0);
}

async function assertForbiddenApi(
    page: Page,
    accessToken: string,
    path: string,
    method: 'GET' | 'POST' = 'GET',
): Promise<void> {
    const upstream = process.env.E2E_API_UPSTREAM!;
    const url = new URL(path, `${upstream.replace(/\/$/, '')}/`);
    const options = {
        headers: { Authorization: `Bearer ${accessToken}` },
    };
    const response =
        method === 'POST'
            ? await page.request.post(url.toString(), {
                  ...options,
                  data: {},
              })
            : await page.request.get(url.toString(), options);

    expect(response.status(), `${method} ${url.pathname} dla tej roli`).toBe(
        403,
    );
}

test.describe('@audit COM-05 dostęp do tras i API według roli', () => {
    test.skip(
        process.env.E2E_AUDIT_FIXTURE !== 'school-operational' ||
            process.env.E2E_MODE !== 'upstream' ||
            process.env.E2E_CONFIRM_ISOLATED_ENVIRONMENT !== 'true' ||
            !process.env.E2E_API_UPSTREAM,
        'Wymagane: izolowany upstream E2E oraz E2E_AUDIT_FIXTURE=school-operational.',
    );

    test('kursant nie otwiera opinii, wydarzeń ani listy instruktorów', async ({
        page,
    }) => {
        const accessToken = await loginAs(page, 'STUDENT');

        await assertDirectRouteBlocked(page, '/my-reviews', 'Moje opinie');
        await assertDirectRouteBlocked(page, '/events', 'Moje wydarzenia');
        await assertDirectRouteBlocked(
            page,
            '/manager/instructors',
            'Instruktorzy',
        );

        await assertForbiddenApi(page, accessToken, '/ratings/me');
        await assertForbiddenApi(page, accessToken, '/events');
        await assertForbiddenApi(
            page,
            accessToken,
            '/instructors?schoolId=00000000-0000-4000-8000-000000000001',
        );
    });

    test('instruktor nie otwiera rezerwacji kursanta ani harmonogramu managera', async ({
        page,
    }) => {
        const accessToken = await loginAs(page, 'INSTRUCTOR');

        await assertDirectRouteBlocked(
            page,
            '/book-lesson',
            'Rezerwacja jazdy',
        );
        await assertDirectRouteBlocked(
            page,
            '/manager/schedule',
            'Harmonogram OSK',
        );

        await assertForbiddenApi(page, accessToken, '/lessons/me', 'POST');
        await assertForbiddenApi(page, accessToken, '/schedule');
    });

    test('manager nie otwiera własnych opinii instruktora ani lekcji', async ({
        page,
    }) => {
        const accessToken = await loginAs(page, 'MANAGER');
        const today = todayInWarsaw();

        await assertDirectRouteBlocked(page, '/my-reviews', 'Moje opinie');
        await assertDirectRouteBlocked(page, '/my-lessons', 'Moje lekcje');

        await assertForbiddenApi(page, accessToken, '/ratings/me');
        await assertForbiddenApi(
            page,
            accessToken,
            `/schedule/me?dateFrom=${today}&dateTo=${today}`,
        );
    });
});
