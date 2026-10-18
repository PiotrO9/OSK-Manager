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
    const dueDateIso = new Intl.DateTimeFormat('sv-SE', {
        timeZone: 'Europe/Warsaw',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).format(new Date());

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

    await page.route(`**/api/students/${studentUserId}/payments`, (route) =>
        route.fulfill({
            json: {
                success: true,
                data: {
                    payments: [existingPayment],
                    paymentPlans: [
                        {
                            id: paymentPlanId,
                            courseId: 'course-1',
                            courseName: 'Kurs B',
                            currency: 'PLN',
                        },
                    ],
                    summary,
                },
            },
        }),
    );

    await page.route(
        `**/api/students/${studentUserId}/payments/existing-payment/mark-paid`,
        (route) =>
            route.fulfill({
                json: {
                    success: true,
                    data: {
                        payments: [{ ...existingPayment, status: 'PAID' }],
                        paymentPlans: [
                            {
                                id: paymentPlanId,
                                courseId: 'course-1',
                                courseName: 'Kurs B',
                                currency: 'PLN',
                            },
                        ],
                        summary,
                    },
                },
            }),
    );

    let postCount = 0;
    let signalFirstPost: (() => void) | undefined;
    let releaseFirstPost: (() => void) | undefined;
    const firstPostStarted = new Promise<void>((resolve) => {
        signalFirstPost = resolve;
    });

    await page.route(
        `**/api/students/${studentUserId}/payments`,
        async (route) => {
            if (route.request().method() !== 'POST') {
                await route.fallback();

                return;
            }

            expect(route.request().postDataJSON()).toEqual({
                paymentPlanId,
                amount: '150.50',
                dueDate: dueDateIso,
                method: 'transfer',
            });
            postCount++;

            if (postCount === 1) {
                signalFirstPost?.();
                await new Promise<void>((resolve) => {
                    releaseFirstPost = resolve;
                });
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
                                dueDate: dueDateIso,
                                method: 'transfer',
                            },
                            existingPayment,
                        ],
                        paymentPlans: [
                            {
                                id: paymentPlanId,
                                courseId: 'course-1',
                                courseName: 'Kurs B',
                                currency: 'PLN',
                            },
                        ],
                        summary,
                    },
                },
            });
        },
    );

    await page.goto(
        `/manager/students/${studentUserId}?schoolId=stale&tab=payments#details`,
    );
    await page.locator('html[data-app-ready="true"]').waitFor();
    await expect(page).toHaveURL(
        (url) =>
            !url.searchParams.has('schoolId') &&
            url.searchParams.get('tab') === 'payments' &&
            url.hash === '#details',
    );
    await expect(
        page.getByRole('heading', { name: 'Anna Kowalska' }),
    ).toBeVisible({ timeout: 30_000 });
    await page.getByRole('tab', { name: 'Płatności' }).click();

    const form = page
        .locator('form')
        .filter({ has: page.getByRole('button', { name: 'Dodaj' }) });
    const amount = form.getByPlaceholder('Kwota');
    const dueDate = form.getByLabel('Termin płatności');
    const method = form.getByRole('combobox', { name: 'Metoda płatności' });
    const plan = form.getByRole('combobox', { name: 'Plan płatności' });

    await amount.fill('150,50');
    await dueDate.click();
    await page.getByRole('button', { name: 'Dzisiaj' }).click();
    const dueDateLabel = await dueDate.innerText();

    expect(dueDateLabel).not.toBe('Termin płatności');
    await method.click();
    await page.getByRole('option', { name: 'Przelew' }).click();
    await form.getByRole('button', { name: 'Dodaj' }).click();

    await firstPostStarted;
    await expect(form.getByRole('button', { name: 'Dodaj' })).toBeDisabled();
    await expect(amount).toHaveValue('150,50');
    await expect(dueDate).toHaveText(dueDateLabel);
    await expect(method).toContainText('Przelew');
    releaseFirstPost?.();

    await expect(
        page.getByText('Nie udało się dodać płatności.'),
    ).toBeVisible();
    await expect(amount).toHaveValue('150,50');
    await expect(dueDate).toHaveText(dueDateLabel);
    await expect(method).toContainText('Przelew');
    await expect(plan).toContainText('Kurs B');

    await page.getByRole('button', { name: 'Opłacona' }).click();
    await expect(page.getByRole('button', { name: 'Cofnij' })).toBeVisible();
    await expect(amount).toHaveValue('150,50');
    await expect(dueDate).toHaveText(dueDateLabel);
    await expect(method).toContainText('Przelew');

    await form.getByRole('button', { name: 'Dodaj' }).click();

    await expect(amount).toHaveValue('');
    await expect(dueDate).toHaveText('Termin płatności');
    await expect(method).toContainText('Metoda');
    await expect(plan).toContainText('Kurs B');
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
