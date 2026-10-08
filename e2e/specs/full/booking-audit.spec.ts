import { expect, test } from '@playwright/test';

const courseName = 'Audyt: praktyka B';
const slotStart = '10:00';
const slotEnd = '11:00';

function dateInWarsaw(date: Date): string {
    return new Intl.DateTimeFormat('sv-SE', {
        timeZone: 'Europe/Warsaw',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).format(date);
}

function mondayOf(dateString: string): number {
    const date = new Date(`${dateString}T12:00:00Z`);
    const daysFromMonday = (date.getUTCDay() + 6) % 7;

    return Date.UTC(
        date.getUTCFullYear(),
        date.getUTCMonth(),
        date.getUTCDate() - daysFromMonday,
    );
}

function dateLabel(dateString: string, short: boolean): string {
    return new Intl.DateTimeFormat('pl-PL', {
        timeZone: 'Europe/Warsaw',
        weekday: short ? 'short' : 'long',
        day: 'numeric',
        month: short ? 'numeric' : 'long',
    }).format(new Date(`${dateString}T12:00:00Z`));
}

test('@audit STU-04/STU-05 kursant rezerwuje jazdę i widzi ją po odświeżeniu', async ({
    page,
}) => {
    const email = process.env.E2E_STUDENT_EMAIL;
    const password = process.env.E2E_STUDENT_PASSWORD;
    const bookingDate = process.env.E2E_BOOKING_DATE;

    test.skip(
        !email || !password || !bookingDate,
        'Wymagane: E2E_STUDENT_EMAIL, E2E_STUDENT_PASSWORD i E2E_BOOKING_DATE z fixture booking-ready.',
    );
    expect(bookingDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);

    const weekOffset =
        (mondayOf(bookingDate!) - mondayOf(dateInWarsaw(new Date()))) /
        (7 * 24 * 60 * 60 * 1000);

    expect(
        weekOffset,
        'Data z booking-ready powinna wypadać w bieżącym lub następnym tygodniu.',
    ).toBeGreaterThanOrEqual(0);
    expect(weekOffset).toBeLessThanOrEqual(1);

    await page.goto('/login');
    await page.locator('html[data-app-ready="true"]').waitFor();
    await page.getByLabel('Adres e-mail').fill(email!);
    await page.getByLabel('Hasło', { exact: true }).fill(password!);
    await page.getByRole('button', { name: 'Zaloguj się' }).click();
    await expect(page).toHaveURL(/\/$/);

    await page.getByRole('link', { name: 'Rezerwuj jazdę' }).first().click();
    await expect(page).toHaveURL(/\/book-lesson$/);
    await expect(page.locator('#student-booking-course')).toContainText(
        courseName,
    );

    const bookingNavigation = page.getByRole('toolbar', {
        name: 'Nawigacja tygodnia rezerwacji jazdy',
    });

    if (weekOffset === 1) {
        const nextWeek = bookingNavigation.getByRole('button', {
            name: 'Następny tydzień',
        });

        await expect(nextWeek).toBeEnabled();
        await nextWeek.click();
    }

    const expectedDay = dateLabel(bookingDate!, true);
    const slotName = new RegExp(
        `^Zarezerwuj termin ${expectedDay.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}, ${slotStart}–${slotEnd}, instruktor `,
    );
    const slot = page.getByRole('button', { name: slotName }).first();

    await expect(slot).toBeVisible({ timeout: 20_000 });
    await expect(slot).toBeEnabled();
    const selectedSlotName = await slot.getAttribute('aria-label');

    expect(selectedSlotName).toBeTruthy();
    const instructorName = selectedSlotName!.split(', instruktor ')[1];

    expect(instructorName).toBeTruthy();

    let bookingPostCount = 0;

    page.on('request', (request) => {
        if (
            request.method() === 'POST' &&
            new URL(request.url()).pathname === '/api/lessons/me'
        ) {
            bookingPostCount += 1;
        }
    });

    await slot.click();
    const confirmation = page.getByRole('dialog', {
        name: 'Potwierdź rezerwację jazdy',
    });

    await expect(confirmation).toBeVisible();
    await expect(confirmation).toContainText(courseName);
    await expect(confirmation).toContainText(dateLabel(bookingDate!, false));
    await expect(confirmation).toContainText(`${slotStart} – ${slotEnd}`);
    await expect(confirmation).toContainText('1 godz.');
    await expect(confirmation).toContainText(instructorName!);

    await confirmation.getByRole('button', { name: 'Anuluj' }).click();
    await expect(confirmation).toBeHidden();
    await expect(slot).toBeVisible();
    expect(bookingPostCount).toBe(0);

    await slot.click();
    await expect(confirmation).toBeVisible();
    const bookingResponse = page.waitForResponse(
        (response) =>
            response.request().method() === 'POST' &&
            new URL(response.url()).pathname === '/api/lessons/me',
    );

    await confirmation
        .getByRole('button', { name: 'Zarezerwuj jazdę' })
        .click();
    expect((await bookingResponse).ok()).toBe(true);

    const success = page.getByRole('status').filter({
        has: page.getByRole('link', { name: 'Moje lekcje' }),
    });

    await expect(success).toContainText('Zarezerwowano jazdę:');
    await expect(success).toContainText(`${slotStart}–${slotEnd}`);
    await expect(success).toContainText(instructorName!);
    await expect(
        page.getByRole('button', { name: selectedSlotName!, exact: true }),
    ).toHaveCount(0);

    await success.getByRole('link', { name: 'Moje lekcje' }).click();
    await expect(page).toHaveURL(/\/my-lessons$/);

    async function assertBookedLessonInList(): Promise<void> {
        await page.getByRole('tab', { name: 'Lista' }).click();

        if (weekOffset === 1) {
            const scheduleNavigation = page.getByRole('toolbar', {
                name: 'Nawigacja tygodnia harmonogramu',
            });

            await scheduleNavigation
                .getByRole('button', { name: 'Następny tydzień' })
                .click();
        }

        const daySchedule = page.getByRole('region', {
            name: `Harmonogram na ${dateLabel(bookingDate!, false)}`,
        });
        const matchingLessons = daySchedule
            .locator('li')
            .filter({ hasText: instructorName! })
            .filter({ hasText: `${slotStart} - ${slotEnd}` });

        await expect(matchingLessons).toHaveCount(1);
        await expect(matchingLessons).toContainText('Jazda praktyczna');
        await expect(matchingLessons).toContainText('Plan');
    }

    await assertBookedLessonInList();
    await page.reload();
    await page.locator('html[data-app-ready="true"]').waitFor();
    await assertBookedLessonInList();

    await page.goto('/book-lesson');
    await page.locator('html[data-app-ready="true"]').waitFor();

    if (weekOffset === 1) {
        await page
            .getByRole('toolbar', {
                name: 'Nawigacja tygodnia rezerwacji jazdy',
            })
            .getByRole('button', { name: 'Następny tydzień' })
            .click();
    }

    await expect(
        page.getByRole('button', { name: selectedSlotName!, exact: true }),
    ).toHaveCount(0);
});
