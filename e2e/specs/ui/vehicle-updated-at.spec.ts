import { expect, test } from '@playwright/test';
import { authenticateMockUser } from '../../support/mockAuth';

const school = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'OSK Testowa',
    city: 'Warszawa',
};
const vehicle = {
    id: 'vehicle-updated-at',
    schoolId: school.id,
    name: 'Toyota Yaris',
    registrationNumber: 'KR12345',
    status: 'ACTIVE',
    unavailableUntil: null,
    isDefault: false,
    inspectionDate: null,
    insuranceDate: null,
    modelYear: 2020,
    mileageKm: 54_321,
    photoUrl: null,
    updatedAt: '2026-10-08T12:32:00.000Z',
};
const message = 'Dane pojazdu zaktualizowano: 08.10.2026, 14:32';

test.beforeEach(async ({ context, baseURL, page }) => {
    await authenticateMockUser(context, baseURL!, 'MANAGER');
    await page.route('**/api/driving-schools', (route) =>
        route.fulfill({ json: { success: true, data: [school] } }),
    );
    await page.route('**/api/driving-schools/default', (route) =>
        route.fulfill({ json: { success: true, data: school } }),
    );
    await page.route('**/api/vehicles?*', (route) =>
        route.fulfill({
            json: {
                success: true,
                data: { vehicles: [vehicle], defaultVehicleId: null },
            },
        }),
    );
    await page.route(`**/api/vehicles/${vehicle.id}`, (route) =>
        route.fulfill({ json: { success: true, data: vehicle } }),
    );
});

for (const viewport of [
    { width: 1440, height: 900 },
    { width: 390, height: 844 },
]) {
    test(`shows the record update time at ${viewport.width}px`, async ({
        page,
    }) => {
        await page.setViewportSize(viewport);
        await page.goto('/vehicles');

        const info = page.getByRole('button', {
            name: 'Informacja o aktualizacji danych pojazdu',
        });
        const openMessage = page
            .locator('[data-slot="popover-content"][data-state="open"]')
            .getByText(message);

        await expect(info).toBeVisible();

        if (viewport.width === 1440) {
            await info.hover();
            await expect(openMessage).toBeVisible();
            await page.mouse.move(0, 0);
            await expect(openMessage).toHaveCount(0);
            await info.press('Enter');
            await expect(openMessage).toBeVisible();
            await page.keyboard.press('Escape');
            await expect(openMessage).toHaveCount(0);
        }

        await info.click();
        await expect(openMessage).toBeVisible();
        await page.keyboard.press('Escape');
        await expect(openMessage).toHaveCount(0);

        await page.goto(`/vehicles/${vehicle.id}`);
        await expect(info).toBeVisible();
        await info.click();
        await expect(openMessage).toBeVisible();
        await page.keyboard.press('Escape');

        await page.getByRole('tab', { name: 'Dane' }).click();
        await expect(info).toHaveCount(2);
        await info.last().click();
        await expect(openMessage).toBeVisible();
    });
}

test.describe('touch input', () => {
    test.use({ hasTouch: true, viewport: { width: 390, height: 844 } });

    test('opens the update message by tapping the icon', async ({ page }) => {
        await page.goto('/vehicles');

        await page
            .getByRole('button', {
                name: 'Informacja o aktualizacji danych pojazdu',
            })
            .tap();

        await expect(
            page
                .locator('[data-slot="popover-content"][data-state="open"]')
                .getByText(message),
        ).toBeVisible();
    });
});
