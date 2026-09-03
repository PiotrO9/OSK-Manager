import { describe, expect, it } from 'vitest';
import {
    buildDatetimeLocal,
    dateValueToIsoDateString,
    formatDateOnly,
    formatDatetimeLocalPl,
    getMonday,
    isoDateStringToCalendarDate,
    parseDatetimeLocalParts,
    weekCalendarDatesFromMonday,
    weekRangeFromMonday,
} from './weeklyCalendarDates';

describe('weekly calendar date helpers', () => {
    it('resolves week range from Monday through Sunday', () => {
        const monday = getMonday(new Date(2026, 7, 16));

        expect(formatDateOnly(monday)).toBe('2026-08-10');
        expect(weekRangeFromMonday(monday)).toEqual({
            dateFrom: '2026-08-10',
            dateTo: '2026-08-16',
        });
    });

    it('builds seven calendar dates for the selected week', () => {
        const days = weekCalendarDatesFromMonday(new Date(2026, 7, 31));

        expect(days.map((day) => day.toString())).toEqual([
            '2026-08-31',
            '2026-09-01',
            '2026-09-02',
            '2026-09-03',
            '2026-09-04',
            '2026-09-05',
            '2026-09-06',
        ]);
    });

    it('round-trips ISO date strings through calendar values for UI payloads', () => {
        const calendarDate = isoDateStringToCalendarDate('2026-09-03');

        if (!calendarDate) {
            throw new Error('Expected valid calendar date');
        }

        expect(calendarDate.toString()).toBe('2026-09-03');
        expect(dateValueToIsoDateString(calendarDate)).toBe('2026-09-03');
    });

    it('round-trips datetime-local values through parsed form parts', () => {
        const parsed = parseDatetimeLocalParts('2026-09-03T09:30');

        if (!parsed) {
            throw new Error('Expected valid datetime-local parts');
        }

        expect(parsed).toMatchObject({
            hour: 9,
            minute: 30,
        });
        expect(parsed.date.toString()).toBe('2026-09-03');
        expect(
            buildDatetimeLocal(parsed.date, parsed.hour, parsed.minute),
        ).toBe('2026-09-03T09:30');
        expect(formatDatetimeLocalPl('2026-09-03T09:30')).toBe(
            '03.09.2026 09:30',
        );
    });
});
