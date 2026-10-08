import { expect, test, type Page } from '@playwright/test';

const courseName = 'Audyt: praktyka B';
const amount = '237.41';
const formattedAmount = '237,41';

async function logIn(page: Page, email: string, password: string) {
    await page.goto('/login');
    await page.locator('html[data-app-ready="true"]').waitFor();
    await page.getByLabel('Adres e-mail').fill(email);
    await page.getByLabel('Hasło', { exact: true }).fill(password);
    await page.getByRole('button', { name: 'Zaloguj się' }).click();
    await expect(page).toHaveURL(/\/$/);
}

test('@audit XR-04 i MGR-PAY-01 — opłata menadżera jest widoczna dla kursanta', async ({
    page,
    browser,
}) => {
    test.setTimeout(120_000);

    const managerEmail = process.env.E2E_MANAGER_EMAIL;
    const managerPassword = process.env.E2E_MANAGER_PASSWORD;
    const studentEmail = process.env.E2E_STUDENT_EMAIL;
    const studentPassword = process.env.E2E_STUDENT_PASSWORD;

    test.skip(
        process.env.E2E_AUDIT_FIXTURE !== 'payment-ready' ||
            !managerEmail ||
            !managerPassword ||
            !studentEmail ||
            !studentPassword,
        'Wymagany świeży fixture payment-ready, E2E_AUDIT_FIXTURE=payment-ready oraz dane logowania menadżera i kursanta.',
    );

    const initialDueDate = `${new Date().getFullYear() + 1}-06-15`;
    const updatedDueDate = `${new Date().getFullYear() + 1}-06-20`;

    await logIn(page, managerEmail!, managerPassword!);
    await page.goto('/manager/students');
    await page.locator('html[data-app-ready="true"]').waitFor();

    const detailsLink = page.getByRole('link', {
        name: 'Otwórz szczegóły kursanta Kamil Kursant w nowej karcie',
    });

    await expect(detailsLink).toBeVisible();
    const [managerDetails] = await Promise.all([
        page.waitForEvent('popup'),
        detailsLink.click(),
    ]);

    await managerDetails.locator('html[data-app-ready="true"]').waitFor();
    await managerDetails.getByRole('tab', { name: 'Płatności' }).click();

    const section = managerDetails.locator(
        'section[aria-labelledby="student-payments-heading"]',
    );

    await expect(section).toBeVisible();
    const planSelect = section.getByRole('combobox', {
        name: 'Plan płatności',
    });

    await expect(
        planSelect.locator('option', { hasText: courseName }),
    ).toHaveCount(1);

    const paymentRow = section
        .locator('table tbody tr')
        .filter({ hasText: formattedAmount });

    await expect(paymentRow).toHaveCount(0);

    const createForm = section.locator('form');

    await planSelect.selectOption({ label: courseName });
    await createForm.getByPlaceholder('Kwota').fill(amount);
    await createForm.getByLabel('Termin płatności').fill(initialDueDate);
    await createForm.getByPlaceholder('Metoda').fill('Przelew');
    await createForm.getByRole('button', { name: 'Dodaj' }).click();
    await expect(paymentRow).toHaveCount(1);
    await expect(paymentRow).toContainText('Do opłacenia');
    await expect(
        section.getByText('Do zapłaty', { exact: true }).locator('..'),
    ).toContainText(formattedAmount);

    await managerDetails.reload();
    await managerDetails.locator('html[data-app-ready="true"]').waitFor();
    await managerDetails.getByRole('tab', { name: 'Płatności' }).click();
    await expect(paymentRow).toHaveCount(1);

    const editCard = section
        .getByRole('button', { name: 'Zapisz' })
        .locator('xpath=ancestor::article')
        .filter({ hasText: formattedAmount });

    await expect(editCard).toHaveCount(1);
    await editCard.getByLabel('Termin płatności').fill(updatedDueDate);
    await editCard.getByPlaceholder('Metoda').fill('Gotówka');
    const updateResponse = managerDetails.waitForResponse(
        (response) =>
            response.request().method() === 'PATCH' &&
            /\/payments\/[^/]+(?:\?|$)/.test(response.url()) &&
            !response.url().includes('/mark-'),
    );

    await editCard.getByRole('button', { name: 'Zapisz' }).click();
    expect((await updateResponse).ok()).toBe(true);

    await managerDetails.reload();
    await managerDetails.locator('html[data-app-ready="true"]').waitFor();
    await managerDetails.getByRole('tab', { name: 'Płatności' }).click();
    await expect(editCard.getByLabel('Termin płatności')).toHaveValue(
        updatedDueDate,
    );
    await expect(editCard.getByPlaceholder('Metoda')).toHaveValue('Gotówka');

    const studentContext = await browser.newContext({
        baseURL: new URL(page.url()).origin,
        locale: 'pl-PL',
        timezoneId: 'Europe/Warsaw',
    });

    try {
        const studentPage = await studentContext.newPage();

        await logIn(studentPage, studentEmail!, studentPassword!);
        await studentPage.goto('/my-payments');
        await studentPage.locator('html[data-app-ready="true"]').waitFor();
        await expect(
            studentPage.getByRole('heading', { name: 'Moje opłaty' }),
        ).toBeVisible();

        const studentRow = studentPage
            .locator('table tbody tr')
            .filter({ hasText: formattedAmount });

        await expect(studentRow).toHaveCount(1);
        await expect(studentRow).toContainText(courseName);
        await expect(studentRow).toContainText('Do opłacenia');
        await expect(studentRow.locator('time').first()).toHaveAttribute(
            'datetime',
            new RegExp(`^${updatedDueDate}`),
        );

        await editCard.getByRole('button', { name: 'Opłacona' }).click();
        await expect(
            editCard.getByRole('button', { name: 'Cofnij' }),
        ).toBeVisible();
        await managerDetails.reload();
        await managerDetails.locator('html[data-app-ready="true"]').waitFor();
        await managerDetails.getByRole('tab', { name: 'Płatności' }).click();
        await expect(
            editCard.getByRole('button', { name: 'Cofnij' }),
        ).toBeVisible();
        await expect(
            section.getByText('Opłacone', { exact: true }).locator('..'),
        ).toContainText(formattedAmount);
        await studentPage.reload();
        await studentPage.locator('html[data-app-ready="true"]').waitFor();
        await studentPage.getByRole('button', { name: /Opłacone/ }).click();
        await expect(studentRow).toHaveCount(1);
        await expect(studentRow).toContainText('Opłacona');

        await editCard.getByRole('button', { name: 'Cofnij' }).click();
        await expect(
            editCard.getByRole('button', { name: 'Opłacona' }),
        ).toBeVisible();
        await managerDetails.reload();
        await managerDetails.locator('html[data-app-ready="true"]').waitFor();
        await managerDetails.getByRole('tab', { name: 'Płatności' }).click();
        await expect(
            editCard.getByRole('button', { name: 'Opłacona' }),
        ).toBeVisible();
        await expect(
            section.getByText('Do zapłaty', { exact: true }).locator('..'),
        ).toContainText(formattedAmount);
        await studentPage.reload();
        await studentPage.locator('html[data-app-ready="true"]').waitFor();
        await expect(studentRow).toHaveCount(1);
        await expect(studentRow).toContainText('Do opłacenia');
    } finally {
        await studentContext.close();
    }
});
