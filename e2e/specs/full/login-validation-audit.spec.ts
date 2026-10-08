import { expect, test } from '@playwright/test';

test('@audit COM-02 — walidacja logowania i poprawa danych w tym samym formularzu', async ({
    page,
}) => {
    const email = process.env.E2E_MANAGER_EMAIL;
    const password = process.env.E2E_MANAGER_PASSWORD;

    test.skip(
        process.env.E2E_AUDIT_FIXTURE !== 'school-operational' ||
            !email ||
            !password,
        'Wymagany fixture school-operational, E2E_AUDIT_FIXTURE=school-operational i dane logowania menadżera.',
    );

    await page.goto('/login');
    await page.locator('html[data-app-ready="true"]').waitFor();

    const emailField = page.getByLabel('Adres e-mail');
    const passwordField = page.getByLabel('Hasło', { exact: true });
    const submitButton = page.getByRole('button', { name: 'Zaloguj się' });

    await submitButton.click();
    await expect(page.getByText('Podaj adres e-mail')).toBeVisible();
    await expect(page.getByText('Podaj hasło')).toBeVisible();
    await expect(emailField).toHaveAttribute('aria-invalid', 'true');
    await expect(passwordField).toHaveAttribute('aria-invalid', 'true');
    await expect(page).toHaveURL(/\/login$/);

    await emailField.fill('abc');
    await passwordField.fill('celowo-bledne-haslo');
    await submitButton.click();
    await expect(page.getByText('Nieprawidłowy format e-mail')).toBeVisible();
    await expect(page.getByText('Podaj hasło')).toHaveCount(0);
    await expect(page).toHaveURL(/\/login$/);

    await emailField.fill(email!);
    await submitButton.click();

    const submitError = page.locator('#loginSubmitError');

    await expect(submitError).toBeVisible();
    await expect(submitError).toContainText(/\S/);
    await expect(page).toHaveURL(/\/login$/);
    expect((await page.context().request.get('/api/auth/me')).status()).toBe(
        401,
    );

    await passwordField.fill(password!);
    await expect(submitError).toHaveAttribute('aria-hidden', 'true');
    await submitButton.click();
    await expect(page).toHaveURL(/\/$/);

    await page.goto('/manager/students');
    await expect(page).toHaveURL(/\/manager\/students$/);
    await expect(
        page.getByRole('heading', { name: 'Kursanci', exact: true }).first(),
    ).toBeVisible();

    await page.locator('html[data-app-ready="true"]').waitFor();
    await page.getByRole('button', { name: 'Wyloguj', exact: true }).click();
    await expect(page).toHaveURL(/\/login$/);
});
