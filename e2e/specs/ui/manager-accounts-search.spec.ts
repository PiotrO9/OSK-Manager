import { expect, test, type Page } from '@playwright/test';
import { authenticateMockUser } from '../../support/mockAuth';

const schoolId = '11111111-1111-4111-8111-111111111111';
const path =
    process.env.E2E_ROUTE_VARIANT === 'en'
        ? '/manager/accounts'
        : '/menedzer/konta';

function uuid(index: number) {
    return `33333333-3333-4333-8333-${String(index).padStart(12, '0')}`;
}

async function prepare(page: Page) {
    const accounts = Array.from({ length: 26 }, (_, index) => ({
        id: uuid(index),
        schoolId,
        firstName: `Imie${index}`,
        lastName: `Osoba${index}`,
        email: `osoba${index}@example.test`,
        phone: null,
        role: index >= 24 ? 'INSTRUCTOR' : 'STUDENT',
        isActive: index !== 2,
        deletedAt: index === 3 ? '2026-10-15T00:00:00.000Z' : null,
        instructorProfile: index >= 24 ? { id: uuid(index + 100) } : null,
        studentProfile: index < 24 ? { id: uuid(index + 100) } : null,
        accountActionsFor: [],
    }));
    const listQueries: URLSearchParams[] = [];

    await page.route('**/api/driving-schools', (route) =>
        route.fulfill({
            json: {
                success: true,
                data: [
                    {
                        id: schoolId,
                        name: 'OSK Test',
                        city: 'Gdańsk',
                        address: null,
                        isDefault: true,
                    },
                ],
            },
        }),
    );
    await page.route('**/api/driving-schools/default', (route) =>
        route.fulfill({
            json: {
                success: true,
                data: { id: schoolId, name: 'OSK Test', isDefault: true },
            },
        }),
    );
    await page.route('**/api/manager/accounts**', async (route) => {
        const url = new URL(route.request().url());

        if (url.pathname === '/api/manager/accounts') {
            const query = url.searchParams;

            listQueries.push(query);
            let rows = accounts.filter(
                (account) =>
                    !query.get('role') || account.role === query.get('role'),
            );

            if (query.get('profileId'))
                rows = rows.filter(
                    (account) =>
                        account.instructorProfile?.id ===
                        query.get('profileId'),
                );

            for (const term of query
                .get('search')
                ?.trim()
                .toLowerCase()
                .split(/\s+/)
                .filter(Boolean) ?? [])
                rows = rows.filter((account) =>
                    `${account.firstName} ${account.lastName} ${account.email}`
                        .toLowerCase()
                        .includes(term),
                );

            const pageNumber = Number(query.get('page'));
            const limit = Number(query.get('limit'));

            await route.fulfill({
                json: {
                    success: true,
                    data: {
                        items: rows.slice(
                            (pageNumber - 1) * limit,
                            pageNumber * limit,
                        ),
                        total: rows.length,
                        page: pageNumber,
                        limit,
                    },
                },
            });

            return;
        }

        const account = accounts.find(
            (item) => url.pathname.split('/')[4] === item.id,
        );

        if (!account) {
            await route.fulfill({
                status: 404,
                json: { success: false, error: 'Account not found' },
            });

            return;
        }

        if (route.request().method() === 'PATCH')
            Object.assign(account, route.request().postDataJSON());

        await route.fulfill({ json: { success: true, data: account } });
    });

    return { accounts, listQueries };
}

test.beforeEach(async ({ context, baseURL }) => {
    await authenticateMockUser(context, baseURL!, 'MANAGER');
});

for (const width of [1440, 390]) {
    test(`server pagination, search and independent editing at ${width}px`, async ({
        page,
    }, testInfo) => {
        await page.setViewportSize({ width, height: 900 });
        const { accounts, listQueries } = await prepare(page);
        const errors: string[] = [];

        page.on('pageerror', (error) => errors.push(error.message));
        await page.goto(
            `${path}?schoolId=${schoolId}&userId=${accounts[23]!.id}`,
        );
        await expect(page.getByLabel('Imię', { exact: true })).toHaveValue(
            'Imie23',
        );
        const list = page.getByLabel('Osoby z wybranego ośrodka');

        await expect(list.getByRole('button')).toHaveCount(20);
        await expect(page.getByText('Strona 1 z 2 · Konta: 26')).toBeVisible();
        await page.getByLabel('Imię', { exact: true }).fill('Niezapisane');
        await page
            .getByRole('button', { name: 'Następna strona listy kont' })
            .click();
        await expect(list.getByRole('button')).toHaveCount(6);
        await expect(page.getByLabel('Imię', { exact: true })).toHaveValue(
            'Niezapisane',
        );
        await page
            .getByRole('button', { name: 'Instruktorzy', exact: true })
            .click();
        await expect(list.getByRole('button')).toHaveCount(2);
        await expect(page.getByText('Strona 1 z 1 · Konta: 2')).toBeVisible();
        expect(listQueries.at(-1)?.get('role')).toBe('INSTRUCTOR');
        expect(listQueries.at(-1)?.get('page')).toBe('1');
        await page.getByLabel('Szukaj osoby').fill('nieistniejaca');
        await expect(
            page.getByText('Brak kont pasujących do wyszukiwania.'),
        ).toBeVisible();
        await expect(page.getByLabel('Imię', { exact: true })).toHaveValue(
            'Niezapisane',
        );
        await page.getByLabel('Szukaj osoby').fill('osoba25@example.test');
        await expect(list.getByRole('button')).toHaveCount(1);
        expect(listQueries.at(-1)?.get('search')).toBe('osoba25@example.test');
        await page
            .getByRole('button', { name: 'Zapisz dane', exact: true })
            .click();
        await expect(
            page.getByText('Dane zapisano.', { exact: true }),
        ).toBeVisible();
        await expect(page.getByLabel('Imię', { exact: true })).toHaveValue(
            'Niezapisane',
        );
        expect(
            listQueries.every(
                (query) =>
                    query.has('page') && Number(query.get('limit')) <= 20,
            ),
        ).toBe(true);
        expect(
            await page.evaluate(
                () => document.documentElement.scrollWidth <= innerWidth,
            ),
        ).toBe(true);
        expect(errors).toEqual([]);
        await page.screenshot({
            path: testInfo.outputPath(`accounts-${width}.png`),
            fullPage: true,
        });
    });
}

test('legacy instructor profile link opens account outside the first page', async ({
    page,
}) => {
    const { accounts, listQueries } = await prepare(page);

    await page.goto(
        `${path}?schoolId=${schoolId}&profileId=${accounts[25]!.instructorProfile!.id}`,
    );
    await expect(page.getByLabel('Imię', { exact: true })).toHaveValue(
        'Imie25',
    );
    await expect(
        page.getByLabel('Osoby z wybranego ośrodka').getByRole('button'),
    ).toHaveCount(20);
    expect(
        listQueries.some(
            (query) =>
                query.get('profileId') ===
                    accounts[25]!.instructorProfile!.id &&
                query.get('limit') === '1',
        ),
    ).toBe(true);
});
