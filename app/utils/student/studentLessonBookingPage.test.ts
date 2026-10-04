import { describe, expect, it } from 'vitest';
import type { SchoolAvailabilitySlot } from '~/types/schools/schoolAvailabilitySlots';
import {
    canStudentBookSlotWithCourseHours,
    filterStudentLessonBookableSlots,
    formatStudentLessonBookingAvailableSlotsLabel,
    formatStudentLessonBookingWeekRangeCompactLabel,
    isStudentLessonBookingNextWeekDisabled,
    isStudentLessonBookingPrevWeekDisabled,
    positionStudentLessonBookingOverlappingSlots,
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

    it('formats week ranges across one or two months', () => {
        expect(
            formatStudentLessonBookingWeekRangeCompactLabel(
                new Date(2026, 9, 5),
            ),
        ).toBe('5–11 października');
        expect(
            formatStudentLessonBookingWeekRangeCompactLabel(
                new Date(2026, 8, 28),
            ),
        ).toBe('28 września – 4 października');
    });

    it('places overlapping instructors in separate lanes', () => {
        const positioned = positionStudentLessonBookingOverlappingSlots([
            slot,
            {
                ...slot,
                instructorId: '22222222-2222-4222-8222-222222222222',
                instructorFirstName: 'Anna',
            },
            {
                ...slot,
                instructorId: '33333333-3333-4333-8333-333333333333',
                startTime: '11:00',
                endTime: '12:00',
            },
        ]);

        expect(
            positioned.map(({ laneIndex, laneCount }) => ({
                laneIndex,
                laneCount,
            })),
        ).toEqual([
            { laneIndex: 0, laneCount: 2 },
            { laneIndex: 1, laneCount: 2 },
            { laneIndex: 0, laneCount: 1 },
        ]);
    });

    it('disables previous week navigation on the current week', () => {
        const today = new Date('2026-09-30T10:00:00');
        const currentWeek = getMonday(today);

        expect(isStudentLessonBookingPrevWeekDisabled(currentWeek, today)).toBe(
            true,
        );
        expect(isStudentLessonBookingNextWeekDisabled(currentWeek, today)).toBe(
            false,
        );
    });
});
