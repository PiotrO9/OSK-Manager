import { expect, test, type Page } from '@playwright/test';
import { authenticateMockUser } from '../../support/mockAuth';

const english = process.env.E2E_ROUTE_VARIANT === 'en';
const listPath = english ? '/manager/osk' : '/menedzer/osrodki';
const createPath = `${listPath}/${english ? 'new' : 'dodaj'}`;
const originalSchool = {
    id: 'old',
    name: 'OSK Główna',
    city: 'Gdańsk',
    address: null,
    isDefault: true,
};

async function prepare(page: Page, firstSchool = false) {
    let schools = firstSchool ? [] : [originalSchool];

    await page.route('**/api/driving-schools', async (route) => {
        if (route.request().method() === 'POST') {
            const created = {
                ...route.request().postDataJSON(),
                id: 'created',
                isDefault: firstSchool,
            };

            schools = [...schools, created];
            await route.fulfill({
                status: 201,
                json: { success: true, data: created },
            });
        } else {
            await route.fulfill({ json: { success: true, data: schools } });
        }
    });
    await page.route('**/api/driving-schools/default', (route) =>
        route.fulfill({ json: { success: true, data: schools[0] ?? null } }),
    );
}

async function open(page: Page, path: string) {
    await page.goto(path);
    await page.locator('html[data-app-ready="true"]').waitFor();
}

test.beforeEach(async ({ context, baseURL }) => {
    await authenticateMockUser(context, baseURL!, 'MANAGER');
});

for (const width of [1440, 390]) {
    test(`form validation, discard and layout at ${width}px`, async ({
        page,
    }, testInfo) => {
        await page.setViewportSize({ width, height: 900 });
        await prepare(page);
        const errors: string[] = [];

        page.on('pageerror', (error) => errors.push(error.message));
        await open(page, createPath);
        await expect(page.getByLabel('Nazwa', { exact: true })).toBeVisible();
        await page
            .getByRole('button', { name: 'Dodaj szkołę', exact: true })
            .click();
        await expect(page.getByLabel('Nazwa', { exact: true })).toBeFocused();
        await expect(page.locator('#oskFormNameError')).toBeVisible();
        await page.getByLabel('Nazwa', { exact: true }).fill('Szkic OSK');
        await expect(page.locator('#oskFormNameError')).toHaveCount(0);
        await page.getByRole('button', { name: 'Anuluj', exact: true }).click();
        const dialog = page.getByRole('dialog', {
            name: 'Odrzucić wpisane dane?',
        });

        await expect(dialog).toBeVisible();
        await page.getByRole('button', { name: 'Zostań', exact: true }).click();
        await expect(page.getByLabel('Nazwa', { exact: true })).toHaveValue(
            'Szkic OSK',
        );
        await page
            .getByRole('button', { name: 'Wróć do szkół', exact: true })
            .click();
        await expect(dialog).toBeVisible();
        await page.keyboard.press('Escape');
        await expect(dialog).toHaveCount(0);

        for (const theme of ['light', 'dark']) {
            await page.evaluate((value) => {
                document.documentElement.classList.toggle(
                    'dark',
                    value === 'dark',
                );
            }, theme);
            await expect(page.getByLabel('Nazwa', { exact: true })).toHaveCSS(
                'color',
                await page
                    .locator('body')
                    .evaluate((element) => getComputedStyle(element).color),
            );
            expect(
                await page.evaluate(
                    () =>
                        document.documentElement.scrollWidth <=
                        window.innerWidth,
                ),
            ).toBe(true);
            await page.screenshot({
                path: testInfo.outputPath(`osk-create-${width}-${theme}.png`),
                fullPage: true,
                animations: 'disabled',
            });
        }

        await page.getByRole('button', { name: 'Anuluj', exact: true }).click();
        await page
            .getByRole('button', { name: 'Odrzuć zmiany', exact: true })
            .click();
        await expect(page).toHaveURL(new RegExp(`${listPath}$`));
        expect(errors).toEqual([]);
    });
}

test('first school uses the full page and the refreshed list contains the created school', async ({
    page,
}) => {
    await prepare(page, true);
    await open(page, listPath);
    await page
        .getByRole('button', { name: 'Dodaj OSK', exact: true })
        .first()
        .click();
    await expect(page).toHaveURL(new RegExp(`${createPath}$`));
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(page.getByRole('switch')).toBeChecked();
    await expect(page.getByRole('switch')).toBeDisabled();
    await page.reload();
    await page.getByLabel('Nazwa', { exact: true }).fill('OSK Pierwsza');
    await page
        .getByRole('button', { name: 'Dodaj szkołę', exact: true })
        .click();
    await expect(page).toHaveURL(new RegExp(`${listPath}$`));
    await expect(
        page.getByRole('row').filter({ hasText: 'OSK Pierwsza' }),
    ).toHaveCount(1);
    await page.reload();
    await expect(
        page.getByRole('row').filter({ hasText: 'OSK Pierwsza' }),
    ).toHaveCount(1);
});

test('keeps the created school on partial default failure', async ({
    page,
}) => {
    await prepare(page);
    let posts = 0;

    page.on('request', (request) => {
        if (
            request.method() === 'POST' &&
            request.url().endsWith('/api/driving-schools')
        )
            posts++;
    });
    await page.route('**/api/driving-schools/created/set-default', (route) =>
        route.fulfill({
            status: 500,
            json: { success: false, error: 'Default failed' },
        }),
    );
    await open(page, createPath);
    await page.getByLabel('Nazwa', { exact: true }).fill('OSK Druga');
    await page.getByRole('switch').click();
    await page
        .getByRole('button', { name: 'Dodaj szkołę', exact: true })
        .click();
    await expect(page).toHaveURL(new RegExp(`${listPath}$`));
    await expect(
        page.getByText('Nie udało się ustawić jej jako domyślnej.', {
            exact: false,
        }),
    ).toBeVisible();
    await expect(
        page.getByRole('row').filter({ hasText: 'OSK Druga' }),
    ).toHaveCount(1);
    expect(posts).toBe(1);
});

test('preserves draft on POST failure and blocks resubmission during retry', async ({
    page,
}) => {
    await prepare(page);
    let posts = 0;
    let release!: () => void;
    const saving = new Promise<void>((resolve) => {
        release = resolve;
    });

    await page.route('**/api/driving-schools', async (route) => {
        if (route.request().method() !== 'POST') return route.fallback();

        posts++;

        if (posts === 1) {
            await route.fulfill({
                status: 500,
                json: { success: false, error: 'Zapis niedostępny' },
            });
        } else {
            await saving;
            await route.fallback();
        }
    });
    await open(page, createPath);
    await page.getByLabel('Nazwa', { exact: true }).fill('OSK Retry');
    await page
        .getByRole('button', { name: 'Dodaj szkołę', exact: true })
        .click();
    await expect(page.locator('form [role="alert"]')).toBeVisible();
    await expect(page.getByLabel('Nazwa', { exact: true })).toHaveValue(
        'OSK Retry',
    );
    await page
        .getByRole('button', { name: 'Dodaj szkołę', exact: true })
        .click();
    await expect(
        page.getByRole('button', { name: 'Zapisywanie…', exact: true }),
    ).toBeDisabled();
    await expect(
        page.getByRole('button', { name: 'Wróć do szkół', exact: true }),
    ).toBeDisabled();
    await page.getByLabel('Nazwa', { exact: true }).press('Enter');
    expect(posts).toBe(2);
    release();
    await expect(page).toHaveURL(new RegExp(`${listPath}$`));
    expect(posts).toBe(2);
});

test('failed school load can be retried without treating it as the first school', async ({
    page,
}) => {
    await prepare(page);
    let fail = true;

    await page.route('**/api/driving-schools', async (route) => {
        if (fail)
            return route.fulfill({
                status: 500,
                json: { success: false, error: 'Lista niedostępna' },
            });

        return route.fallback();
    });
    await open(page, createPath);
    await expect(
        page.getByRole('button', { name: 'Dodaj szkołę', exact: true }),
    ).toHaveCount(0);
    await expect(
        page.getByText('Nie udało się wczytać szkół jazdy', { exact: true }),
    ).toBeVisible();
    fail = false;
    await page.getByRole('button', { name: 'Ponów', exact: true }).click();
    await expect(page.getByRole('switch')).toBeEnabled();
    await expect(page.getByRole('switch')).not.toBeChecked();
});

test('legacy links preserve query and hash and do not open a dialog', async ({
    page,
}) => {
    await prepare(page);
    await open(page, `${listPath}?action=create&source=legacy#details`);
    await expect(page).toHaveURL(
        new RegExp(`${createPath}\\?source=legacy#details$`),
    );
    await expect(page.getByLabel('Nazwa', { exact: true })).toBeVisible();
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await open(
        page,
        `${english ? '/menedzer/osrodki' : '/manager/osk'}?action=create`,
    );
    await expect(page).toHaveURL(new RegExp(`${createPath}$`));
    await expect(page.getByLabel('Nazwa', { exact: true })).toBeVisible();
});

test('edit dialog still saves the shared basic fields', async ({ page }) => {
    await prepare(page);
    await page.route('**/api/driving-schools/old', (route) =>
        route.fulfill({
            json: {
                success: true,
                data: { ...originalSchool, ...route.request().postDataJSON() },
            },
        }),
    );
    await open(page, listPath);
    await page
        .getByRole('button', { name: 'Edytuj', exact: true })
        .first()
        .click();
    const dialog = page.getByRole('dialog', { name: 'Edycja szkoły jazdy' });

    await expect(dialog.getByLabel('Nazwa', { exact: true })).toHaveValue(
        'OSK Główna',
    );
    await dialog.getByLabel('Nazwa', { exact: true }).fill('OSK Zmieniona');
    const patch = page.waitForRequest(
        (request) =>
            request.method() === 'PATCH' &&
            request.url().endsWith('/api/driving-schools/old'),
    );

    await dialog
        .getByRole('button', { name: 'Zapisz zmiany', exact: true })
        .click();
    expect((await patch).postDataJSON()).toMatchObject({
        name: 'OSK Zmieniona',
        city: 'Gdańsk',
    });
    await expect(dialog).toHaveCount(0);
});

test('browser Back and sidebar navigation protect the draft', async ({
    page,
}) => {
    await prepare(page);
    await open(page, listPath);
    await page
        .getByRole('button', { name: 'Dodaj OSK', exact: true })
        .first()
        .click();
    await page.getByLabel('Nazwa', { exact: true }).fill('Szkic');
    await page.evaluate(() => window.history.back());
    const dialog = page.getByRole('dialog', { name: 'Odrzucić wpisane dane?' });

    await expect(dialog).toBeVisible();
    await dialog.getByRole('button', { name: 'Zostań', exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`${createPath}$`));
    await page
        .getByRole('link', {
            name: 'Przejdź do zarządzania szkołami jazdy',
            exact: true,
        })
        .click();
    await expect(dialog).toBeVisible();
    await dialog
        .getByRole('button', { name: 'Odrzuć zmiany', exact: true })
        .click();
    await expect(page).toHaveURL(new RegExp(`${listPath}$`));
});
