import { expect, test, type Page } from '@playwright/test';
import { authenticateMockUser } from '../../support/mockAuth';

const SCHOOL_ID = '123e4567-e89b-12d3-a456-426614174000';

async function prepareSchools(page: Page) {
    const school = { id: SCHOOL_ID, name: 'OSK Testowa', city: 'Warszawa' };

    await page.route('**/api/driving-schools', (route) =>
        route.fulfill({ json: { success: true, data: [school] } }),
    );
    await page.route('**/api/driving-schools/default', (route) =>
        route.fulfill({ json: { success: true, data: school } }),
    );
}

async function openForm(page: Page) {
    await page.goto('/manager/instructors/new');
    await expect(page.locator('#instructor-form-email')).toBeVisible();
}

async function fillForm(page: Page) {
    await page.getByLabel('E-mail', { exact: true }).fill('jan@example.com');
    await page.getByLabel('Hasło', { exact: true }).fill('secret123');
    await page.getByLabel('Imię', { exact: true }).fill('Jan');
    await page.getByLabel('Nazwisko', { exact: true }).fill('Nowak');
    await page.getByLabel('Numer licencji', { exact: true }).fill('LIC-22');
    await page.locator('#instructor-form-birthDate').click();
    await page.getByRole('combobox', { name: 'Wybierz rok' }).click();
    await page.getByRole('option', { name: '2000', exact: true }).click();
    await page.getByRole('combobox', { name: 'Wybierz miesiąc' }).click();
    await page.getByRole('option', { name: 'luty', exact: true }).click();
    await page
        .locator('[data-slot="calendar-cell-trigger"]:not([data-outside-view])')
        .filter({ hasText: /^29$/ })
        .click();
    await expect(page.locator('#instructor-form-birthDate')).toContainText(
        '29 lutego 2000',
    );
    await expect(page.locator('[data-slot="popover-content"]')).toHaveCount(0);
    await expect(
        page.locator('#instructor-form-birthDate'),
    ).not.toHaveAttribute('aria-invalid', 'true');
}

test.beforeEach(async ({ context, page, baseURL }) => {
    await authenticateMockUser(context, baseURL!, 'MANAGER');
    await prepareSchools(page);
});

for (const viewport of [
    { width: 1440, height: 1000 },
    { width: 390, height: 844 },
]) {
    test(`W22 layout and validation at ${viewport.width}px`, async ({
        page,
    }, testInfo) => {
        await page.setViewportSize(viewport);
        await openForm(page);
        await expect(page.locator('form [role="alert"]')).toHaveCount(0);
        await expect(page.locator('legend')).toHaveText([
            'Dane konta',
            'Dane instruktora',
        ]);
        await expect(
            page.getByText('Szkoła jazdy', { exact: true }),
        ).toHaveCount(1);
        const form = await page.locator('form').boundingBox();
        const header = await page
            .getByRole('heading', { name: 'Dodaj instruktora' })
            .boundingBox();
        const submit = page.getByRole('button', { name: 'Utwórz instruktora' });
        const button = await submit.boundingBox();

        expect(form!.x).toBeCloseTo(header!.x, 0);
        expect(button!.y).toBeGreaterThanOrEqual(form!.y + form!.height);
        await expect(page.locator('form')).toHaveCSS('max-width', 'none');
        await submit.click();
        await expect(page.locator('#instructor-form-email')).toBeFocused();
        await expect(
            page.getByText('Data urodzenia jest wymagana.', { exact: true }),
        ).toBeVisible();
        await fillForm(page);
        await expect(page.locator('form [role="alert"]')).toHaveCount(0);
        expect(
            await page.evaluate(
                () => document.documentElement.scrollWidth <= window.innerWidth,
            ),
        ).toBe(true);
        await page.screenshot({
            path: testInfo.outputPath(`w22-${viewport.width}.png`),
            fullPage: true,
        });
    });
}

test('W22 preserves draft on email conflict and blocks duplicate submits while saving', async ({
    page,
}) => {
    let calls = 0;
    let releaseSave!: () => void;
    const saving = new Promise<void>((resolve) => {
        releaseSave = resolve;
    });

    await page.route('**/api/auth/register', async (route) => {
        calls++;
        expect(route.request().postDataJSON()).toMatchObject({
            role: 'INSTRUCTOR',
            birthDate: '2000-02-29',
            schoolId: SCHOOL_ID,
        });

        if (calls === 1) {
            await route.fulfill({
                status: 409,
                json: { success: false, error: 'Email already registered' },
            });

            return;
        }

        await saving;
        await route.fulfill({
            status: 201,
            json: {
                success: true,
                data: { instructor: { id: 'new-instructor' } },
            },
        });
    });
    await openForm(page);
    await fillForm(page);
    await page.getByRole('button', { name: 'Utwórz instruktora' }).click();
    await expect(page.locator('#instructor-form-email')).toBeFocused();
    await expect(page.locator('#instructor-form-email-error')).toContainText(
        'już zajęty',
    );
    await expect(page.getByLabel('Imię', { exact: true })).toHaveValue('Jan');
    await page.getByLabel('E-mail', { exact: true }).fill('jan2@example.com');
    await expect(page.locator('#instructor-form-email-error')).toHaveCount(0);
    await page.getByRole('button', { name: 'Utwórz instruktora' }).click();
    await expect(
        page.getByRole('button', { name: 'Tworzenie konta' }),
    ).toBeDisabled();
    await expect(page.getByLabel('E-mail', { exact: true })).toBeDisabled();
    await page.getByRole('link', { name: 'Wróć do instruktorów' }).click();
    await expect(page).toHaveURL(/\/manager\/instructors\/new$/);
    expect(calls).toBe(2);
    releaseSave();
    await expect(page).toHaveURL(/\/manager\/instructors$/);
    await expect(page.getByRole('dialog')).toHaveCount(0);
});

test('W22 dirty guard supports stay, Escape and explicit discard', async ({
    page,
}) => {
    await openForm(page);
    await page.getByLabel('Imię', { exact: true }).fill('Jan');
    const back = page.getByRole('link', { name: 'Wróć do instruktorów' });

    await back.click();
    const dialog = page.getByRole('dialog', { name: 'Odrzucić wpisane dane?' });

    await expect(dialog).toBeVisible();
    await dialog.getByRole('button', { name: 'Zostań', exact: true }).click();
    await expect(dialog).toHaveCount(0);
    await expect(page.getByLabel('Imię', { exact: true })).toHaveValue('Jan');
    await back.click();
    await expect(dialog).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
    await expect(page).toHaveURL(/\/manager\/instructors\/new$/);
    await back.click();
    await dialog
        .getByRole('button', { name: 'Odrzuć zmiany', exact: true })
        .click();
    await expect(page).toHaveURL(/\/manager\/instructors$/);
});
