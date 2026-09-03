import { parseDate } from '@internationalized/date';
import { describe, expect, it } from 'vitest';
import { formatDateOnly } from '~/utils/date/weeklyCalendarDates';
import {
    buildManagerSchoolScheduleWeekDays,
    formatManagerSchoolScheduleCompactWeekRangeLabel,
    formatManagerSchoolScheduleWeekRangeLabel,
    resolveManagerSchoolScheduleCalendarWeekStart,
    shiftManagerSchoolScheduleWeek,
} from './managerSchoolScheduleCalendarWeek';

describe('manager school schedule calendar week helpers', () => {
    it('builds seven localized week days from the selected week Monday', () => {
        const days = buildManagerSchoolScheduleWeekDays(
            new Date(2026, 7, 10),
            new Date(2026, 7, 12),
        );

        expect(days.map((day) => day.dateStr)).toEqual([
            '2026-08-10',
            '2026-08-11',
            '2026-08-12',
            '2026-08-13',
            '2026-08-14',
            '2026-08-15',
            '2026-08-16',
        ]);
        expect(days.map((day) => day.header)).toEqual([
            'pon., 10.08',
            'wt., 11.08',
            'śr., 12.08',
            'czw., 13.08',
            'pt., 14.08',
            'sob., 15.08',
            'niedz., 16.08',
        ]);
        expect(days.map((day) => day.isToday)).toEqual([
            false,
            false,
            true,
            false,
            false,
            false,
            false,
        ]);
    });

    it('formats full and compact week range labels', () => {
        const sameMonthWeek = new Date(2026, 7, 10);
        const crossMonthWeek = new Date(2026, 7, 31);

        expect(formatManagerSchoolScheduleWeekRangeLabel(sameMonthWeek)).toBe(
            '10 sierpnia 2026 - 16 sierpnia 2026',
        );
        expect(
            formatManagerSchoolScheduleCompactWeekRangeLabel(sameMonthWeek),
        ).toBe('10-16 sierpień');
        expect(
            formatManagerSchoolScheduleCompactWeekRangeLabel(crossMonthWeek),
        ).toBe('31 sierpień - 6 wrzesień');
    });

    it('shifts week start by full calendar weeks', () => {
        expect(
            formatDateOnly(
                shiftManagerSchoolScheduleWeek(new Date(2026, 7, 10), 'prev'),
            ),
        ).toBe('2026-08-03');
        expect(
            formatDateOnly(
                shiftManagerSchoolScheduleWeek(new Date(2026, 7, 10), 'next'),
            ),
        ).toBe('2026-08-17');
    });

    it('resolves calendar selection to Monday of the latest selected day', () => {
        const selectedWeekStart = resolveManagerSchoolScheduleCalendarWeekStart(
            [parseDate('2026-08-10'), parseDate('2026-08-13')],
        );

        expect(formatDateOnly(selectedWeekStart!)).toBe('2026-08-10');
        expect(resolveManagerSchoolScheduleCalendarWeekStart([])).toBeNull();
        expect(
            resolveManagerSchoolScheduleCalendarWeekStart(undefined),
        ).toBeNull();
    });
});
