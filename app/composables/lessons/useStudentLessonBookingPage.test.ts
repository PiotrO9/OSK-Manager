import { computed, ref, shallowRef, watch } from 'vue';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { SchoolAvailabilitySlot } from '~/types/schools/schoolAvailabilitySlots';
import { useStudentLessonBookingPage } from './useStudentLessonBookingPage';

const bookOwnLesson = vi.fn();
const fetchSlots = vi.fn();
const addToast = vi.fn();
const recheckAvailability = vi.fn();
const availabilityMessage = ref('Wybrany pojazd jest zajęty.');

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

        await page.handleBookSlot(slot);

        expect(recheckAvailability).toHaveBeenCalledOnce();
        expect(bookOwnLesson).not.toHaveBeenCalled();
        expect(page.slotsErrorMessage.value).toBe(
            'Wybrany pojazd jest zajęty.',
        );
        expect(page.bookingSlotKey.value).toBeNull();
    });
});
