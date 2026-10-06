import { expect, test } from '@playwright/test';
import { authenticateMockUser } from '../../support/mockAuth';

test.describe('UI: design system', () => {
    test('preserves notes editing and saving on the actual student detail page', async ({
        page,
    }) => {
        let notes = 'Notatka przed zmianą';
        let saves = 0;

        await page.route('**/api/students/t01-student**', async (route) => {
            const path = new URL(route.request().url()).pathname;

            if (route.request().method() === 'PATCH') {
                notes = route.request().postDataJSON().notes;
                saves += 1;
                await route.fulfill({
                    json: { success: true, data: { notes } },
                });
            } else if (path.endsWith('/process-status')) {
                await route.fulfill({
                    json: { success: true, data: { steps: [] } },
                });
            } else if (path.endsWith('/payments')) {
                await route.fulfill({
                    json: {
                        success: true,
                        data: {
                            payments: [],
                            summary: {
                                paidAmount: '0.00',
                                unpaidAmount: '0.00',
                                overdueAmount: '0.00',
                                overdueCount: 0,
                                nextDueDate: null,
                                currency: 'PLN',
                            },
                        },
                    },
                });
            } else {
                await route.fulfill({
                    json: {
                        success: true,
                        data: {
                            id: 't01-student',
                            userId: 't01-student',
                            schoolId: 't01-school',
                            firstName: 'Anna',
                            lastName: 'Testowa',
                            email: 'anna@example.com',
                            pkkNumber: null,
                            notes,
                            courses: [],
                        },
                    },
                });
            }
        });
        await page.route('**/api/**/schedule**', (route) =>
            route.fulfill({ json: { success: true, data: [] } }),
        );
        await page.goto('/manager/students/t01-student');
        const edit = page.getByRole('button', {
            name: 'Edytuj notatkę o kursancie',
            exact: true,
        });

        await edit.click();
        const field = page.getByRole('textbox', {
            name: 'Treść notatki o kursancie',
            exact: true,
        });

        await expect(field).toHaveValue(notes);
        await field.fill('Szkic do anulowania');
        await field.press('Escape');
        await expect(field).toBeHidden();
        expect(saves).toBe(0);
        await edit.click();
        await field.fill('Notatka po zmianie');
        await page
            .getByRole('button', { name: 'Zapisz notatkę', exact: true })
            .click();
        await expect(
            page.getByText('Notatka po zmianie', { exact: true }),
        ).toBeVisible();
        expect(saves).toBe(1);
    });

    test.beforeEach(async ({ context, baseURL }) => {
        await authenticateMockUser(context, baseURL!, 'MANAGER');
    });

    test('opens legacy section links and supports keyboard tabs without domain requests', async ({
        page,
    }) => {
        const errors: string[] = [];
        const domainRequests: string[] = [];

        page.on('pageerror', (error) => errors.push(error.message));
        page.on('console', (message) => {
            if (message.type() === 'error') errors.push(message.text());
        });
        page.on('request', (request) => {
            if (
                /\/api\/(students|courses|payments|lessons|driving-schools|instructors|manager|me\/(courses|payments|lessons))/.test(
                    request.url(),
                )
            )
                domainRequests.push(request.url());
        });
        await page.goto('/design-system?section=patterns');
        await page.locator('html[data-app-ready="true"]').waitFor();
        const tabs = page.getByRole('tablist', {
            name: 'Wybierz wzorzec ekranu',
        });
        const students = tabs.getByRole('tab', {
            name: 'Lista kursantów',
            exact: true,
        });

        await students.focus();
        await page.keyboard.press('ArrowRight');
        await expect(
            tabs.getByRole('tab', { name: 'Profil kursanta', exact: true }),
        ).toBeFocused();
        await expect(
            page.getByRole('heading', { name: 'Anna Kowalska', exact: true }),
        ).toBeVisible();
        await page.getByRole('tab', { name: 'Płatności', exact: true }).click();
        await expect(
            page.getByRole('button', { name: 'Opłacona', exact: true }).first(),
        ).toBeVisible();
        await page
            .getByRole('button', { name: 'Opłacona', exact: true })
            .first()
            .click();
        await tabs
            .getByRole('tab', { name: 'Rezerwacja kursanta', exact: true })
            .click();
        await page
            .getByRole('group', { name: 'Scenariusz rezerwacji kursanta' })
            .getByRole('button', { name: 'Potwierdzenie', exact: true })
            .click();
        await expect(page.getByRole('dialog')).toBeVisible();
        await page.keyboard.press('Escape');
        await expect(page.getByRole('dialog')).toBeHidden();
        await page
            .getByRole('navigation', { name: 'Sekcje design systemu' })
            .getByRole('link', { name: /Fundamenty/ })
            .click();
        await expect(page).toHaveURL(/#foundations$/);
        await page.reload();
        await expect(page.locator('#foundations')).toBeVisible();
        await expect(page.locator('main')).toHaveCount(1);
        expect(domainRequests).toEqual([]);
        expect(errors).toEqual([]);
    });

    test('keeps data, loading, empty and error summaries consistent', async ({
        page,
    }) => {
        await page.goto('/design-system#patterns');
        await page.locator('html[data-app-ready="true"]').waitFor();
        await page
            .getByRole('tab', { name: 'Moje opłaty', exact: true })
            .click();
        const scenario = page.getByRole('group', { name: 'Scenariusz opłat' });

        await expect(page.getByText(/1 zaległa/)).toBeVisible();
        await scenario
            .getByRole('button', { name: 'Ładowanie', exact: true })
            .click();
        await expect(page.getByText(/1 zaległa/)).toBeHidden();
        await scenario
            .getByRole('button', { name: 'Błąd', exact: true })
            .click();
        await expect(
            page.getByRole('region', { name: 'Filtrowanie opłat' }),
        ).toBeHidden();
        await scenario
            .getByRole('button', { name: 'Brak danych', exact: true })
            .click();
        await expect(
            page.getByText('Brak opłat w tym widoku', { exact: true }),
        ).toBeVisible();
        await expect(
            scenario.getByRole('button', { name: 'Brak danych', exact: true }),
        ).toHaveAttribute('aria-pressed', 'true');
    });

    test('supports the skip link, mobile navigation and reflow at 200 percent', async ({
        page,
    }) => {
        await page.setViewportSize({ width: 390, height: 844 });
        await page.goto('/design-system');
        await page.locator('html[data-app-ready="true"]').waitFor();
        await page.keyboard.press('Tab');
        const skip = page.getByRole('link', { name: 'Przejdź do treści' });

        await expect(skip).toBeFocused();
        await page.keyboard.press('Enter');
        await expect(page.locator('main')).toBeFocused();
        const menu = page.getByRole('button', {
            name: 'Sekcje design systemu',
            exact: true,
        });

        await menu.click();
        await page
            .getByRole('dialog')
            .getByRole('link', { name: 'Wzorce ekranów', exact: true })
            .click();
        await expect(page.getByRole('dialog')).toBeHidden();
        await expect(page).toHaveURL(/#patterns$/);
        await expect(menu).toBeFocused();
        await expect(menu).toBeInViewport();
        await menu.click();
        await page.keyboard.press('Escape');
        await expect(menu).toBeFocused();
        // Browser zoom reduces the CSS viewport and updates media queries.
        // 720 CSS pixels checks the reflow of a 1440 px window at 200 percent.
        await page.setViewportSize({ width: 720, height: 450 });

        for (const name of [
            'Lista kursantów',
            'Profil kursanta',
            'Rezerwacja kursanta',
            'Rezerwacja managera',
            'Moje opłaty',
        ]) {
            await page
                .getByRole('tablist', { name: 'Wybierz wzorzec ekranu' })
                .getByRole('tab', { name, exact: true })
                .click();
            expect(
                await page.evaluate(
                    () =>
                        document.documentElement.scrollWidth >
                        window.innerWidth,
                ),
            ).toBe(false);
        }

        expect(
            await page.evaluate(async () => {
                await document.fonts.load('400 16px Satoshi');

                return (
                    document.fonts.check('400 16px Satoshi') &&
                    [...document.fonts].some(
                        (font) =>
                            font.family === 'Satoshi' &&
                            font.status === 'loaded',
                    )
                );
            }),
        ).toBe(true);
    });

    test('shows each pattern at narrow widths and both themes with actual CSS colors', async ({
        page,
    }, testInfo) => {
        await page.goto('/design-system');
        await page.locator('html[data-app-ready="true"]').waitFor();

        for (const width of [1440, 1024, 768, 390]) {
            await page.setViewportSize({ width, height: 900 });

            for (const dark of [false, true]) {
                await page.evaluate(
                    (value) =>
                        document.documentElement.classList.toggle(
                            'dark',
                            value,
                        ),
                    dark,
                );
                const color = page
                    .locator('#foundations')
                    .getByRole('button')
                    .filter({ hasText: '--background' });

                await expect(color).toContainText(dark ? '#121416' : '#f8fafc');

                for (const name of [
                    'Lista kursantów',
                    'Profil kursanta',
                    'Rezerwacja kursanta',
                    'Rezerwacja managera',
                    'Moje opłaty',
                ]) {
                    await page
                        .getByRole('tablist', {
                            name: 'Wybierz wzorzec ekranu',
                        })
                        .getByRole('tab', { name, exact: true })
                        .click();
                    expect(
                        await page.evaluate(
                            () =>
                                document.documentElement.scrollWidth >
                                window.innerWidth,
                        ),
                    ).toBe(false);

                    if (width === 390 || width === 1440) {
                        await page.locator('#patterns').screenshot({
                            path: testInfo.outputPath(
                                `${width}-${dark ? 'dark' : 'light'}-${name}.png`,
                            ),
                        });
                    }

                    if (width === 390 && name === 'Lista kursantów') {
                        await page
                            .getByRole('button', {
                                name: 'Następna strona listy kursantów',
                                exact: true,
                            })
                            .click();
                        await expect(
                            page
                                .getByRole('region', {
                                    name: 'Lista kursantów CRM',
                                    exact: true,
                                })
                                .getByText(
                                    'Aleksandra Wojciechowska-Kaczmarek',
                                    { exact: true },
                                )
                                .filter({ visible: true }),
                        ).toBeVisible();
                        expect(
                            await page.evaluate(
                                () =>
                                    document.documentElement.scrollWidth >
                                    window.innerWidth,
                            ),
                        ).toBe(false);
                    }

                    if (width === 390 && name === 'Rezerwacja kursanta') {
                        await page
                            .getByRole('group', {
                                name: 'Scenariusz rezerwacji kursanta',
                            })
                            .getByRole('button', {
                                name: 'Potwierdzenie',
                                exact: true,
                            })
                            .click();
                        const dialog = page.getByRole('dialog');

                        await expect(dialog).toBeVisible();
                        await expect(dialog).toHaveCSS(
                            'background-color',
                            dark ? 'rgb(18, 20, 22)' : 'rgb(248, 250, 252)',
                        );
                        const bounds = await dialog.boundingBox();

                        expect(bounds!.x).toBeGreaterThanOrEqual(0);
                        expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(
                            width,
                        );
                        await page.keyboard.press('Escape');
                        await expect(dialog).toBeHidden();
                    }
                }
            }
        }
    });
});
