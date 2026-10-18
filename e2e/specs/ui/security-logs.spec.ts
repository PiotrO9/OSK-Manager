import { expect, test, type Page } from '@playwright/test';
import { authenticateMockUser } from '../../support/mockAuth';

const schoolAId = '11111111-1111-4111-8111-111111111111';
const schoolBId = '22222222-2222-4222-8222-222222222222';
const denialId = '33333333-3333-4333-8333-333333333333';
const loginId = '44444444-4444-4444-8444-444444444444';
const otherSchoolEventId = '55555555-5555-4555-8555-555555555555';
const occurredAt = new Date().toISOString();

const schools = [
    { id: schoolAId, name: 'OSK Pierwsza', city: 'Warszawa' },
    { id: schoolBId, name: 'OSK Druga', city: 'Kraków' },
];

const denial = {
    id: denialId,
    occurredAt,
    type: 'ACCESS_DENIED',
    category: 'ACCESS',
    severity: 'WARNING',
    outcome: 'DENIED',
    reasonCode: 'ROLE_NOT_ALLOWED',
    operationCode: 'SECURITY_LOGS_LIST',
    operationLabel: 'Przeglądanie dziennika bezpieczeństwa',
    httpMethod: 'GET',
    routeTemplate: '/manager/security-logs',
    httpStatus: 403,
    actor: {
        visibility: 'KNOWN',
        userId: '66666666-6666-4666-8666-666666666666',
        displayName: 'Kamil Kursant',
        role: 'STUDENT',
    },
    target: null,
};

const login = {
    ...denial,
    id: loginId,
    type: 'LOGIN_SUCCEEDED',
    category: 'AUTH',
    severity: 'INFO',
    outcome: 'SUCCESS',
    reasonCode: null,
    operationCode: 'AUTH_LOGIN',
    operationLabel: 'Logowanie',
    httpMethod: 'POST',
    routeTemplate: '/auth/login',
    httpStatus: 200,
    actor: {
        visibility: 'KNOWN',
        userId: '77777777-7777-4777-8777-777777777777',
        displayName: 'Marta Manager',
        role: 'MANAGER',
    },
};

const otherSchoolEvent = {
    ...login,
    id: otherSchoolEventId,
    type: 'LOGIN_FAILED',
    outcome: 'FAILURE',
    severity: 'WARNING',
    operationLabel: 'Logowanie w drugiej OSK',
    httpStatus: 401,
};

function listItems(url: URL) {
    const rows =
        url.searchParams.get('schoolId') === schoolAId
            ? [denial, login]
            : [otherSchoolEvent];
    const view = url.searchParams.get('view');
    const search = url.searchParams.get('search')?.toLowerCase();
    const filters = JSON.parse(
        url.searchParams.get('filters') || '{"rules":[]}',
    ) as {
        rules: { field: string; operator: string; value?: string }[];
    };

    return rows.filter((item) => {
        if (view === 'access-denied' && item.type !== 'ACCESS_DENIED')
            return false;

        if (view === 'failed-logins' && item.type !== 'LOGIN_FAILED')
            return false;

        if (
            search &&
            !`${item.operationLabel} ${item.actor.displayName}`
                .toLowerCase()
                .includes(search)
        )
            return false;

        return filters.rules.every((rule) => {
            if (rule.field !== 'operationCode') return true;

            const matches = item.operationCode === rule.value;

            return rule.operator === 'isNot' ? !matches : matches;
        });
    });
}

async function mockSecurityLogApi(page: Page) {
    const listRequests: URL[] = [];

    await page.route('**/api/driving-schools', (route) =>
        route.fulfill({ json: { success: true, data: schools } }),
    );
    await page.route('**/api/driving-schools/default', (route) =>
        route.fulfill({ json: { success: true, data: schools[0] } }),
    );
    await page.route(
        /\/api\/manager\/security-logs\/[0-9a-f-]{36}\?/,
        (route) => {
            const eventId = new URL(route.request().url()).pathname
                .split('/')
                .pop();
            const item = [denial, login, otherSchoolEvent].find(
                (candidate) => candidate.id === eventId,
            );

            return route.fulfill({
                status: item ? 200 : 404,
                json: item
                    ? {
                          success: true,
                          data: { ...item, userAgent: 'Playwright' },
                      }
                    : { success: false, error: 'Nie znaleziono zdarzenia' },
            });
        },
    );
    await page.route('**/api/manager/security-logs?*', (route) => {
        const url = new URL(route.request().url());

        listRequests.push(url);

        return route.fulfill({
            json: {
                success: true,
                data: {
                    items: listItems(url),
                    pageInfo: {
                        nextCursor: null,
                        previousCursor: null,
                        hasNextPage: false,
                        hasPreviousPage: false,
                    },
                    collectionStatus: 'OK',
                },
            },
        });
    });

    return listRequests;
}

test.describe('UI: dziennik bezpieczeństwa', () => {
    test('gość trafia na logowanie, a kursant nie widzi strony ani linku', async ({
        baseURL,
        browser,
    }) => {
        const guestContext = await browser.newContext();
        const guestPage = await guestContext.newPage();

        await guestPage.goto(`${baseURL}/menedzer/logi-bezpieczenstwa`);
        await expect(guestPage).toHaveURL(/\/logowanie$/);
        await guestContext.close();

        const studentContext = await browser.newContext();

        await authenticateMockUser(studentContext, baseURL!, 'STUDENT');
        const studentPage = await studentContext.newPage();

        await studentPage.goto(`${baseURL}/menedzer/logi-bezpieczenstwa`);
        await expect(studentPage).toHaveURL(baseURL!);
        await expect(
            studentPage.getByRole('link', { name: /logów bezpieczeństwa/i }),
        ).toHaveCount(0);
        await studentContext.close();
    });

    test('manager widzi operację odmowy, szczegóły i filtruje po kodzie', async ({
        baseURL,
        context,
        page,
    }) => {
        await authenticateMockUser(context, baseURL!, 'MANAGER');
        const listRequests = await mockSecurityLogApi(page);
        const dialogWarnings: string[] = [];

        page.on('console', (message) => {
            if (
                message.type() === 'warning' &&
                message.text().includes('Missing `Description`')
            )
                dialogWarnings.push(message.text());
        });

        await page.goto('/menedzer/logi-bezpieczenstwa');
        await expect(
            page.getByRole('heading', { name: 'Logi bezpieczeństwa' }),
        ).toBeVisible();
        await expect(page.getByRole('table').getByRole('row')).toHaveCount(3);
        await page
            .getByRole('button', { name: /Szczegóły: Odmowa dostępu/ })
            .click();
        const detail = page.getByRole('dialog', {
            name: 'Szczegóły zdarzenia',
        });

        await expect(detail).toContainText('SECURITY_LOGS_LIST');
        await expect(detail).toContainText('ROLE_NOT_ALLOWED');
        expect(dialogWarnings).toEqual([]);
        await detail.getByRole('button', { name: 'Zamknij' }).click();

        await page.getByRole('button', { name: 'Odmowy dostępu' }).click();
        await expect(page.getByRole('table').getByRole('row')).toHaveCount(2);
        expect(listRequests.at(-1)?.searchParams.get('view')).toBe(
            'access-denied',
        );

        await page.getByRole('button', { name: /Dodaj filtr/ }).click();
        await page
            .getByRole('dialog', { name: /Dodaj filtr/ })
            .getByRole('combobox', { name: 'Pole' })
            .click();
        await page.getByRole('option', { name: 'Operacja' }).click();
        await page
            .getByRole('textbox', { name: 'Wartość' })
            .fill('SECURITY_LOGS_LIST');
        await page.getByRole('button', { name: 'Zastosuj filtr' }).click();
        await expect(
            page.getByRole('button', {
                name: 'Edytuj filtr: Operacja jest SECURITY_LOGS_LIST',
            }),
        ).toBeVisible();
        await expect(page.getByRole('table').getByRole('row')).toHaveCount(2);
        const lastFilters = JSON.parse(
            listRequests.at(-1)?.searchParams.get('filters') || '{}',
        );

        expect(lastFilters.rules).toContainEqual({
            field: 'operationCode',
            operator: 'is',
            value: 'SECURITY_LOGS_LIST',
        });

        await page
            .getByRole('searchbox', { name: 'Szukaj zdarzenia lub operacji' })
            .fill('bez trafienia');
        await expect
            .poll(() => listRequests.at(-1)?.searchParams.get('search'))
            .toBe('bez trafienia');
        await expect(page.getByText('Brak wyników')).toBeVisible();
    });

    test('zmiana OSK usuwa wpisy poprzedniej szkoły, także na telefonie', async ({
        baseURL,
        context,
        page,
    }) => {
        await page.setViewportSize({ width: 390, height: 844 });
        await authenticateMockUser(context, baseURL!, 'MANAGER');
        const listRequests = await mockSecurityLogApi(page);

        await page.goto('/menedzer/logi-bezpieczenstwa');
        const mobileList = page.getByRole('list', {
            name: 'Zdarzenia bezpieczeństwa',
        });

        await expect(mobileList).toContainText('Kamil Kursant');
        await page.getByRole('combobox', { name: /Aktualny ośrodek/ }).click();
        await page.getByRole('option', { name: /OSK Druga/ }).click();
        await expect(mobileList).toContainText('Logowanie w drugiej OSK');
        await expect(mobileList).not.toContainText('Kamil Kursant');
        expect(listRequests.at(-1)?.searchParams.get('schoolId')).toBe(
            schoolBId,
        );
    });
});
