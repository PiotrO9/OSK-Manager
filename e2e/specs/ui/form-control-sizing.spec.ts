import { expect, test, type Locator, type Page } from '@playwright/test';
import { authenticateMockUser } from '../../support/mockAuth';

async function measureControl(control: Locator) {
    await expect(control).toBeVisible();

    return control.evaluate((element) => {
        const bounds = element.getBoundingClientRect();
        const style = getComputedStyle(element);

        return {
            height: bounds.height,
            width: bounds.width,
            padding: style.padding,
            fontSize: style.fontSize,
            lineHeight: style.lineHeight,
            paddingLeft: style.paddingLeft,
        };
    });
}

async function selectDateAction(page: Page, date: Locator, action: string) {
    await date.click();
    const panel = page.locator(
        `[id="${await date.getAttribute('aria-controls')}"]`,
    );

    await panel.getByRole('button', { name: action, exact: true }).click();
    await expect(panel).toBeHidden();
}

const school = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'OSK Testowa',
    city: 'Warszawa',
};

async function prepareSchool(page: Page) {
    await page.route('**/api/driving-schools', (route) =>
        route.fulfill({ json: { success: true, data: [school] } }),
    );
    await page.route('**/api/driving-schools/default', (route) =>
        route.fulfill({ json: { success: true, data: school } }),
    );
    await page.route('**/api/course-types', (route) =>
        route.fulfill({ json: { success: true, data: [] } }),
    );
}

test.describe('UI: form control sizing', () => {
    test.describe.configure({ timeout: 120_000 });
    test.beforeEach(async ({ context, baseURL }) => {
        await authenticateMockUser(context, baseURL!, 'MANAGER');
    });

    for (const theme of ['light', 'dark']) {
        test(`aligns standard fields at responsive boundaries in ${theme} mode`, async ({
            page,
        }, testInfo) => {
            await page.addInitScript((mode) => {
                localStorage.setItem('osk-manager-color-mode', mode);
            }, theme);
            await page.goto('/system-projektowy');
            await page.locator('html[data-app-ready="true"]').waitFor();

            const measurements = [];

            for (const width of [1440, 390, 639, 640, 767, 768, 320]) {
                await page.setViewportSize({ width, height: 1000 });
                const expectedHeight = width < 640 ? 44 : 40;

                for (const id of [
                    'ds-name',
                    'ds-status',
                    'ds-birth-date',
                    'ds-start-time',
                    'ds-exam-date',
                    'ds-lesson-start',
                    'ds-lesson-start-time',
                    'ds-picker-date-range',
                    'ds-invalid',
                    'ds-readonly',
                    'ds-disabled',
                ]) {
                    const geometry = await measureControl(
                        page.locator(`#${id}`),
                    );

                    measurements.push({ width, id, ...geometry });
                    expect
                        .soft(geometry.height, `${id}, viewport ${width}`)
                        .toBeCloseTo(expectedHeight, 0);
                    expect.soft(geometry.paddingLeft, id).toBe('12px');
                }

                for (const size of ['default', 'touch', 'compact', 'sm']) {
                    const expectedVariantHeight =
                        size === 'sm'
                            ? 32
                            : size === 'touch' || width < 640
                              ? 44
                              : size === 'compact'
                                ? 36
                                : 40;
                    const fields = page.locator(
                        `[data-control-example="${size}"] [data-control-size]`,
                    );

                    await expect(fields).toHaveCount(4);

                    for (const field of await fields.all()) {
                        const geometry = await measureControl(field);

                        expect
                            .soft(geometry.height, `${size}, ${width}`)
                            .toBeCloseTo(expectedVariantHeight, 0);
                    }
                }

                const overflows = await page
                    .locator('[aria-label="Kontrolki formularza"]')
                    .evaluate((section) =>
                        [
                            ...section.querySelectorAll<HTMLElement>(
                                '[data-control-size]',
                            ),
                        ]
                            .filter((field) => {
                                const bounds = field.getBoundingClientRect();

                                return (
                                    bounds.width > 0 &&
                                    bounds.right > innerWidth + 1
                                );
                            })
                            .map((field) => field.id),
                    );

                expect.soft(overflows, `overflow at ${width}`).toEqual([]);
            }

            await testInfo.attach('control-measurements', {
                body: JSON.stringify(measurements, null, 2),
                contentType: 'application/json',
            });
            await page
                .locator('[aria-label="Kontrolki formularza"]')
                .screenshot({
                    path: testInfo.outputPath(`form-controls-${theme}.png`),
                });
        });
    }

    for (const width of [1440, 390]) {
        test(`aligns vehicle and instructor forms at ${width}px`, async ({
            page,
        }) => {
            await prepareSchool(page);
            await page.setViewportSize({ width, height: 1000 });

            for (const screen of [
                {
                    route: '/pojazdy/dodaj',
                    fields: [
                        'vehicle-name',
                        'vehicle-registration',
                        'vehicle-inspection',
                        'vehicle-insurance',
                        'vehicle-model-year',
                        'vehicle-mileage',
                    ],
                },
                {
                    route: '/menedzer/instruktorzy/dodaj',
                    fields: [
                        'instructor-form-email',
                        'instructor-form-firstName',
                        'instructor-form-birthDate',
                    ],
                },
            ]) {
                await page.goto(screen.route);

                for (const id of screen.fields) {
                    const geometry = await measureControl(
                        page.locator(`#${id}`),
                    );

                    expect(geometry.height, id).toBe(width < 640 ? 44 : 40);
                }
            }
        });
    }

    test('aligns search and select across student and vehicle toolbar breakpoints', async ({
        page,
    }) => {
        await prepareSchool(page);
        await page.route('**/api/vehicles?*', (route) =>
            route.fulfill({
                json: {
                    success: true,
                    data: { vehicles: [], defaultVehicleId: null },
                },
            }),
        );

        for (const route of ['/menedzer/kursanci', '/pojazdy']) {
            await page.goto(route);
            const search = page.getByRole('searchbox').first();
            const select = route.includes('kursanci')
                ? page.locator('#students-page-course-filter')
                : page.getByRole('combobox', {
                      name: 'Filtr dostępności pojazdu',
                  });

            for (const width of [1440, 390, 639, 640, 767, 768, 320]) {
                await page.setViewportSize({ width, height: 1000 });
                const inputGeometry = await measureControl(search);
                const selectGeometry = await measureControl(select);

                expect(inputGeometry.height, `${route}, ${width}`).toBe(
                    width < 640 ? 44 : 40,
                );
                expect(selectGeometry.height, `${route}, ${width}`).toBe(
                    inputGeometry.height,
                );
            }
        }
    });

    test('keeps date, time, range and week panels inside a 320px viewport', async ({
        page,
    }) => {
        await page.setViewportSize({ width: 320, height: 900 });
        await page.goto('/system-projektowy');
        await page.locator('html[data-app-ready="true"]').waitFor();
        const section = page.locator('[aria-label="Kontrolki formularza"]');
        const triggers = [
            page.locator('#ds-picker-date-long-term'),
            page.locator('#ds-picker-time-basic'),
            page.locator('#ds-picker-date-range'),
            section.getByRole('button', {
                name: 'Wybierz tydzień w kalendarzu',
                exact: true,
            }),
        ];

        for (const trigger of triggers) {
            await trigger.click();
            await expect(trigger).toHaveAttribute('aria-expanded', 'true');
            const panel = page.locator(
                `[id="${await trigger.getAttribute('aria-controls')}"]`,
            );

            await expect(panel).toBeVisible();
            await panel.evaluate(async (element) => {
                await Promise.all(
                    element
                        .getAnimations()
                        .map((animation) => animation.finished.catch(() => {})),
                );
            });
            const geometry = await panel.evaluate((element) => ({
                left: element.getBoundingClientRect().left,
                right: element.getBoundingClientRect().right,
                overflow: element.scrollWidth - element.clientWidth,
            }));

            expect.soft(geometry.left).toBeGreaterThanOrEqual(0);
            expect.soft(geometry.right).toBeLessThanOrEqual(320);
            expect.soft(geometry.overflow).toBeLessThanOrEqual(1);
            await page.keyboard.press('Escape');
            await expect(panel).toBeHidden();
        }
    });

    for (const width of [1440, 390]) {
        test(`aligns inline save actions with course and vehicle fields at ${width}px`, async ({
            page,
        }) => {
            test.setTimeout(45_000);
            await prepareSchool(page);
            await page.setViewportSize({ width, height: 1000 });
            const course = {
                id: '123e4567-e89b-12d3-a456-426614174003',
                schoolId: school.id,
                name: 'Kurs testowy',
                category: 'B',
                type: 'THEORY_GROUP',
                totalHours: 30,
                capacity: 24,
                instructor: null,
            };

            await page.route('**/api/courses?*', (route) =>
                route.fulfill({
                    json: { success: true, data: { courses: [course] } },
                }),
            );
            await page.route(`**/api/courses/${course.id}`, (route) =>
                route.fulfill({ json: { success: true, data: { course } } }),
            );
            await page.route('**/api/instructors?*', (route) =>
                route.fulfill({ json: { success: true, data: [] } }),
            );
            await page.goto('/menedzer/kursy');
            await page.locator('html[data-app-ready="true"]').waitFor();
            await page
                .locator(`a[href="/menedzer/kursy/${course.id}"]`)
                .filter({ visible: true })
                .first()
                .click();
            await page
                .getByRole('tab', { name: 'Instruktor', exact: true })
                .click();
            const select = page.locator('#course-detail-instructor-select');
            const saveInstructor = page.getByRole('button', {
                name: 'Zapisz',
                exact: true,
            });

            expect((await measureControl(select)).height).toBe(
                width < 640 ? 44 : 40,
            );
            expect((await measureControl(saveInstructor)).height).toBe(
                width < 640 ? 44 : 40,
            );

            const vehicle = {
                id: '123e4567-e89b-12d3-a456-426614174002',
                schoolId: school.id,
                name: 'Pojazd testowy',
                registrationNumber: 'WA1234',
                status: 'UNAVAILABLE',
                unavailableUntil: '2030-01-01',
                supportedCourseTypes: [],
                isDefault: false,
            };

            await page.route('**/api/vehicles?*', (route) =>
                route.fulfill({
                    json: {
                        success: true,
                        data: { vehicles: [vehicle], defaultVehicleId: null },
                    },
                }),
            );
            await page.goto('/pojazdy');
            await page.locator('html[data-app-ready="true"]').waitFor();
            await page
                .getByRole('tab', { name: 'Status', exact: true })
                .click();
            const date = page
                .locator(`button[id*="-date-${vehicle.id}"]`)
                .filter({ visible: true })
                .first();
            const saveDate = date
                .locator('..')
                .getByRole('button', { name: 'Zapisz', exact: true });

            expect((await measureControl(date)).height).toBe(
                width < 640 ? 44 : 36,
            );
            expect((await measureControl(saveDate)).height).toBe(
                width < 640 ? 44 : 36,
            );
        });
    }

    for (const width of [1440, 390]) {
        test(`preserves ISO dates in student and security log filters at ${width}px`, async ({
            page,
        }) => {
            test.setTimeout(45_000);
            await prepareSchool(page);
            const todayIso = new Intl.DateTimeFormat('sv-SE', {
                timeZone: 'Europe/Warsaw',
            }).format(new Date());
            const todayLabel = new Intl.DateTimeFormat('pl-PL', {
                timeZone: 'Europe/Warsaw',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
            }).format(new Date());
            const serializedRequests: string[] = [];

            page.on('request', (request) => {
                const filters = new URL(request.url()).searchParams.get(
                    'filters',
                );

                if (filters) serializedRequests.push(filters);
            });
            await page.setViewportSize({ width, height: 1000 });
            await page.route('**/api/manager/security-logs?*', (route) =>
                route.fulfill({
                    json: {
                        success: true,
                        data: {
                            items: [],
                            collectionStatus: 'OK',
                            pageInfo: {
                                nextCursor: null,
                                previousCursor: null,
                                hasNextPage: false,
                                hasPreviousPage: false,
                            },
                        },
                    },
                }),
            );

            for (const config of [
                {
                    route: '/menedzer/kursanci',
                    field: 'student-advanced-filter-field',
                    label: 'Data dodania',
                    condition: 'student-advanced-filter-condition',
                    between: 'pomiędzy',
                    from: 'student-advanced-filter-date-from',
                    to: 'student-advanced-filter-date-to',
                },
                {
                    route: '/menedzer/logi-bezpieczenstwa',
                    field: 'security-log-filter-field',
                    label: 'Data zdarzenia',
                    condition: 'security-log-filter-operator',
                    between: 'Pomiędzy',
                    from: 'security-log-filter-value',
                    to: 'security-log-filter-date-to',
                },
            ]) {
                await page.goto(config.route);
                await page
                    .getByRole('button', { name: /^Dodaj filtr/ })
                    .filter({ visible: true })
                    .click();
                await page.locator(`#${config.field}`).click();
                await page
                    .getByRole('option', { name: config.label, exact: true })
                    .click();
                await page.locator(`#${config.condition}`).click();
                await page
                    .getByRole('option', { name: config.between, exact: true })
                    .click();

                for (const id of [config.from, config.to]) {
                    const date = page.locator(`#${id}`);

                    expect((await measureControl(date)).height).toBe(44);
                    await selectDateAction(page, date, 'Dzisiaj');
                    await expect(date).toContainText(todayLabel);
                }

                // Clearing must remain possible after migrating from native date inputs.
                await selectDateAction(
                    page,
                    page.locator(`#${config.to}`),
                    'Wyczyść',
                );
                await expect(page.locator(`#${config.to}`)).toHaveText(
                    'Wybierz datę',
                );
                await selectDateAction(
                    page,
                    page.locator(`#${config.to}`),
                    'Dzisiaj',
                );
                const previousRequestCount = serializedRequests.length;

                await page
                    .getByRole('button', {
                        name: 'Zastosuj filtr',
                        exact: true,
                    })
                    .click();
                await expect
                    .poll(() => serializedRequests.length)
                    .toBeGreaterThan(previousRequestCount);
                const serialized = serializedRequests.at(-1)!;
                const decoded = JSON.parse(serialized);
                const rules = Array.isArray(decoded) ? decoded : decoded.rules;

                expect(rules).toContainEqual({
                    field: config.route.includes('kursanci')
                        ? 'createdAt'
                        : 'occurredAt',
                    operator: 'between',
                    value: config.route.includes('kursanci')
                        ? [todayIso, todayIso]
                        : { from: todayIso, to: todayIso },
                });
            }
        });
    }
});
