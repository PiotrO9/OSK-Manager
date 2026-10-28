import { computed, nextTick, ref, shallowRef, watch } from 'vue';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { SchoolAvailabilitySlot } from '~/types/schools/schoolAvailabilitySlots';
import type { ScheduleAvailabilityResult } from '~/types/schedule/scheduleAvailability';
import { useScheduleAvailabilityCheck } from '../schedule/useScheduleAvailabilityCheck';
import { useStudentLessonBookingPage } from './useStudentLessonBookingPage';

const bookOwnLesson = vi.fn();
const fetchMyCourses = vi.fn();
const fetchSlots = vi.fn();
const addToast = vi.fn();
const recheckAvailability = vi.fn();
const availabilityFetcher = vi.fn();
const availabilityMessage = ref('Wybrany pojazd jest zajęty.');
const availabilityResult = ref<ScheduleAvailabilityResult | null>(null);

const slot: SchoolAvailabilitySlot = {
    instructorId: '11111111-1111-4111-8111-111111111111',
    instructorFirstName: 'Jan',
    instructorLastName: 'Kowalski',
    date: '2026-09-28',
    startTime: '10:00',
    endTime: '11:00',
};

function installGlobals(): void {
    vi.stubGlobal('shallowRef', shallowRef);
    vi.stubGlobal('computed', computed);
    vi.stubGlobal('watch', watch);
    vi.stubGlobal('onMounted', vi.fn());
    vi.stubGlobal('onBeforeUnmount', vi.fn());
    vi.stubGlobal('useCoursesApi', () => ({ fetchMyCourses }));
    vi.stubGlobal('useSchoolAvailabilitySlotsApi', () => ({
        fetchSlots,
        isLoading: ref(false),
    }));
    vi.stubGlobal('useStudentLessonBookingApi', () => ({ bookOwnLesson }));
    vi.stubGlobal('useAppToast', () => ({ addToast }));
    vi.stubGlobal('useScheduleAvailabilityCheck', () => ({
        message: availabilityMessage,
        result: availabilityResult,
        recheck: recheckAvailability,
    }));
}

describe('useStudentLessonBookingPage', () => {
    beforeEach(() => {
        vi.unstubAllGlobals();
        vi.resetAllMocks();
        availabilityMessage.value = 'Wybrany pojazd jest zajęty.';
        availabilityResult.value = null;
        recheckAvailability.mockResolvedValue('unavailable');
        fetchSlots.mockResolvedValue({ slots: [] });
        installGlobals();
    });

    it('loads slots once when selecting the initial course and refreshes them once for the same course', async () => {
        const course = {
            id: '22222222-2222-4222-8222-222222222222',
            schoolId: '33333333-3333-4333-8333-333333333333',
            name: 'Kurs B',
            status: 'ACTIVE' as const,
            type: 'PRACTICAL' as const,
            totalHours: 30,
            progress: 0,
            completedMinutes: 0,
            bookedMinutes: 0,
            remainingBookableMinutes: 1800,
        };
        const page = useStudentLessonBookingPage();

        fetchMyCourses.mockResolvedValue([course]);

        await page.loadCourses();
        await nextTick();

        expect(fetchSlots).toHaveBeenCalledTimes(1);
        expect(fetchSlots).toHaveBeenCalledWith(
            course.schoolId,
            expect.any(String),
            expect.any(String),
            expect.any(Object),
            expect.objectContaining({ retry: 0 }),
        );

        fetchSlots.mockClear();
        await page.loadCourses();
        await nextTick();

        expect(fetchSlots).toHaveBeenCalledTimes(1);
    });

    it('keeps the modal open and books exactly the proposed final 30 minutes', async () => {
        const page = useStudentLessonBookingPage();

        page.courses.value = [
            {
                id: '22222222-2222-4222-8222-222222222222',
                schoolId: '33333333-3333-4333-8333-333333333333',
                name: 'Kurs B',
                status: 'ACTIVE',
                type: 'PRACTICAL',
                totalHours: 2,
                progress: 0,
                completedMinutes: 0,
                bookedMinutes: 90,
                remainingBookableMinutes: 30,
            },
        ];
        page.selectedCourseId.value = page.courses.value[0]!.id;
        fetchMyCourses.mockResolvedValueOnce(page.courses.value);
        page.handleRequestBookSlot(slot);
        availabilityResult.value = {
            available: false,
            issues: [{ code: 'COURSE_LIMIT_EXCEEDED', field: 'courseId' }],
            policy: { minDurationMinutes: 60, maxDurationMinutes: 120 },
            remainingMinutes: 30,
            alternative: {
                startTime: '10:00',
                endTime: '10:30',
                durationMinutes: 30,
            },
        };
        recheckAvailability
            .mockResolvedValueOnce('unavailable')
            .mockResolvedValueOnce('available');
        await page.handleConfirmBookSlot();
        expect(page.isConfirmDialogOpen.value).toBe(true);
        expect(page.pendingShorterSlot.value?.endTime).toBe('10:30');
        await page.handleConfirmShorterSlot();
        expect(bookOwnLesson).toHaveBeenCalledWith(
            expect.objectContaining({
                bookingMode: 'REMAINING_PACKAGE',
                endTime: expect.any(String),
            }),
        );
        expect(page.isConfirmDialogOpen.value).toBe(false);
    });

    it('does not book a slot rejected by the availability preflight', async () => {
        const page = useStudentLessonBookingPage();

        page.courses.value = [
            {
                id: '22222222-2222-4222-8222-222222222222',
                schoolId: '33333333-3333-4333-8333-333333333333',
                name: 'Kurs B',
                status: 'ACTIVE',
                type: 'PRACTICAL',
                totalHours: 30,
                progress: 0,
                completedMinutes: 0,
                bookedMinutes: 0,
                remainingBookableMinutes: 1800,
            },
        ];
        page.selectedCourseId.value = page.courses.value[0]!.id;
        await nextTick();
        fetchSlots.mockClear();
        page.rawSlots.value = [slot];

        page.pendingConfirmationSlot.value = slot;
        page.isConfirmDialogOpen.value = true;
        await page.handleConfirmBookSlot();

        expect(recheckAvailability).toHaveBeenCalledOnce();
        expect(bookOwnLesson).not.toHaveBeenCalled();
        expect(page.bookingFeedbackMessage.value).toBe(
            'Wybrany pojazd jest zajęty.',
        );
        expect(page.slotsErrorMessage.value).toBeNull();
        expect(page.bookingSlotKey.value).toBeNull();
        expect(fetchSlots).toHaveBeenCalledOnce();
        expect(page.rawSlots.value).toEqual([]);
        expect(page.isConfirmDialogOpen.value).toBe(true);
    });

    it('blocks booking when the real same-tick preflight reports unavailable', async () => {
        availabilityFetcher.mockResolvedValue({
            available: false,
            issues: [{ code: 'INSTRUCTOR_BUSY', field: 'instructorId' }],
            policy: { minDurationMinutes: 45, maxDurationMinutes: 90 },
        });
        vi.stubGlobal(
            'useScheduleAvailabilityCheck',
            (options: Parameters<typeof useScheduleAvailabilityCheck>[0]) =>
                useScheduleAvailabilityCheck({
                    ...options,
                    fetcher: availabilityFetcher,
                }),
        );
        const page = useStudentLessonBookingPage();

        page.courses.value = [
            {
                id: '22222222-2222-4222-8222-222222222222',
                schoolId: '33333333-3333-4333-8333-333333333333',
                name: 'Kurs B',
                status: 'ACTIVE',
                type: 'PRACTICAL',
                totalHours: 30,
                progress: 0,
                completedMinutes: 0,
                bookedMinutes: 0,
                remainingBookableMinutes: 1800,
            },
        ];
        page.selectedCourseId.value = page.courses.value[0]!.id;

        page.pendingConfirmationSlot.value = slot;
        await page.handleConfirmBookSlot();
        expect(availabilityFetcher).toHaveBeenCalledOnce();
        expect(bookOwnLesson).not.toHaveBeenCalled();
        expect(page.bookingFeedbackMessage.value).toBe(
            'Instruktor nie jest dostępny w tym terminie.',
        );
    });

    it.each(['checking', 'idle'] as const)(
        'does not book when availability remains %s',
        async (status) => {
            recheckAvailability.mockResolvedValue(status);
            const page = useStudentLessonBookingPage();

            page.courses.value = [
                {
                    id: '22222222-2222-4222-8222-222222222222',
                    schoolId: '33333333-3333-4333-8333-333333333333',
                    name: 'Kurs B',
                    status: 'ACTIVE',
                    type: 'PRACTICAL',
                    totalHours: 30,
                    progress: 0,
                    completedMinutes: 0,
                    bookedMinutes: 0,
                    remainingBookableMinutes: 1800,
                },
            ];
            page.selectedCourseId.value = page.courses.value[0]!.id;
            page.pendingConfirmationSlot.value = slot;

            await page.handleConfirmBookSlot();

            expect(bookOwnLesson).not.toHaveBeenCalled();
            expect(page.bookingFeedbackMessage.value).toContain(
                'Spróbuj ponownie',
            );
        },
    );

    it('keeps the backend booking fallback after a real preflight error', async () => {
        recheckAvailability.mockResolvedValue('error');
        bookOwnLesson.mockResolvedValue(undefined);
        const page = useStudentLessonBookingPage();

        page.courses.value = [
            {
                id: '22222222-2222-4222-8222-222222222222',
                schoolId: '33333333-3333-4333-8333-333333333333',
                name: 'Kurs B',
                status: 'ACTIVE',
                type: 'PRACTICAL',
                totalHours: 30,
                progress: 0,
                completedMinutes: 0,
                bookedMinutes: 0,
                remainingBookableMinutes: 1800,
            },
        ];
        page.selectedCourseId.value = page.courses.value[0]!.id;
        page.pendingConfirmationSlot.value = slot;

        await page.handleConfirmBookSlot();

        expect(bookOwnLesson).toHaveBeenCalledOnce();
        expect(page.bookingFeedbackTone.value).toBe('success');
        expect(page.bookingFeedbackMessage.value).toBeNull();
        expect(addToast).toHaveBeenCalledWith({
            title: expect.stringContaining('Zarezerwowano jazdę:'),
            variant: 'success',
        });
    });

    it('keeps the confirmation dialog open while booking is pending', async () => {
        let resolveAvailability!: (value: string) => void;
        const pendingAvailability = new Promise<string>((resolve) => {
            resolveAvailability = resolve;
        });

        recheckAvailability.mockReturnValueOnce(pendingAvailability);

        const page = useStudentLessonBookingPage();

        page.courses.value = [
            {
                id: '22222222-2222-4222-8222-222222222222',
                schoolId: '33333333-3333-4333-8333-333333333333',
                name: 'Kurs B',
                status: 'ACTIVE',
                type: 'PRACTICAL',
                totalHours: 30,
                progress: 0,
                completedMinutes: 0,
                bookedMinutes: 0,
                remainingBookableMinutes: 1800,
            },
        ];
        page.selectedCourseId.value = page.courses.value[0]!.id;
        page.pendingConfirmationSlot.value = slot;
        page.isConfirmDialogOpen.value = true;

        const booking = page.handleConfirmBookSlot();

        expect(page.isConfirmDialogOpen.value).toBe(true);
        expect(page.bookingSlotKey.value).not.toBeNull();

        resolveAvailability('unavailable');
        await booking;

        expect(page.isConfirmDialogOpen.value).toBe(true);
        expect(page.bookingSlotKey.value).toBeNull();
    });

    it('excludes active practical courses with no remaining hours', () => {
        const page = useStudentLessonBookingPage();

        page.courses.value = [
            {
                id: '22222222-2222-4222-8222-222222222222',
                schoolId: '33333333-3333-4333-8333-333333333333',
                name: 'Ukończony pakiet',
                status: 'ACTIVE',
                type: 'PRACTICAL',
                totalHours: 30,
                progress: 30,
                completedMinutes: 1800,
                bookedMinutes: 1800,
                remainingBookableMinutes: 0,
            },
        ];

        expect(page.bookableCourses.value).toHaveLength(0);
        expect(page.noBookableCoursesState.value.title).toBe(
            'Wykorzystano dostępne godziny',
        );
    });
    function readyPage() {
        const page = useStudentLessonBookingPage();

        page.courses.value = [
            {
                id: '22222222-2222-4222-8222-222222222222',
                schoolId: '33333333-3333-4333-8333-333333333333',
                name: 'Kurs B',
                status: 'ACTIVE',
                type: 'PRACTICAL',
                totalHours: 2,
                progress: 0,
                completedMinutes: 0,
                bookedMinutes: 0,
                remainingBookableMinutes: 120,
            },
        ];
        page.selectedCourseId.value = page.courses.value[0]!.id;
        fetchMyCourses.mockResolvedValue(page.courses.value);
        page.handleRequestBookSlot(slot);

        return page;
    }

    function shortProposal() {
        return {
            available: false,
            issues: [
                {
                    code: 'COURSE_LIMIT_EXCEEDED' as const,
                    field: 'courseId' as const,
                },
            ],
            policy: { minDurationMinutes: 60, maxDurationMinutes: 120 },
            remainingMinutes: 30,
            alternative: {
                startTime: '10:00',
                endTime: '10:30',
                durationMinutes: 30,
            },
        };
    }

    it('offers a shorter slot after a write conflict and waits for a separate confirmation', async () => {
        const page = readyPage();

        bookOwnLesson
            .mockRejectedValueOnce({ statusCode: 409 })
            .mockResolvedValueOnce({});
        recheckAvailability
            .mockResolvedValueOnce('available')
            .mockImplementationOnce(async () => {
                availabilityResult.value = shortProposal();

                return 'unavailable';
            })
            .mockResolvedValueOnce('available');
        await page.handleConfirmBookSlot();
        expect(bookOwnLesson).toHaveBeenCalledTimes(1);
        expect(page.pendingShorterSlot.value?.endTime).toBe('10:30');
        expect(page.isConfirmDialogOpen.value).toBe(true);
        expect(page.bookingSlotKey.value).toBeNull();
        await page.handleConfirmShorterSlot();
        expect(bookOwnLesson).toHaveBeenCalledTimes(2);
        expect(bookOwnLesson.mock.lastCall![0]).toMatchObject({
            bookingMode: 'REMAINING_PACKAGE',
        });
        expect(page.isConfirmDialogOpen.value).toBe(false);
        expect(fetchMyCourses).toHaveBeenCalledTimes(1);
    });
    it.each([20, undefined])(
        'discards an obsolete short proposal after 409 with remaining balance %s',
        async (balance) => {
            const page = readyPage();

            availabilityResult.value = shortProposal();
            recheckAvailability.mockResolvedValueOnce('unavailable');
            await page.handleConfirmBookSlot();
            recheckAvailability
                .mockResolvedValueOnce('available')
                .mockImplementationOnce(async () => {
                    availabilityResult.value = {
                        ...shortProposal(),
                        remainingMinutes: balance,
                        alternative: undefined,
                    };

                    return 'unavailable';
                });
            bookOwnLesson.mockRejectedValueOnce({ statusCode: 409 });
            await page.handleConfirmShorterSlot();
            expect(page.pendingShorterSlot.value).toBeNull();
            expect(page.isConfirmDialogOpen.value).toBe(true);
            expect(page.bookingSlotKey.value).toBeNull();
            expect(page.bookingFeedbackMessage.value).toContain(
                balance === undefined ? 'dostępność' : '20 min',
            );
        },
    );
    it('refreshes slots after a write conflict without an alternative', async () => {
        const page = readyPage();

        await nextTick();
        fetchSlots.mockClear();
        bookOwnLesson.mockRejectedValueOnce({ statusCode: 409 });
        recheckAvailability
            .mockResolvedValueOnce('available')
            .mockResolvedValueOnce('unavailable');
        availabilityResult.value = null;
        await page.handleConfirmBookSlot();
        expect(fetchSlots).toHaveBeenCalledTimes(1);
        expect(page.bookingFeedbackMessage.value).toContain('właśnie zajęty');
        expect(page.isConfirmDialogOpen.value).toBe(true);
    });
    it('reserves once for two confirmations and releases the lock after failure for retry', async () => {
        const page = readyPage();
        let rejectWrite!: (error: unknown) => void;

        bookOwnLesson
            .mockReturnValueOnce(
                new Promise((_resolve, reject) => {
                    rejectWrite = reject;
                }),
            )
            .mockResolvedValueOnce({});
        recheckAvailability.mockResolvedValue('available');
        const first = page.handleConfirmBookSlot();

        await nextTick();
        await page.handleConfirmBookSlot();
        expect(bookOwnLesson).toHaveBeenCalledTimes(1);
        rejectWrite({ statusCode: 503 });
        await first;
        expect(page.bookingSlotKey.value).toBeNull();
        expect(page.isConfirmDialogOpen.value).toBe(true);
        await page.handleConfirmBookSlot();
        expect(bookOwnLesson).toHaveBeenCalledTimes(2);
        expect(page.isConfirmDialogOpen.value).toBe(false);
    });
});
