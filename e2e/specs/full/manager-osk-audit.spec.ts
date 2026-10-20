import { expect, test } from '@playwright/test';

test('@audit MGR-OSK-01 menadżer tworzy pierwszą szkołę jazdy', async ({
    page,
}) => {
    const email = process.env.E2E_MANAGER_EMAIL;
    const password = process.env.E2E_MANAGER_PASSWORD;

    // Ten test zmienia dane. Uruchamiaj go po odtworzeniu manager-only wyłącznie
    // na izolowanym stosie, przez `npm run test:e2e:full -- --grep MGR-OSK-01`.
    test.skip(
        process.env.E2E_AUDIT_FIXTURE !== 'manager-only' || !email || !password,
        'Wymagane: E2E_AUDIT_FIXTURE=manager-only oraz E2E_MANAGER_EMAIL/PASSWORD.',
    );

    const schoolName = `AUD-MGR-OSK-01-${Date.now()}`;
    const city = 'Warszawa';
    const address = 'ul. Audytowa 1';

    await page.goto('/menedzer/osrodki');
    await expect(page).toHaveURL(/\/logowanie$/);
    await page.locator('html[data-app-ready="true"]').waitFor();

    await page.getByLabel('Adres e-mail').fill(email!);
    await page.getByLabel('Hasło', { exact: true }).fill(password!);
    await page.getByRole('button', { name: 'Zaloguj się' }).click();

    await expect(page).toHaveURL(/\/menedzer\/osrodki$/);
    await expect(page.getByText('Dodaj pierwszą szkołę jazdy')).toBeVisible();
    await expect(page.getByText('0 szkół przypisanych do konta')).toBeVisible();

    await page.getByRole('button', { name: 'Dodaj OSK' }).first().click();
    await expect(page).toHaveURL(/\/menedzer\/osrodki\/dodaj$/);
    await page.getByLabel('Nazwa', { exact: true }).fill(schoolName);
    await page.getByLabel('Miasto').fill(city);
    await page.getByLabel('Adres', { exact: true }).fill(address);
    await page.getByRole('button', { name: 'Dodaj szkołę' }).click();
    await expect(page).toHaveURL(/\/menedzer\/osrodki$/);
    await expect(page.getByText('1 szkoła przypisana do konta')).toBeVisible();
    await expect(
        page.getByRole('row').filter({ hasText: schoolName }),
    ).toHaveCount(1);

    await page.reload();
    await page.locator('html[data-app-ready="true"]').waitFor();
    await expect(
        page.getByRole('row').filter({ hasText: schoolName }),
    ).toHaveCount(1);

    await page.goto('/menedzer/kursy');
    await expect(page).toHaveURL(/\/menedzer\/kursy$/);
    await expect(
        page.getByRole('region', { name: 'Baza kursów' }).getByText(schoolName),
    ).toBeVisible();
    await expect(
        page
            .getByRole('region', { name: 'Baza kursów' })
            .getByRole('link', { name: 'Dodaj kurs' }),
    ).toBeVisible();

    await page.goto('/menedzer/kursanci');
    await expect(page).toHaveURL(/\/menedzer\/kursanci$/);
    await expect(
        page
            .getByRole('region', { name: 'Baza kursantów' })
            .getByText(schoolName),
    ).toBeVisible();
    await expect(
        page.getByRole('button', {
            name: 'Otwórz formularz dodawania kursanta',
        }),
    ).toBeVisible();
});
