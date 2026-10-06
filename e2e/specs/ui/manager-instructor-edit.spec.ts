import { expect, test } from '@playwright/test';
import { authenticateMockUser } from '../../support/mockAuth';

const instructorId = '123e4567-e89b-12d3-a456-426614174001';
const schoolId = '123e4567-e89b-12d3-a456-426614174000';

for (const viewport of [
    { width: 1440, height: 1000 },
    { width: 390, height: 844 },
]) {
    test(`BUG-02 keeps GET-only instructor data after PATCH at ${viewport.width}px`, async ({
        context,
        page,
        baseURL,
    }) => {
        await authenticateMockUser(context, baseURL!, 'MANAGER');
        await page.setViewportSize(viewport);

        let patchCount = 0;

        await page.route(
            `**/api/instructors/${instructorId}`,
            async (route) => {
                if (route.request().method() === 'GET') {
                    await route.fulfill({
                        json: {
                            success: true,
                            data: {
                                id: instructorId,
                                schoolId,
                                firstName: 'Anna',
                                lastName: 'Nowak',
                                email: 'anna@example.com',
                                avatarUrl: null,
                                phone: '+48 600 123 456',
                                licenseNumber: 'LIC-123',
                                qualifications: 'Kat. B',
                                qualifiedCourseTypes: [],
                                experienceYears: 5,
                            },
                        },
                    });

                    return;
                }

                expect(route.request().postDataJSON()).toEqual({
                    firstName: 'Maria',
                    experienceYears: 8,
                });
                patchCount++;

                if (patchCount === 1) {
                    await route.fulfill({
                        status: 500,
                        json: { success: false, error: 'Save failed' },
                    });

                    return;
                }

                await route.fulfill({
                    json: {
                        success: true,
                        data: {
                            id: instructorId,
                            firstName: 'Maria',
                            lastName: 'Nowak',
                            email: 'anna@example.com',
                            qualifications: 'Kat. B',
                            qualifiedCourseTypes: [],
                            experienceYears: 8,
                        },
                    },
                });
            },
        );

        await page.goto(`/manager/instructors/${instructorId}`);
        await expect(
            page.getByRole('heading', { name: 'Anna Nowak' }),
        ).toBeVisible({ timeout: 30_000 });
        await page.getByRole('tab', { name: 'Dane' }).click();
        await page.getByRole('button', { name: 'Edytuj', exact: true }).click();

        const dialog = page.getByRole('dialog', { name: 'Edycja instruktora' });

        await dialog.getByLabel('Imię').fill('Maria');
        await dialog.getByLabel('Staż (lata)').fill('8');
        await dialog.getByRole('button', { name: 'Zapisz' }).click();
        await expect(dialog).toBeVisible();
        await expect(dialog.getByRole('alert')).toBeVisible();
        await expect(dialog.getByLabel('Imię')).toHaveValue('Maria');

        await dialog.getByRole('button', { name: 'Zapisz' }).click();
        await expect(dialog).toHaveCount(0);
        await expect(
            page.getByRole('heading', { name: 'Maria Nowak' }),
        ).toBeVisible();
        await expect(page.getByText('+48 600 123 456').first()).toBeVisible();
        await expect(page.getByText('LIC-123')).toBeVisible();
        expect(patchCount).toBe(2);
    });
}
