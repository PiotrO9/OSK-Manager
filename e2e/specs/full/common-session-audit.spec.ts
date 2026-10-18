import { expect, test, type Page } from '@playwright/test';

const instructorEmail = process.env.E2E_INSTRUCTOR_EMAIL;
const instructorPassword = process.env.E2E_INSTRUCTOR_PASSWORD;

async function loginAsInstructor(page: Page, destination = '/'): Promise<void> {
    await page.goto('/logowanie');
    await page.locator('html[data-app-ready="true"]').waitFor();
    await page.getByLabel('Adres e-mail').fill(instructorEmail!);
    await page.getByLabel('Hasło', { exact: true }).fill(instructorPassword!);
    await page.getByRole('button', { name: 'Zaloguj się' }).click();
    await expect(page).toHaveURL((url) => url.pathname === destination);
}

test.describe('@audit sesja i nawigacja — school-operational', () => {
    test.skip(
        process.env.E2E_AUDIT_FIXTURE !== 'school-operational' ||
            process.env.E2E_MODE !== 'upstream' ||
            !instructorEmail ||
            !instructorPassword,
        'Wymagany izolowany school-operational oraz konto instruktora.',
    );

    for (const destination of ['/moje-lekcje', '/moje-opinie']) {
        test(`COM-03 — powrót po logowaniu do ${destination}`, async ({
            page,
        }) => {
            await page.goto(destination);
            await expect(page).toHaveURL(/\/logowanie(?:\?.*)?$/);

            await page.locator('html[data-app-ready="true"]').waitFor();
            await page.getByLabel('Adres e-mail').fill(instructorEmail!);
            await page
                .getByLabel('Hasło', { exact: true })
                .fill(instructorPassword!);
            await page.getByRole('button', { name: 'Zaloguj się' }).click();
            await expect(page).toHaveURL((url) => url.pathname === destination);

            await page.reload();
            await expect(page).toHaveURL((url) => url.pathname === destination);
            await expect(
                page.getByRole('button', { name: 'Wyloguj', exact: true }),
            ).toBeVisible();
        });
    }

    test('COM-04 — wylogowanie odcina obie karty i historię', async ({
        context,
        page,
    }) => {
        await loginAsInstructor(page);
        await page.goto('/moje-lekcje');
        await page.locator('html[data-app-ready="true"]').waitFor();
        await expect(page).toHaveURL(/\/moje-lekcje$/);
        await expect(
            page.getByRole('heading', { name: 'Moje lekcje' }),
        ).toBeVisible();

        const secondPage = await context.newPage();

        await secondPage.goto('/moje-lekcje');
        await secondPage.locator('html[data-app-ready="true"]').waitFor();
        await expect(
            secondPage.getByRole('heading', { name: 'Moje lekcje' }),
        ).toBeVisible();

        await page.getByRole('button', { name: 'Wyloguj' }).click();
        await expect(page).toHaveURL(/\/logowanie$/);
        await expect(secondPage).toHaveURL(/\/logowanie$/);

        await page.goBack();
        await expect(page).toHaveURL(/\/logowanie$/);
        await page.goto('/moje-lekcje');
        await expect(page).toHaveURL(/\/logowanie(?:\?.*)?$/);
        await page.reload();
        await expect(page).toHaveURL(/\/logowanie(?:\?.*)?$/);
        await expect(
            page.getByRole('heading', { name: 'Moje lekcje' }),
        ).toHaveCount(0);

        await loginAsInstructor(page, '/moje-lekcje');
    });

    test('COM-13 — formularz bez JavaScript nie ujawnia hasła w URL', async ({
        browser,
        baseURL,
    }) => {
        const context = await browser.newContext({ javaScriptEnabled: false });

        try {
            const page = await context.newPage();
            const requestsWithCredentials: string[] = [];

            page.on('request', (request) => {
                const url = new URL(request.url());

                if (
                    request.method() === 'GET' &&
                    (url.searchParams.has('email') ||
                        url.searchParams.has('password'))
                ) {
                    requestsWithCredentials.push(url.pathname);
                }
            });

            await page.goto(`${baseURL}/logowanie`);
            const form = page.locator('form').filter({
                has: page.getByLabel('Adres e-mail'),
            });

            await expect(form).toHaveAttribute('method', 'post');
            await page.getByLabel('Adres e-mail').fill(instructorEmail!);
            await page
                .getByLabel('Hasło', { exact: true })
                .fill(instructorPassword!);
            await expect(
                page.getByRole('button', { name: 'Zaloguj się' }),
            ).toBeDisabled();
            await page.getByLabel('Hasło', { exact: true }).press('Enter');
            await expect(page).toHaveURL(/\/logowanie$/);
            expect(requestsWithCredentials).toEqual([]);
        } finally {
            await context.close();
        }

        const hydratedPage = await browser.newPage();

        try {
            await loginAsInstructor(hydratedPage);
            await expect(hydratedPage).toHaveURL(/\/$/);
        } finally {
            await hydratedPage.close();
        }
    });
});
