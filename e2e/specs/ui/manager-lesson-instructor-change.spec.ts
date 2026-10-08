import { expect, test } from '@playwright/test';
import { authenticateMockUser } from '../../support/mockAuth';

const lessonId = '123e4567-e89b-42d3-a456-426614174099';
const schoolId = '123e4567-e89b-42d3-a456-426614174000';
const currentInstructorId = '123e4567-e89b-42d3-a456-426614174001';
const substituteId = '123e4567-e89b-42d3-a456-426614174002';
const busyInstructorId = '123e4567-e89b-42d3-a456-426614174003';
const vehicleId = '123e4567-e89b-42d3-a456-426614174004';

function lessonTimes(started = false) {
    const start = new Date(
        Date.now() + (started ? -30 * 60_000 : 7 * 24 * 60 * 60_000),
    );

    if (!started) start.setUTCHours(10, 0, 0, 0);

    return {
        startTime: start.toISOString(),
        endTime: new Date(start.getTime() + 60 * 60_000).toISOString(),
    };
}

function lesson(
    times: ReturnType<typeof lessonTimes>,
    instructorId = currentInstructorId,
) {
    return {
        id: lessonId,
        courseId: 'course-1',
        schoolId,
        student: { id: 'student-1', firstName: 'Kamil', lastName: 'Kursant' },
        instructor: {
            id: instructorId,
            firstName: instructorId === substituteId ? 'Anna' : 'Jan',
            lastName: instructorId === substituteId ? 'Nowak' : 'Kowalski',
            email: 'instruktor@example.test',
        },
        vehicle: {
            id: vehicleId,
            name: 'Toyota Yaris',
            registrationNumber: 'WA12345',
            status: 'ACTIVE',
        },
        assignedCourseInstructor: {
            id: currentInstructorId,
            name: 'Jan Kowalski',
        },
        bookingMaxDaysAhead: 30,
        lessonType: 'PRACTICE',
        status: 'SCHEDULED',
        ...times,
    };
}

async function mockLessonApis(
    page: import('@playwright/test').Page,
    started = false,
) {
    const times = lessonTimes(started);
    let currentLesson = lesson(times);
    let patchBody: Record<string, unknown> | null = null;
    let optionsRequests = 0;

    await page.route(`**/api/lessons/${lessonId}`, async (route) => {
        if (route.request().method() === 'PATCH') {
            patchBody = route.request().postDataJSON();
            currentLesson = lesson(times, String(patchBody?.instructorId));
        }

        await route.fulfill({
            json: { success: true, data: { lesson: currentLesson } },
        });
    });
    await page.route(
        `**/api/lessons/${lessonId}/instructor-options?*`,
        async (route) => {
            optionsRequests += 1;

            await route.fulfill({
                json: {
                    success: true,
                    data: {
                        instructors: [
                            {
                                id: substituteId,
                                firstName: 'Anna',
                                lastName: 'Nowak',
                                email: 'anna@example.test',
                                qualifiedCourseTypes: [{ id: 'type-1' }],
                            },
                        ],
                    },
                },
            });
        },
    );
    await page.route('**/api/instructors?*', (route) =>
        route.fulfill({
            json: {
                success: true,
                data: {
                    instructors: [
                        {
                            id: currentInstructorId,
                            firstName: 'Jan',
                            lastName: 'Kowalski',
                        },
                        {
                            id: substituteId,
                            firstName: 'Anna',
                            lastName: 'Nowak',
                        },
                        {
                            id: busyInstructorId,
                            firstName: 'Ola',
                            lastName: 'Zajęta',
                        },
                    ],
                },
            },
        }),
    );
    await page.route('**/api/vehicles?*', (route) =>
        route.fulfill({
            json: {
                success: true,
                data: {
                    vehicles: [
                        {
                            id: vehicleId,
                            name: 'Toyota Yaris',
                            registrationNumber: 'WA12345',
                            status: 'ACTIVE',
                        },
                    ],
                },
            },
        }),
    );
    await page.route('**/api/instructors/*/availability/weekly', (route) =>
        route.fulfill({ json: { success: true, data: { weekly: [] } } }),
    );
    await page.route(
        '**/api/instructors/*/availability/exceptions?*',
        (route) =>
            route.fulfill({
                json: { success: true, data: { exceptions: [] } },
            }),
    );
    await page.route('**/api/schedule/availability-options', (route) =>
        route.fulfill({
            json: {
                success: true,
                data: {
                    stepMinutes: 15,
                    policy: { minDurationMinutes: 60, maxDurationMinutes: 180 },
                    options: [],
                    availableVehicleIds: [vehicleId],
                },
            },
        }),
    );
    await page.route('**/api/schedule/availability-check', (route) =>
        route.fulfill({
            json: {
                success: true,
                data: {
                    available: true,
                    issues: [],
                    policy: { minDurationMinutes: 60, maxDurationMinutes: 180 },
                },
            },
        }),
    );

    return {
        times,
        getPatchBody: () => patchBody,
        getOptionsRequests: () => optionsRequests,
    };
}

test('manager changes the instructor on one future practice lesson', async ({
    context,
    page,
    baseURL,
}) => {
    await authenticateMockUser(context, baseURL!, 'MANAGER');

    const mocked = await mockLessonApis(page);

    await page.goto(`/manager/lessons/${lessonId}/edit`);
    await expect(page.locator('#lesson-instructor')).toBeEnabled();
    await expect.poll(mocked.getOptionsRequests).toBeGreaterThan(0);
    await page.locator('#lesson-instructor').click();
    await expect(page.getByRole('option', { name: 'Ola Zajęta' })).toHaveCount(
        0,
    );
    await page.getByRole('option', { name: 'Anna Nowak' }).click();
    await page.getByRole('button', { name: 'Zapisz zmiany' }).click();

    await expect.poll(mocked.getPatchBody).not.toBeNull();
    expect(mocked.getPatchBody()).toEqual({
        instructorId: substituteId,
        expectedLessonState: {
            instructorId: currentInstructorId,
            startTime: mocked.times.startTime,
            endTime: mocked.times.endTime,
            vehicleId,
        },
    });
    await expect(page.locator('#lesson-instructor')).toHaveAttribute(
        'aria-label',
        'Instruktor: Anna Nowak',
    );
    await expect(
        page.getByText('Prowadzący kurs: Jan Kowalski.'),
    ).toBeVisible();
});

test('manager cannot change the instructor after the lesson has started', async ({
    context,
    page,
    baseURL,
}) => {
    await authenticateMockUser(context, baseURL!, 'MANAGER');

    const mocked = await mockLessonApis(page, true);

    await page.goto(`/manager/lessons/${lessonId}/edit`);
    await expect(page.locator('#lesson-instructor')).toBeDisabled();
    await expect(
        page.getByText(
            'Jazda już się rozpoczęła. Nie można zmienić instruktora.',
        ),
    ).toBeVisible();
    expect(mocked.getPatchBody()).toBeNull();
});
