import { expect, test } from '@playwright/test';
import { authenticateMockUser } from '../../support/mockAuth';

const studentUserId = 'payment-test-student';
const schoolId = 'payment-test-school';
const paymentPlanId = 'payment-test-plan';

const existingPayment = {
    id: 'existing-payment',
    courseId: 'course-1',
    courseName: 'Kurs B',
    paymentPlanId,
    amount: '100.00',
    currency: 'PLN',
    status: 'UNPAID',
    date: null,
    dueDate: null,
    paidAt: null,
    method: null,
};

const summary = {
    paidAmount: '0.00',
    unpaidAmount: '100.00',
    overdueAmount: '0.00',
    overdueCount: 0,
    nextDueDate: null,
    currency: 'PLN',
};

test('BUG-04 preserves a payment draft after failure and clears it after retry', async ({
    context,
    page,
    baseURL,
}) => {
    test.setTimeout(60_000);
    await authenticateMockUser(context, baseURL!, 'MANAGER');

    await page.route(`**/api/students/${studentUserId}`, (route) =>
        route.fulfill({
            json: {
                success: true,
                data: {
                    id: 'student-profile-1',
                    userId: studentUserId,
                    schoolId,
                    firstName: 'Anna',
                    lastName: 'Kowalska',
                    email: 'anna@example.com',
                    avatarUrl: null,
                    pkkNumber: null,
                    notes: null,
                    courses: [],
                },
            },
        }),
    );

    await page.route(`**/api/students/${studentUserId}/payments?*`, (route) =>
        route.fulfill({
            json: {
                success: true,
                data: { payments: [existingPayment], summary },
            },
        }),
    );

    let postCount = 0;

    await page.route(
        `**/api/students/${studentUserId}/payments`,
        async (route) => {
            if (route.request().method() !== 'POST') {
                await route.fallback();

                return;
            }

            expect(route.request().postDataJSON()).toEqual({
                schoolId,
                paymentPlanId,
                amount: '150.50',
                dueDate: '2026-11-01',
                method: 'transfer',
            });
            postCount++;

            if (postCount === 1) {
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
                        payments: [
                            {
                                ...existingPayment,
                                id: 'new-payment',
                                amount: '150.50',
                                dueDate: '2026-11-01',
                                method: 'transfer',
                            },
                            existingPayment,
                        ],
                        summary,
                    },
                },
            });
        },
    );

    await page.goto(`/manager/students/${studentUserId}`);
    await expect(
        page.getByRole('heading', { name: 'Anna Kowalska' }),
    ).toBeVisible();
    await page.getByRole('tab', { name: 'Płatności' }).click();

    const form = page
        .locator('form')
        .filter({ has: page.getByRole('button', { name: 'Dodaj' }) });
    const amount = form.getByPlaceholder('Kwota');
    const dueDate = form.getByLabel('Termin płatności');
    const method = form.getByPlaceholder('Metoda');
    const plan = form.getByLabel('Plan płatności');

    await amount.fill('150,50');
    await dueDate.fill('2026-11-01');
    await method.fill('transfer');
    await form.getByRole('button', { name: 'Dodaj' }).click();

    await expect(page.getByText(/500 Internal Server Error/)).toBeVisible();
    await expect(amount).toHaveValue('150,50');
    await expect(dueDate).toHaveValue('2026-11-01');
    await expect(method).toHaveValue('transfer');
    await expect(plan).toHaveValue(paymentPlanId);

    await form.getByRole('button', { name: 'Dodaj' }).click();

    await expect(amount).toHaveValue('');
    await expect(dueDate).toHaveValue('');
    await expect(method).toHaveValue('');
    await expect(plan).toHaveValue(paymentPlanId);
    expect(postCount).toBe(2);
});

test('T01 example keeps a draft when no save is connected', async ({
    context,
    page,
    baseURL,
}) => {
    test.setTimeout(60_000);
    await authenticateMockUser(context, baseURL!, 'MANAGER');
    await page.goto('/design-system?section=patterns');
    await page.locator('html[data-app-ready="true"]').waitFor();
    await page
        .getByRole('tablist', { name: 'Wybierz wzorzec ekranu' })
        .getByRole('tab', { name: 'Profil kursanta' })
        .click();
    await page.getByRole('tab', { name: 'Płatności' }).click();

    const form = page
        .locator('form')
        .filter({ has: page.getByRole('button', { name: 'Dodaj' }) });
    const amount = form.getByPlaceholder('Kwota');

    await amount.fill('120');
    await form.getByRole('button', { name: 'Dodaj' }).click();
    await expect(amount).toHaveValue('120');
});
