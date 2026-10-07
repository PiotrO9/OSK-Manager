import { computed, ref, shallowRef, watch } from 'vue';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { SchoolAvailabilitySlot } from '~/types/schools/schoolAvailabilitySlots';
import { useScheduleAvailabilityCheck } from '../schedule/useScheduleAvailabilityCheck';
import { useStudentLessonBookingPage } from './useStudentLessonBookingPage';

const bookOwnLesson = vi.fn();
const fetchSlots = vi.fn();
const addToast = vi.fn();
const recheckAvailability = vi.fn();
const availabilityFetcher = vi.fn();
const availabilityMessage = ref('Wybrany pojazd jest zajęty.');
const availabilityResult = ref<{ available: boolean; issues: [] } | null>(null);

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
    vi.stubGlobal('useCoursesApi', () => ({ fetchMyCourses: vi.fn() }));
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
        recheckAvailability.mockResolvedValue('unavailable');
        fetchSlots.mockResolvedValue({ slots: [] });
        installGlobals();
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
            },
        ];
        page.selectedCourseId.value = page.courses.value[0]!.id;

        page.pendingConfirmationSlot.value = slot;
        await page.handleConfirmBookSlot();

        expect(recheckAvailability).toHaveBeenCalledOnce();
        expect(bookOwnLesson).not.toHaveBeenCalled();
        expect(page.bookingFeedbackMessage.value).toBe(
            'Wybrany pojazd jest zajęty.',
        );
        expect(page.slotsErrorMessage.value).toBeNull();
        expect(page.bookingSlotKey.value).toBeNull();
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
            },
        ];
        page.selectedCourseId.value = page.courses.value[0]!.id;
        page.pendingConfirmationSlot.value = slot;

        await page.handleConfirmBookSlot();

        expect(bookOwnLesson).toHaveBeenCalledOnce();
        expect(page.bookingFeedbackTone.value).toBe('success');
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

        expect(page.isConfirmDialogOpen.value).toBe(false);
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
            },
        ];

        expect(page.bookableCourses.value).toHaveLength(0);
        expect(page.noBookableCoursesState.value.title).toBe(
            'Wykorzystano dostępne godziny',
        );
    });
});
