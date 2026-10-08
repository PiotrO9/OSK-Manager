import { expect, test } from '@playwright/test';

test('@smoke logowanie, zachowanie sesji i wylogowanie managera', async ({
    page,
}) => {
    const email = process.env.E2E_MANAGER_EMAIL;
    const password = process.env.E2E_MANAGER_PASSWORD;

    test.skip(
        !email || !password,
        'Ustaw E2E_MANAGER_EMAIL i E2E_MANAGER_PASSWORD dla środowiska E2E.',
    );

    await page.goto('/manager/students');
    await expect(page).toHaveURL(/\/login$/);
    await page.locator('html[data-app-ready="true"]').waitFor();

    await page.getByLabel('Adres e-mail').fill(email!);
    await page.getByLabel('Hasło', { exact: true }).fill(password!);
    await page.getByRole('button', { name: 'Zaloguj się' }).click();

    await expect(page).toHaveURL(/\/manager\/students$/);
    await expect(
        page.getByRole('heading', { name: 'Kursanci', exact: true }).first(),
    ).toBeVisible();

    await page.reload();
    await expect(page).toHaveURL(/\/manager\/students$/);
    await page.locator('html[data-app-ready="true"]').waitFor();

    await page.getByRole('button', { name: 'Wyloguj', exact: true }).click();
    await expect(page).toHaveURL(/\/login$/);
});

for (const role of [
    {
        name: 'instruktora',
        emailKey: 'E2E_INSTRUCTOR_EMAIL',
        passwordKey: 'E2E_INSTRUCTOR_PASSWORD',
        dashboardLink: 'Mój terminarz',
    },
    {
        name: 'kursanta',
        emailKey: 'E2E_STUDENT_EMAIL',
        passwordKey: 'E2E_STUDENT_PASSWORD',
        dashboardLink: 'Rezerwuj jazdę',
    },
]) {
    test(`@smoke logowanie i panel ${role.name}`, async ({ page }) => {
        const email = process.env[role.emailKey];
        const password = process.env[role.passwordKey];

        test.skip(
            !email || !password,
            `Ustaw ${role.emailKey} i ${role.passwordKey} dla środowiska E2E.`,
        );

        await page.goto('/login');
        await page.locator('html[data-app-ready="true"]').waitFor();
        await page.getByLabel('Adres e-mail').fill(email!);
        await page.getByLabel('Hasło', { exact: true }).fill(password!);
        await page.getByRole('button', { name: 'Zaloguj się' }).click();

        await expect(page).toHaveURL(/\/$/);
        await expect(
            page.getByRole('link', { name: role.dashboardLink }).first(),
        ).toBeVisible();

        await page.reload();
        await expect(page).toHaveURL(/\/$/);
        await page.locator('html[data-app-ready="true"]').waitFor();
        await expect(
            page.getByRole('link', { name: role.dashboardLink }).first(),
        ).toBeVisible();

        await page
            .getByRole('button', { name: 'Wyloguj', exact: true })
            .click();
        await expect(page).toHaveURL(/\/login$/);
    });
}
