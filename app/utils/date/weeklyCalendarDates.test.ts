import { describe, expect, it } from 'vitest';
import {
    formatDateOnly,
    getMonday,
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
});
