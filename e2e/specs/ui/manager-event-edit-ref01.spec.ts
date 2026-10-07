import { expect, test } from '@playwright/test';
import { authenticateMockUser } from '../../support/mockAuth';

const eventId = '123e4567-e89b-12d3-a456-426614174099';
const instructorId = '123e4567-e89b-12d3-a456-426614174001';
const schoolId = '123e4567-e89b-12d3-a456-426614174000';
const vehicleId = '123e4567-e89b-12d3-a456-426614174002';
const event = {
    id: eventId,
    instructorId,
    type: 'DRIVE',
    startTime: '2026-08-16T08:00:00.000Z',
    endTime: '2026-08-16T09:00:00.000Z',
    vehicleId,
    capacity: 2,
    status: 'ACTIVE',
};

for (const viewport of [
    { width: 1440, height: 1000 },
    { width: 390, height: 844 },
]) {
    test(`REF-01 loads availability options at ${viewport.width}px${viewport.width >= 600 ? ' and saves a changed end time' : ''}`, async ({
        context,
        page,
        baseURL,
    }) => {
        await authenticateMockUser(context, baseURL!, 'MANAGER');
        await page.setViewportSize(viewport);
        let optionsRequests = 0;
        let patchBody: Record<string, unknown> | null = null;

        await page.route(`**/api/events/${eventId}`, async (route) => {
            if (route.request().method() === 'PATCH') {
                patchBody = route.request().postDataJSON();
                await route.fulfill({
                    json: { success: true, data: { event } },
                });

                return;
            }

            await route.fulfill({ json: { success: true, data: { event } } });
        });
        await page.route(`**/api/instructors/${instructorId}`, (route) =>
            route.fulfill({
                json: {
                    success: true,
                    data: {
                        id: instructorId,
                        schoolId,
                        firstName: 'Anna',
                        lastName: 'Nowak',
                    },
                },
            }),
        );
        await page.route('**/api/instructors?*', (route) =>
            route.fulfill({ json: { success: true, data: [] } }),
        );
        await page.route('**/api/vehicles?*', (route) =>
            route.fulfill({ json: { success: true, data: [] } }),
        );
        await page.route('**/api/schedule/availability-options', (route) => {
            optionsRequests++;

            return route.fulfill({
                json: {
                    success: true,
                    data: {
                        stepMinutes: 15,
                        policy: {
                            minDurationMinutes: 60,
                            maxDurationMinutes: 180,
                        },
                        options: [
                            {
                                startTime: '10:00',
                                endTimes: ['11:00', '11:30'],
                            },
                        ],
                        availableVehicleIds: [vehicleId],
                    },
                },
            });
        });
        await page.route('**/api/schedule/availability-check', (route) =>
            route.fulfill({
                json: {
                    success: true,
                    data: {
                        available: true,
                        issues: [],
                        policy: {
                            minDurationMinutes: 60,
                            maxDurationMinutes: 180,
                        },
                    },
                },
            }),
        );

        await page.goto(`/manager/events/${eventId}/edit`);
        await expect(
            page.getByRole('heading', { name: 'Edytuj wydarzenie' }),
        ).toBeVisible();
        await expect(
            page.getByRole('button', { name: 'Godzina początku wydarzenia' }),
        ).toHaveText('10:00');
        await expect(
            page.getByRole('button', { name: 'Godzina końca wydarzenia' }),
        ).toHaveText('11:00');
        await expect.poll(() => optionsRequests).toBeGreaterThan(0);

        if (viewport.width < 600) return;

        await page
            .getByRole('button', { name: 'Godzina końca wydarzenia' })
            .click();
        await page.locator('.time-picker-preset').getByText('30').click();
        await page.getByRole('button', { name: 'Zastosuj' }).click();
        await expect(
            page.getByRole('button', { name: 'Godzina końca wydarzenia' }),
        ).toHaveText('11:30');
        await page
            .getByRole('group', { name: 'Akcje formularza' })
            .getByRole('button', { name: 'Zapisz zmiany' })
            .click();
        await expect.poll(() => patchBody).not.toBeNull();
        expect(patchBody).toMatchObject({
            startTime: '2026-08-16T08:00:00.000Z',
            endTime: '2026-08-16T09:30:00.000Z',
        });
    });
}
