import { expect, test } from '@playwright/test';
import { authenticateMockUser } from '../../support/mockAuth';
const school = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'OSK Testowa',
    city: 'Warszawa',
};
const categories = [
    {
        id: '11111111-1111-4111-8111-111111111111',
        code: 'B',
        name: 'Kategoria B',
    },
    {
        id: '22222222-2222-4222-8222-222222222222',
        code: 'BE',
        name: 'Kategoria B+E',
    },
];
const car = {
    id: '33333333-3333-4333-8333-333333333333',
    schoolId: school.id,
    name: 'Samochód szkoleniowy',
    registrationNumber: 'WA1234',
    status: 'ACTIVE',
    isDefault: false,
    inspectionDate: null,
    insuranceDate: null,
    modelYear: 2020,
    mileageKm: 1000,
    photoUrl: null,
    supportedCourseTypes: categories,
};

test.beforeEach(async ({ page, context, baseURL }) => {
    await authenticateMockUser(context, baseURL!, 'MANAGER');
    await page.route('**/api/driving-schools', (route) =>
        route.fulfill({ json: { success: true, data: [school] } }),
    );
    await page.route('**/api/driving-schools/default', (route) =>
        route.fulfill({ json: { success: true, data: school } }),
    );
    await page.route('**/api/course-types', (route) =>
        route.fulfill({ json: { success: true, data: categories } }),
    );
    await page.route('**/api/vehicles?*', (route) =>
        route.fulfill({
            json: {
                success: true,
                data: {
                    vehicles: [
                        car,
                        {
                            ...car,
                            id: '44444444-4444-4444-8444-444444444444',
                            name: 'Pojazd do uzupełnienia',
                            supportedCourseTypes: [],
                        },
                    ],
                    defaultVehicleId: null,
                },
            },
        }),
    );
});

for (const width of [1440, 390]) {
    test(`requires categories and sends multiple choices at ${width}px`, async ({
        page,
    }) => {
        await page.setViewportSize({ width, height: 1000 });
        let payload: Record<string, unknown> | undefined;

        await page.route('**/api/vehicles', async (route) => {
            if (route.request().method() === 'POST') {
                payload = route.request().postDataJSON();
                await route.fulfill({ json: { success: true, data: car } });
            } else await route.continue();
        });
        await page.goto('/vehicles/new');
        await page
            .getByLabel('Nazwa pojazdu', { exact: true })
            .fill('Samochód szkoleniowy');
        await page.locator('#vehicle-registration').fill('WA1234');
        await expect(
            page.getByRole('checkbox', { name: 'B', exact: true }),
        ).toBeVisible();
        await page
            .getByRole('button', { name: 'Dodaj pojazd', exact: true })
            .first()
            .click();
        await expect(
            page.getByText('Wybierz co najmniej jedną kategorię.', {
                exact: true,
            }),
        ).toBeVisible();
        expect(payload).toBeUndefined();
        await page.getByRole('checkbox', { name: 'B', exact: true }).check();
        await page.getByRole('checkbox', { name: 'BE', exact: true }).check();
        await page
            .getByRole('button', { name: 'Dodaj pojazd', exact: true })
            .first()
            .click();
        await expect(page).toHaveURL(new RegExp('/vehicles$'));
        expect(payload?.supportedCourseTypeIds).toEqual(
            categories.map((type) => type.id),
        );
        await expect(
            page
                .getByText('Uzupełnij kategorie', { exact: true })
                .filter({ visible: true }),
        ).toBeVisible();
        await expect(
            page
                .getByLabel('B — Kategoria B', { exact: true })
                .filter({ visible: true }),
        ).toBeVisible();
    });
}

test('preserves edit selections, reports a category conflict and retains the draft', async ({
    page,
}) => {
    let payload: Record<string, unknown> | undefined;

    await page.route(`**/api/vehicles/${car.id}`, async (route) => {
        if (route.request().method() === 'PATCH') {
            payload = route.request().postDataJSON();
            await route.fulfill({
                status: 409,
                json: {
                    success: false,
                    error: {
                        message:
                            'Nie można usunąć kategorii pojazdu używanej przez zaplanowane jazdy.',
                    },
                    message:
                        'Nie można usunąć kategorii pojazdu używanej przez zaplanowane jazdy.',
                },
            });
        } else await route.fulfill({ json: { success: true, data: car } });
    });
    await page.goto(`/vehicles/${car.id}/edit`);
    await expect(
        page.getByRole('checkbox', { name: 'B', exact: true }),
    ).toBeChecked();
    await expect(
        page.getByRole('checkbox', { name: 'BE', exact: true }),
    ).toBeChecked();
    await page.getByRole('checkbox', { name: 'B', exact: true }).uncheck();
    await page
        .getByRole('button', { name: 'Zapisz zmiany', exact: true })
        .first()
        .click();
    await expect(
        page
            .getByRole('alert')
            .filter({ hasText: 'Nie można usunąć kategorii' }),
    ).toBeVisible();
    expect(payload?.supportedCourseTypeIds).toEqual([categories[1]!.id]);
    await expect(
        page.getByRole('checkbox', { name: 'BE', exact: true }),
    ).toBeChecked();
    await expect(page).toHaveURL(new RegExp(`${car.id}/edit$`));
});
test('recovers after a category catalog failure', async ({ page }) => {
    let unavailable = true;

    await page.route('**/api/course-types', (route) =>
        unavailable
            ? route.fulfill({ status: 500, json: { message: 'Unavailable' } })
            : route.fulfill({ json: { success: true, data: categories } }),
    );
    await page.goto('/vehicles/new');
    await expect(
        page.getByText('Nie udało się pobrać kategorii pojazdów.', {
            exact: true,
        }),
    ).toBeVisible();
    unavailable = false;
    await page
        .getByRole('button', { name: 'Spróbuj ponownie', exact: true })
        .click();
    await expect(
        page.getByRole('checkbox', { name: 'B', exact: true }),
    ).toBeVisible();
});
