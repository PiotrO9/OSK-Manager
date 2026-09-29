import { expect, test } from '@playwright/test';
import { authenticateMockUser } from '../../support/mockAuth';

async function waitForNuxtHydration(page: import('@playwright/test').Page) {
    await page.locator('html[data-app-ready="true"]').waitFor();
}

function formatDateKey(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        '0',
    )}-${String(date.getDate()).padStart(2, '0')}`;
}

async function mockManagerDashboard(page: import('@playwright/test').Page) {
    const tomorrow = new Date();

    tomorrow.setDate(tomorrow.getDate() + 1);

    await page.route('**/api/driving-schools/default', (route) =>
        route.fulfill({
            json: {
                success: true,
                data: {
                    id: 'school-1',
                    name: 'OSK Testowa',
                    city: 'Warszawa',
                    address: 'ul. Testowa 1',
                    isDefault: true,
                },
            },
        }),
    );
    await page.route('**/api/manager/attention-items?*', (route) =>
        route.fulfill({
            json: {
                success: true,
                data: {
                    total: 1,
                    hiddenCount: 0,
                    items: [
                        {
                            id: 'attention-1',
                            type: 'student_missing_pkk',
                            priority: 'todo',
                            title: 'Brak numeru PKK',
                            description: 'Uzupełnij dane kursanta.',
                            entityId: 'student-1',
                            entityLabel: 'Jan Kursant',
                            dueDate: null,
                            actionTo: '/manager/students/student-1',
                        },
                    ],
                },
            },
        }),
    );
    await page.route(
        '**/api/driving-schools/school-1/availability/slots?*',
        (route) =>
            route.fulfill({
                json: {
                    success: true,
                    data: {
                        total: 1,
                        slots: [
                            {
                                date: formatDateKey(tomorrow),
                                startTime: '10:00',
                                endTime: '11:00',
                                instructorId: 'instructor-1',
                                instructorFirstName: 'Anna',
                                instructorLastName: 'Nowak',
                            },
                        ],
                    },
                },
            }),
    );
    await page.route('**/api/courses?*', (route) =>
        route.fulfill({ json: { success: true, data: [] } }),
    );
}

test.describe('UI: pulpit zależny od roli', () => {
    test('pokazuje managerowi skróty, sprawy i responsywną dostępność', async ({
        baseURL,
        context,
        page,
    }) => {
        await authenticateMockUser(context, baseURL!, 'MANAGER');
        await mockManagerDashboard(page);
        await page.setViewportSize({ width: 390, height: 844 });

        await page.goto('/');
        await waitForNuxtHydration(page);

        await expect(
            page.getByRole('heading', { name: /Witaj, Jan Kierownik/ }),
        ).toBeVisible();
        await expect(
            page.getByRole('link', { name: /Harmonogram/ }),
        ).toBeVisible();
        await expect(
            page.getByRole('heading', { name: 'Wymaga uwagi' }),
        ).toBeVisible();
        await expect(
            page.getByRole('heading', { name: 'Wolne terminy instruktorów' }),
        ).toBeVisible();
        await expect(
            page.getByRole('tablist', { name: 'Wybierz dzień tygodnia' }),
        ).toBeVisible();

        const hasHorizontalOverflow = await page.evaluate(
            () => document.documentElement.scrollWidth > window.innerWidth,
        );

        expect(hasHorizontalOverflow).toBe(false);

        await page.setViewportSize({ width: 1440, height: 1000 });
        await expect(
            page.getByRole('grid', {
                name: /Wolne terminy instruktorów/,
            }),
        ).toBeVisible();
        expect(
            await page.evaluate(
                () => document.documentElement.scrollWidth > window.innerWidth,
            ),
        ).toBe(false);
    });

    test('pokazuje kursantowi plan, postęp i rozliczenia', async ({
        baseURL,
        context,
        page,
    }) => {
        await authenticateMockUser(context, baseURL!, 'STUDENT');
        await page.goto('/');
        await waitForNuxtHydration(page);

        await expect(
            page.getByRole('heading', { name: /Witaj, Kamil Kursant/ }),
        ).toBeVisible();
        await expect(
            page.getByRole('heading', { name: 'Najbliższe zajęcia' }),
        ).toBeVisible();
        await expect(
            page.getByRole('link', { name: 'Rezerwuj jazdę' }),
        ).toBeVisible();
        await expect(page.getByText('Postęp kursu')).toBeVisible();
        await expect(page.getByText('Do opłacenia')).toBeVisible();
    });

    test('pokazuje instruktorowi plan dnia i opinie', async ({
        baseURL,
        context,
        page,
    }) => {
        await authenticateMockUser(context, baseURL!, 'INSTRUCTOR');
        await page.goto('/');
        await waitForNuxtHydration(page);

        await expect(
            page.getByRole('heading', { name: /Witaj, Jan Instruktor/ }),
        ).toBeVisible();
        await expect(
            page.getByRole('heading', { name: 'Najbliższe zajęcia' }),
        ).toBeVisible();
        await expect(
            page.getByRole('heading', { name: 'Szybki dostęp' }),
        ).toBeVisible();
        await expect(page.getByText('Średnia ocen')).toBeVisible();
        await expect(
            page.getByRole('link', { name: /Mój terminarz/ }),
        ).toBeVisible();
    });
});
