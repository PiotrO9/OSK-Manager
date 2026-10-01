import { describe, expect, it } from 'vitest';
import type { SchoolAvailabilitySlot } from '~/types/schools/schoolAvailabilitySlots';
import {
    canStudentBookSlotWithCourseHours,
    filterStudentLessonBookableSlots,
    formatStudentLessonBookingAvailableSlotsLabel,
    isStudentLessonBookingNextWeekDisabled,
    isStudentLessonBookingPrevWeekDisabled,
} from './studentLessonBookingPage';
import { getMonday } from '~/utils/date/weeklyCalendarDates';

const slot: SchoolAvailabilitySlot = {
    instructorId: '11111111-1111-4111-8111-111111111111',
    instructorFirstName: 'Jan',
    instructorLastName: 'Kowalski',
    date: '2026-09-30',
    startTime: '10:00',
    endTime: '11:00',
};

describe('studentLessonBookingPage utils', () => {
    it('filters out past slots on the current day', () => {
        const now = new Date('2026-09-30T12:30:00');
        const filtered = filterStudentLessonBookableSlots(
            [
                slot,
                { ...slot, startTime: '13:00', endTime: '14:00' },
                { ...slot, date: '2026-09-29' },
            ],
            now,
        );

        expect(filtered).toHaveLength(1);
        expect(filtered[0]?.startTime).toBe('13:00');
    });

    it('blocks booking when slot duration exceeds remaining hours', () => {
        expect(
            canStudentBookSlotWithCourseHours(
                { totalHours: 30, progress: 29.5 },
                { startTime: '10:00', endTime: '11:00' },
            ),
        ).toBe(false);
    });

    it('formats available slot count with proper plural forms', () => {
        expect(
            formatStudentLessonBookingAvailableSlotsLabel(1, {
                hasCourse: true,
            }),
        ).toBe('1 dostępny termin');
        expect(
            formatStudentLessonBookingAvailableSlotsLabel(2, {
                hasCourse: true,
            }),
        ).toBe('2 dostępne terminy');
    });

    it('disables previous week navigation on the current week', () => {
        const today = new Date('2026-09-30T10:00:00');
        const currentWeek = getMonday(today);

        expect(
            isStudentLessonBookingPrevWeekDisabled(currentWeek, today),
        ).toBe(true);
        expect(
            isStudentLessonBookingNextWeekDisabled(currentWeek, today),
        ).toBe(false);
    });
});
