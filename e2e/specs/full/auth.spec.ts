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

    await page.getByLabel('Adres e-mail').fill(email!);
    await page.getByLabel('Hasło', { exact: true }).fill(password!);
    await page.getByRole('button', { name: 'Zaloguj się' }).click();

    await expect(page).toHaveURL(/\/manager\/students$/);
    await expect(
        page.getByRole('heading', { name: 'Kursanci', exact: true }).first(),
    ).toBeVisible();

    await page.reload();
    await expect(page).toHaveURL(/\/manager\/students$/);

    await page.getByRole('button', { name: 'Wyloguj', exact: true }).click();
    await expect(page).toHaveURL(/\/login$/);
});
