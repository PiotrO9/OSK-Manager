import { expect, test, type Page } from '@playwright/test';

const upstream = process.env.E2E_API_UPSTREAM?.replace(/\/$/, '') ?? '';
const schoolId = process.env.E2E_AUDIT_SCHOOL_ID ?? '';
const foreignSchoolId = process.env.E2E_AUDIT_FOREIGN_SCHOOL_ID ?? '';
const foreignStudentId = process.env.E2E_AUDIT_FOREIGN_STUDENT_ID ?? '';
const foreignInstructorId = process.env.E2E_AUDIT_FOREIGN_INSTRUCTOR_ID ?? '';
const studentId = process.env.E2E_AUDIT_STUDENT_ID ?? '';
const secondStudentId = process.env.E2E_AUDIT_SECOND_STUDENT_ID ?? '';
const firstInstructorId = process.env.E2E_AUDIT_FIRST_INSTRUCTOR_ID ?? '';
const freeInstructorId = process.env.E2E_AUDIT_FREE_INSTRUCTOR_ID ?? '';
const managerEmail = process.env.E2E_MANAGER_EMAIL ?? '';
const managerPassword = process.env.E2E_MANAGER_PASSWORD ?? '';
const foreignManagerEmail = process.env.E2E_FOREIGN_MANAGER_EMAIL ?? '';
const foreignManagerPassword = process.env.E2E_FOREIGN_MANAGER_PASSWORD ?? '';
const studentEmail = process.env.E2E_STUDENT_EMAIL ?? '';
const studentPassword = process.env.E2E_STUDENT_PASSWORD ?? '';
const secondStudentEmail = process.env.E2E_SECOND_STUDENT_EMAIL ?? '';
const secondStudentPassword = process.env.E2E_SECOND_STUDENT_PASSWORD ?? '';
const instructorEmail = process.env.E2E_INSTRUCTOR_EMAIL ?? '';
const instructorPassword = process.env.E2E_INSTRUCTOR_PASSWORD ?? '';
const freeInstructorEmail = process.env.E2E_FREE_INSTRUCTOR_EMAIL ?? '';
const freeInstructorPassword = process.env.E2E_FREE_INSTRUCTOR_PASSWORD ?? '';
const changedStudentEmail = `student02+changed-${Date.now()}@audit.osk.local`;
const changedInstructorPassword = 'AuditReset123!';
const browserBaseUrl = 'http://127.0.0.1:3100';

async function login(page: Page, email: string, password: string) {
    await page.goto('/login');
    await page.locator('html[data-app-ready="true"]').waitFor();
    await page.getByLabel('Adres e-mail').fill(email);
    await page.getByLabel('Hasło', { exact: true }).fill(password);
    await page.getByRole('button', { name: 'Zaloguj się' }).click();
    await expect(page).toHaveURL((url) => url.pathname === '/');
    const token = (await page.context().cookies()).find(
        ({ name }) => name === 'access_token',
    )?.value;

    expect(token).toBeTruthy();

    return token!;
}

async function openAccounts(page: Page) {
    await page.goto('/manager/accounts');
    await page.locator('html[data-app-ready="true"]').waitFor();
    await expect(
        page.getByRole('heading', { name: 'Konta użytkowników' }),
    ).toBeVisible();
    await expect(page.getByLabel('Osoby z wybranego ośrodka')).toBeVisible();
}

async function selectAccount(page: Page, name: string) {
    await page
        .getByLabel('Osoby z wybranego ośrodka')
        .getByRole('button')
        .filter({ hasText: name })
        .click();
    await expect(page.getByRole('heading', { name })).toBeVisible();
}

async function accountRequest(
    page: Page,
    token: string,
    method: 'GET' | 'PATCH' | 'POST',
    path: string,
    data?: unknown,
) {
    return page.request.fetch(`${upstream}${path}`, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        ...(data === undefined ? {} : { data }),
    });
}

async function assertLoginRejected(
    page: Page,
    email: string,
    password: string,
) {
    const response = await page.request.post(`${upstream}/auth/login`, {
        data: { email, password },
    });

    expect(response.ok(), `Login ${email} should fail`).toBe(false);
}

interface MailpitMessage {
    ID: string;
    To: Array<{ Address: string }>;
}

async function mailpitMessages(): Promise<MailpitMessage[]> {
    const response = await fetch('http://127.0.0.1:54324/api/v1/messages');
    const body = (await response.json()) as { messages: MailpitMessage[] };

    return body.messages;
}

async function messageFor(
    email: string,
    previousIds: ReadonlySet<string>,
): Promise<MailpitMessage> {
    let found: MailpitMessage | undefined;

    await expect
        .poll(async () => {
            found = (await mailpitMessages()).find(
                (message) =>
                    !previousIds.has(message.ID) &&
                    message.To?.some(
                        (recipient) =>
                            recipient.Address?.toLowerCase() === email,
                    ),
            );

            return found?.ID;
        })
        .toBeTruthy();

    return found!;
}

test.describe.serial('@audit MGR-ACC-01–05 konta menadżera', () => {
    test.setTimeout(120_000);
    test.skip(
        process.env.E2E_AUDIT_FIXTURE !== 'account-ready' ||
            process.env.E2E_MODE !== 'upstream' ||
            process.env.E2E_CONFIRM_ISOLATED_ENVIRONMENT !== 'true' ||
            ![
                upstream,
                schoolId,
                foreignSchoolId,
                foreignStudentId,
                foreignInstructorId,
                studentId,
                secondStudentId,
                firstInstructorId,
                freeInstructorId,
                managerEmail,
                managerPassword,
                foreignManagerEmail,
                foreignManagerPassword,
                studentEmail,
                studentPassword,
                secondStudentEmail,
                secondStudentPassword,
                instructorEmail,
                instructorPassword,
                freeInstructorEmail,
                freeInstructorPassword,
            ].every(Boolean),
        'Wymagany izolowany fixture account-ready i konta testowe.',
    );

    test('MGR-ACC-01 — lista i API nie ujawniają kont innej OSK', async ({
        page,
        browser,
    }) => {
        const managerToken = await login(page, managerEmail, managerPassword);

        await openAccounts(page);
        const list = page.getByLabel('Osoby z wybranego ośrodka');

        await expect(list).toContainText('Kamil Kursant');
        await expect(list).toContainText('Jan Instruktor');
        await expect(list).not.toContainText('Sara Obca');
        await expect(list).not.toContainText('Igor Obcy');

        await page.getByLabel('Szukaj osoby').fill('Ola');
        await expect(list).toContainText('Ola Kursantka');
        await expect(list).not.toContainText('Kamil Kursant');
        await page.getByLabel('Szukaj osoby').fill('Kursantka');
        await expect(list).toContainText('Ola Kursantka');
        await page.getByLabel('Szukaj osoby').fill(secondStudentEmail);
        await expect(list).toContainText('Ola Kursantka');
        await page.getByLabel('Szukaj osoby').clear();
        await page.getByRole('button', { name: 'Instruktorzy' }).click();
        await expect(list).toContainText('Jan Instruktor');
        await expect(list).not.toContainText('Kamil Kursant');
        await page.getByRole('button', { name: 'Kursanci' }).click();
        await expect(list).toContainText('Kamil Kursant');
        await expect(list).not.toContainText('Jan Instruktor');
        await page.getByRole('button', { name: 'Wszyscy' }).click();
        await selectAccount(page, 'Ola Kursantka');
        await expect(
            page.getByRole('region', { name: 'Konto: Ola Kursantka' }),
        ).toContainText('Kursant');
        await expect(
            page.getByRole('region', { name: 'Konto: Ola Kursantka' }),
        ).toContainText('Aktywne');

        expect(
            (
                await accountRequest(
                    page,
                    managerToken,
                    'GET',
                    `/manager/accounts?schoolId=${foreignSchoolId}`,
                )
            ).status(),
        ).toBe(404);

        for (const id of [foreignStudentId, foreignInstructorId]) {
            expect(
                (
                    await accountRequest(
                        page,
                        managerToken,
                        'GET',
                        `/manager/accounts/${id}?schoolId=${schoolId}`,
                    )
                ).status(),
            ).toBe(404);
            expect(
                (
                    await accountRequest(
                        page,
                        managerToken,
                        'PATCH',
                        `/manager/accounts/${id}/profile?schoolId=${schoolId}`,
                        { firstName: 'Nie', lastName: 'Zmieniać', phone: null },
                    )
                ).status(),
            ).toBe(404);
        }

        const foreignContext = await browser.newContext({
            baseURL: browserBaseUrl,
        });

        try {
            const foreignPage = await foreignContext.newPage();
            const foreignToken = await login(
                foreignPage,
                foreignManagerEmail,
                foreignManagerPassword,
            );

            await openAccounts(foreignPage);
            const foreignList = foreignPage.getByLabel(
                'Osoby z wybranego ośrodka',
            );

            await expect(foreignList).toContainText('Sara Obca');
            await expect(foreignList).toContainText('Igor Obcy');
            await expect(foreignList).not.toContainText('Kamil Kursant');
            expect(
                (
                    await accountRequest(
                        foreignPage,
                        foreignToken,
                        'GET',
                        `/manager/accounts?schoolId=${schoolId}`,
                    )
                ).status(),
            ).toBe(404);
        } finally {
            await foreignContext.close();
        }

        for (const [email, password] of [
            [studentEmail, studentPassword],
            [instructorEmail, instructorPassword],
        ]) {
            const context = await browser.newContext({
                baseURL: browserBaseUrl,
            });

            try {
                const rolePage = await context.newPage();
                const token = await login(rolePage, email!, password!);

                expect(
                    (
                        await accountRequest(
                            rolePage,
                            token,
                            'GET',
                            `/manager/accounts?schoolId=${schoolId}`,
                        )
                    ).status(),
                ).toBe(403);
            } finally {
                await context.close();
            }
        }
    });

    test('MGR-ACC-02 — dane i e-mail są trwałe, stara sesja wygasa', async ({
        page,
        browser,
    }) => {
        const oldContext = await browser.newContext({
            baseURL: browserBaseUrl,
        });
        const oldPage = await oldContext.newPage();
        const oldToken = await login(
            oldPage,
            secondStudentEmail,
            secondStudentPassword,
        );

        try {
            await login(page, managerEmail, managerPassword);
            await openAccounts(page);
            await selectAccount(page, 'Ola Kursantka');
            await page.getByLabel('Imię').fill('Oliwia');
            await page.getByLabel('Nazwisko').fill('Testowa');
            await page.getByLabel('Telefon').fill('500600700');
            await page.getByRole('button', { name: 'Zapisz dane' }).click();
            await expect(
                page.getByRole('heading', { name: 'Oliwia Testowa' }),
            ).toBeVisible();
            await page.reload();
            await selectAccount(page, 'Oliwia Testowa');
            await expect(page.getByLabel('Telefon')).toHaveValue('500600700');
            await page
                .getByRole('link', { name: 'Przejdź do szczegółów osoby' })
                .click();
            await expect(
                page.getByRole('heading', { name: 'Oliwia Testowa' }),
            ).toBeVisible();
            await page.getByRole('link', { name: 'Zarządzaj kontem' }).click();
            await expect(
                page.getByRole('heading', { name: 'Konta użytkowników' }),
            ).toBeVisible();

            const beforeMail = await fetch(
                'http://127.0.0.1:54324/api/v1/messages',
            )
                .then((response) => response.json())
                .then((body: { total: number }) => body.total);

            await page.getByLabel('Adres e-mail').fill(changedStudentEmail);
            page.once('dialog', (dialog) => dialog.accept());
            await page.getByRole('button', { name: 'Zmień e-mail' }).click();
            await expect(
                page.getByRole('status').filter({
                    hasText:
                        /Adres e-mail zmieniono|Link resetu został wysłany/,
                }),
            ).toContainText('Adres e-mail zmieniono');
            await page.reload();
            await selectAccount(page, 'Oliwia Testowa');
            await expect(page.getByLabel('Adres e-mail')).toHaveValue(
                changedStudentEmail,
            );
            const afterMail = await fetch(
                'http://127.0.0.1:54324/api/v1/messages',
            )
                .then((response) => response.json())
                .then((body: { total: number }) => body.total);

            expect(afterMail).toBe(beforeMail);

            expect([401, 403]).toContain(
                (
                    await accountRequest(oldPage, oldToken, 'GET', '/auth/me')
                ).status(),
            );
            await assertLoginRejected(
                page,
                secondStudentEmail,
                secondStudentPassword,
            );
            const newContext = await browser.newContext({
                baseURL: browserBaseUrl,
            });

            try {
                await login(
                    await newContext.newPage(),
                    changedStudentEmail,
                    secondStudentPassword,
                );
            } finally {
                await newContext.close();
            }
        } finally {
            await oldContext.close();
        }
    });

    test('MGR-ACC-03 — blokada jest odwracalna bez przywracania sesji', async ({
        page,
        browser,
    }) => {
        const oldContext = await browser.newContext({
            baseURL: browserBaseUrl,
        });
        const oldPage = await oldContext.newPage();
        const oldToken = await login(
            oldPage,
            instructorEmail,
            instructorPassword,
        );

        try {
            await login(page, managerEmail, managerPassword);
            await openAccounts(page);
            await selectAccount(page, 'Jan Instruktor');
            page.once('dialog', (dialog) => dialog.dismiss());
            await page.getByRole('button', { name: 'Zablokuj konto' }).click();
            await page.reload();
            await selectAccount(page, 'Jan Instruktor');
            await expect(
                page.getByText('Aktywne', { exact: true }),
            ).toBeVisible();

            page.once('dialog', (dialog) => dialog.accept());
            await page.getByRole('button', { name: 'Zablokuj konto' }).click();
            await expect(
                page
                    .locator('header')
                    .getByText('Zablokowane', { exact: true }),
            ).toBeVisible();
            expect([401, 403]).toContain(
                (
                    await accountRequest(oldPage, oldToken, 'GET', '/auth/me')
                ).status(),
            );
            await assertLoginRejected(
                page,
                instructorEmail,
                instructorPassword,
            );

            await page.getByRole('button', { name: 'Odblokuj konto' }).click();
            await expect(
                page.getByText('Aktywne', { exact: true }),
            ).toBeVisible();
            expect(
                (
                    await accountRequest(oldPage, oldToken, 'GET', '/auth/me')
                ).status(),
            ).toBe(401);
            const newContext = await browser.newContext({
                baseURL: browserBaseUrl,
            });

            try {
                await login(
                    await newContext.newPage(),
                    instructorEmail,
                    instructorPassword,
                );
            } finally {
                await newContext.close();
            }
        } finally {
            await oldContext.close();
        }
    });

    test('MGR-ACC-04 — reset menadżera dostarcza link i nowe hasło', async ({
        page,
        browser,
    }) => {
        const oldContext = await browser.newContext({
            baseURL: browserBaseUrl,
        });
        const oldPage = await oldContext.newPage();
        const oldToken = await login(
            oldPage,
            freeInstructorEmail,
            freeInstructorPassword,
        );

        try {
            await login(page, managerEmail, managerPassword);
            await openAccounts(page);
            await selectAccount(page, 'Filip Wolny');
            const previousMessageIds = new Set(
                (await mailpitMessages()).map((message) => message.ID),
            );

            await page
                .getByRole('button', { name: 'Wyślij reset hasła' })
                .click();
            await expect(
                page.getByRole('status').filter({
                    hasText:
                        /Adres e-mail zmieniono|Link resetu został wysłany/,
                }),
            ).toContainText('Link resetu został wysłany');

            const message = await messageFor(
                freeInstructorEmail,
                previousMessageIds,
            );
            const response = await fetch(
                `http://127.0.0.1:54324/api/v1/message/${message.ID}`,
            );
            const mail = (await response.json()) as {
                HTML?: string;
                Text?: string;
            };
            const body = mail.HTML || mail.Text || '';
            const link = body
                .match(/https?:\/\/[^"'\s<>]+\/auth\/v1\/verify[^"'\s<>]*/)?.[0]
                ?.replaceAll('&amp;', '&');

            expect(link, 'Recovery link in local mailbox').toBeTruthy();

            const resetContext = await browser.newContext({
                baseURL: browserBaseUrl,
            });

            try {
                const resetPage = await resetContext.newPage();

                await resetPage.goto(link!);
                await expect(resetPage).toHaveURL(/\/reset-password/);
                await resetPage
                    .getByLabel('Nowe hasło')
                    .fill(changedInstructorPassword);
                await resetPage
                    .getByLabel('Powtórz hasło')
                    .fill(changedInstructorPassword);
                await resetPage
                    .getByRole('button', { name: 'Zmień hasło' })
                    .click();
                await expect(
                    resetPage.getByText(
                        'Hasło zostało zmienione. Zaloguj się ponownie.',
                    ),
                ).toContainText('Hasło zostało zmienione');
            } finally {
                await resetContext.close();
            }

            expect(
                (
                    await accountRequest(oldPage, oldToken, 'GET', '/auth/me')
                ).status(),
            ).toBe(401);
            await assertLoginRejected(
                page,
                freeInstructorEmail,
                freeInstructorPassword,
            );
            const newContext = await browser.newContext({
                baseURL: browserBaseUrl,
            });

            try {
                await login(
                    await newContext.newPage(),
                    freeInstructorEmail,
                    changedInstructorPassword,
                );
            } finally {
                await newContext.close();
            }

            await selectAccount(page, 'Jan Instruktor');
            page.once('dialog', (dialog) => dialog.accept());
            await page.getByRole('button', { name: 'Zablokuj konto' }).click();
            await expect(
                page.getByRole('button', { name: 'Wyślij reset hasła' }),
            ).toBeDisabled();
            const managerToken = (await page.context().cookies()).find(
                ({ name }) => name === 'access_token',
            )?.value;

            expect(managerToken).toBeTruthy();
            expect(
                (
                    await accountRequest(
                        page,
                        managerToken!,
                        'POST',
                        `/manager/accounts/${firstInstructorId}/password-reset?schoolId=${schoolId}`,
                    )
                ).status(),
            ).toBe(409);
            await page.getByRole('button', { name: 'Odblokuj konto' }).click();
        } finally {
            await oldContext.close();
        }
    });

    test('MGR-ACC-05 — zobowiązania blokują archiwizację, wolne konta tracą dostęp', async ({
        page,
        browser,
    }) => {
        await login(page, managerEmail, managerPassword);
        await openAccounts(page);
        await selectAccount(page, 'Kamil Kursant');
        page.once('dialog', (dialog) => dialog.dismiss());
        await page.getByRole('button', { name: 'Archiwizuj' }).click();
        await expect(page.getByText('Aktywne', { exact: true })).toBeVisible();
        page.once('dialog', (dialog) => dialog.accept());
        await page.getByRole('button', { name: 'Archiwizuj' }).click();
        await expect(page.getByRole('alert')).toContainText(
            'active school obligations',
        );
        await expect(page.getByText('Aktywne', { exact: true })).toBeVisible();

        await selectAccount(page, 'Jan Instruktor');
        page.once('dialog', (dialog) => dialog.accept());
        await page.getByRole('button', { name: 'Archiwizuj' }).click();
        await expect(page.getByRole('alert')).toContainText(
            'active school obligations',
        );

        const studentContext = await browser.newContext({
            baseURL: browserBaseUrl,
        });
        const studentPage = await studentContext.newPage();
        const studentToken = await login(
            studentPage,
            changedStudentEmail,
            secondStudentPassword,
        );

        try {
            await selectAccount(page, 'Oliwia Testowa');
            page.once('dialog', (dialog) => dialog.accept());
            await page.getByRole('button', { name: 'Archiwizuj' }).click();
            await expect(
                page.getByText('Zarchiwizowane', { exact: true }),
            ).toBeVisible();
            await page.reload();
            await selectAccount(page, 'Oliwia Testowa');
            await expect(
                page.getByRole('button', { name: 'Odblokuj konto' }),
            ).toHaveCount(0);
            expect([401, 403]).toContain(
                (
                    await accountRequest(
                        studentPage,
                        studentToken,
                        'GET',
                        '/auth/me',
                    )
                ).status(),
            );
            await assertLoginRejected(
                page,
                changedStudentEmail,
                secondStudentPassword,
            );
        } finally {
            await studentContext.close();
        }

        const instructorContext = await browser.newContext({
            baseURL: browserBaseUrl,
        });
        const instructorPage = await instructorContext.newPage();
        const instructorToken = await login(
            instructorPage,
            freeInstructorEmail,
            changedInstructorPassword,
        );

        try {
            await selectAccount(page, 'Filip Wolny');
            page.once('dialog', (dialog) => dialog.accept());
            await page.getByRole('button', { name: 'Archiwizuj' }).click();
            await expect(
                page.getByText('Zarchiwizowane', { exact: true }),
            ).toBeVisible();
            expect([401, 403]).toContain(
                (
                    await accountRequest(
                        instructorPage,
                        instructorToken,
                        'GET',
                        '/auth/me',
                    )
                ).status(),
            );
            await assertLoginRejected(
                page,
                freeInstructorEmail,
                changedInstructorPassword,
            );
        } finally {
            await instructorContext.close();
        }
    });
});
