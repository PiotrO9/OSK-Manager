import { expect, test, type Page } from '@playwright/test';
import { authenticateMockUser } from '../../support/mockAuth';

const SCHOOL_ID = '123e4567-e89b-12d3-a456-426614174000';
const VEHICLE_ID = 'vehicle-1';
const vehicle = {
    id: VEHICLE_ID,
    schoolId: SCHOOL_ID,
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
};

async function prepareVehicle(page: Page, uploadNames: string[]) {
    const school = { id: SCHOOL_ID, name: 'OSK Testowa', city: 'Warszawa' };

    await page.route('**/api/driving-schools', (route) =>
        route.fulfill({ json: { success: true, data: [school] } }),
    );
    await page.route('**/api/driving-schools/default', (route) =>
        route.fulfill({ json: { success: true, data: school } }),
    );
    await page.route(`**/api/vehicles/${VEHICLE_ID}`, (route) =>
        route.fulfill({ json: { success: true, data: vehicle } }),
    );
    await page.route(`**/api/vehicles/${VEHICLE_ID}/photo`, (route) => {
        const body = route.request().postDataBuffer()?.toString('utf8') ?? '';
        const name = body.match(/filename="([^"]+)"/)?.[1];

        if (name) uploadNames.push(name);

        return route.fulfill({
            json: {
                success: true,
                data: { photoUrl: '/uploads/vehicle-1.jpg' },
            },
        });
    });
}

test.beforeEach(async ({ context, baseURL }) => {
    await authenticateMockUser(context, baseURL!, 'MANAGER');
});

for (const viewport of [
    { width: 1440, height: 1000 },
    { width: 390, height: 844 },
]) {
    test(`W25 uploads the second photo at ${viewport.width}px`, async ({
        page,
    }) => {
        const uploads: string[] = [];

        await page.setViewportSize(viewport);
        await prepareVehicle(page, uploads);
        await page.goto(`/vehicles/${VEHICLE_ID}/edit`);
        const input = page.locator('#vehicle-photo-input');

        await expect(input).toBeAttached({ timeout: 30_000 });

        await input.setInputFiles({
            name: 'first.jpg',
            mimeType: 'image/jpeg',
            buffer: Buffer.from('first'),
        });
        await expect(
            page.getByText('first.jpg', { exact: true }),
        ).toBeVisible();

        await input.setInputFiles({
            name: 'second.png',
            mimeType: 'image/png',
            buffer: Buffer.from('second'),
        });
        await expect(
            page.getByText('second.png', { exact: true }),
        ).toBeVisible();
        await page
            .getByRole('button', { name: 'Zapisz zmiany' })
            .first()
            .click();
        await expect(page).toHaveURL(/\/vehicles$/);
        expect(uploads).toEqual(['second.png']);
    });
}

test('W25 supports invalid then valid, the same file, clear and upload retry', async ({
    page,
}) => {
    const uploads: string[] = [];

    await prepareVehicle(page, uploads);
    await page.goto(`/vehicles/${VEHICLE_ID}/edit`);
    const input = page.locator('#vehicle-photo-input');

    await expect(input).toBeAttached({ timeout: 30_000 });

    await input.setInputFiles({
        name: 'invalid.txt',
        mimeType: 'text/plain',
        buffer: Buffer.from('invalid'),
    });
    await expect(page.getByRole('alert')).toContainText(
        'Wybierz plik JPEG, PNG lub WebP.',
    );

    const photo = {
        name: 'same.png',
        mimeType: 'image/png',
        buffer: Buffer.from(
            'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl6dQAAAABJRU5ErkJggg==',
            'base64',
        ),
    };

    await input.setInputFiles(photo);
    await expect(page.getByText('same.png', { exact: true })).toBeVisible();
    const firstPreview = await page
        .getByAltText('Zdjęcie pojazdu Toyota Yaris')
        .getAttribute('src');

    await input.setInputFiles(photo);
    await expect(page.getByText('same.png', { exact: true })).toBeVisible();
    await expect(page.getByRole('alert')).toHaveCount(0);
    const secondPreview = await page
        .getByAltText('Zdjęcie pojazdu Toyota Yaris')
        .getAttribute('src');

    expect(secondPreview).not.toBe(firstPreview);

    await page.getByRole('button', { name: 'Usuń wybór' }).click();
    await expect(page.getByText('Nie wybrano pliku.')).toBeVisible();
    await input.setInputFiles(photo);
    await expect(page.getByText('same.png', { exact: true })).toBeVisible();

    await page.route(
        `**/api/vehicles/${VEHICLE_ID}/photo`,
        async (route) => {
            const body =
                route.request().postDataBuffer()?.toString('utf8') ?? '';
            const name = body.match(/filename="([^"]+)"/)?.[1];

            if (name) uploads.push(name);

            await route.fulfill({
                status: 503,
                json: { success: false, error: 'Storage niedostępny.' },
            });
        },
        { times: 1 },
    );

    await page.getByRole('button', { name: 'Zapisz zmiany' }).first().click();
    await expect(
        page.getByRole('button', { name: 'Spróbuj ponownie' }),
    ).toBeVisible();
    await expect(page.getByText('same.png', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Spróbuj ponownie' }).click();
    await expect(page).toHaveURL(/\/vehicles$/);
    expect(uploads).toEqual(['same.png', 'same.png']);
});
