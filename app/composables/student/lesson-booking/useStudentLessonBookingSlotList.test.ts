import { describe, expect, it } from 'vitest';
import type { SchoolAvailabilitySlot } from '~/types/schools/schoolAvailabilitySlots';
import {
    addStudentLessonBookingDays,
    formatStudentLessonBookingDateLabel,
    getStudentLessonBookingBestDayLabel,
    getStudentLessonBookingHourFromTime,
    getStudentLessonBookingInstructorName,
    getStudentLessonBookingScheduleHourRange,
    getStudentLessonBookingScheduleRows,
    getStudentLessonBookingSlotGroups,
    getStudentLessonBookingSlotListSlotKey,
    getStudentLessonBookingWeekDays,
} from './useStudentLessonBookingSlotList';

function makeSlot(
    overrides: Partial<SchoolAvailabilitySlot>,
): SchoolAvailabilitySlot {
    return {
        instructorId: 'instructor-1',
        instructorFirstName: 'Jan',
        instructorLastName: 'Nowak',
        date: '2026-08-17',
        startTime: '08:00',
        endTime: '09:00',
        ...overrides,
    };
}

describe('useStudentLessonBookingSlotList', () => {
    it('formatuje daty i zakres tygodnia', () => {
        expect(formatStudentLessonBookingDateLabel('2026-08-17')).toBe(
            'poniedziałek, 17 sierpnia',
        );
        expect(formatStudentLessonBookingDateLabel('wrong')).toBe('wrong');
        expect(addStudentLessonBookingDays('2026-08-17', 2)).toBe('2026-08-19');
        expect(getStudentLessonBookingWeekDays('2026-08-17')).toEqual([
            '2026-08-17',
            '2026-08-18',
            '2026-08-19',
            '2026-08-20',
            '2026-08-21',
            '2026-08-22',
            '2026-08-23',
        ]);
    });

    it('tworzy stabilny klucz, nazwę instruktora i godzinę startu', () => {
        const slot = makeSlot({
            instructorId: 'i-1',
            instructorFirstName: ' Anna ',
            instructorLastName: ' Kowal ',
            date: '2026-08-18',
            startTime: '12:30',
            endTime: '13:30',
        });

        expect(getStudentLessonBookingInstructorName(slot)).toBe(
            'Anna   Kowal',
        );
        expect(getStudentLessonBookingSlotListSlotKey(slot)).toBe(
            '2026-08-18|12:30|13:30|i-1',
        );
        expect(getStudentLessonBookingHourFromTime('12:30')).toBe(12);
        expect(getStudentLessonBookingHourFromTime('x')).toBeNull();
    });

    it('grupuje sloty po dniach i sortuje po czasie oraz instruktorze', () => {
        const groups = getStudentLessonBookingSlotGroups({
            todayIso: '2026-08-18',
            weekDays: ['2026-08-17', '2026-08-18'],
            slots: [
                makeSlot({
                    instructorId: 'b',
                    instructorFirstName: 'Zofia',
                    startTime: '10:00',
                }),
                makeSlot({
                    instructorId: 'a',
                    instructorFirstName: 'Adam',
                    startTime: '09:00',
                }),
                makeSlot({
                    instructorId: 'c',
                    instructorFirstName: 'Bartek',
                    startTime: '09:00',
                }),
            ],
        });

        expect(groups[0]?.isToday).toBe(false);
        expect(groups[1]?.isToday).toBe(true);
        expect(
            groups[0]?.slots.map((slot) => slot.instructorFirstName),
        ).toEqual(['Adam', 'Bartek', 'Zofia']);
    });

    it('liczy zakres godzin i wiersze desktopowego harmonogramu', () => {
        const slots = [
            makeSlot({
                date: '2026-08-17',
                startTime: '06:00',
                endTime: '07:00',
            }),
            makeSlot({
                date: '2026-08-18',
                startTime: '19:00',
                endTime: '20:00',
            }),
        ];
        const range = getStudentLessonBookingScheduleHourRange(slots);

        expect(range).toEqual({ startHour: 6, endHour: 20 });

        const rows = getStudentLessonBookingScheduleRows({
            slots,
            weekDays: ['2026-08-17', '2026-08-18'],
            startHour: range.startHour,
            endHour: range.endHour,
        });

        expect(rows[0]?.label).toBe('06:00');
        expect(rows.at(-1)?.label).toBe('20:00');
        expect(rows[0]?.cells[0]?.slots).toHaveLength(1);
        expect(rows[13]?.cells[1]?.slots).toHaveLength(1);
    });

    it('zwraca label dnia z największą dostępnością', () => {
        const groups = getStudentLessonBookingSlotGroups({
            todayIso: '2026-08-17',
            weekDays: ['2026-08-17', '2026-08-18'],
            slots: [
                makeSlot({ date: '2026-08-18', instructorId: 'a' }),
                makeSlot({ date: '2026-08-18', instructorId: 'b' }),
            ],
        });

        expect(getStudentLessonBookingBestDayLabel(groups)).toBe(
            'Najwięcej dostępności: wtorek, 18 sierpnia',
        );
        expect(
            getStudentLessonBookingBestDayLabel(
                getStudentLessonBookingSlotGroups({
                    todayIso: '2026-08-17',
                    weekDays: ['2026-08-17'],
                    slots: [],
                }),
            ),
        ).toBe('');
    });
});
