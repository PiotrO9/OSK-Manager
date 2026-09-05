import { describe, expect, it } from 'vitest';

import {
    buildManagerInstructorWeekDays,
    formatManagerInstructorWeekRangeCompactLabel,
    formatManagerInstructorWeekRangeLabel,
    getManagerInstructorBusiestDay,
    getManagerInstructorEarliestSlotLabel,
    getManagerInstructorSlotTopPx,
    groupManagerInstructorSlotsByDate,
} from './managerInstructorWeeklyCalendar';

describe('manager instructor weekly calendar model', () => {
    it('calculates slot top offset from the base hour', () => {
        expect(getManagerInstructorSlotTopPx('07:00')).toBe(0);
        expect(getManagerInstructorSlotTopPx('08:30')).toBe(90);
        expect(getManagerInstructorSlotTopPx('bad')).toBe(0);
    });

    it('builds seven localized week days and marks today', () => {
        const days = buildManagerInstructorWeekDays(
            new Date(2026, 8, 7),
            new Date(2026, 8, 9),
        );

        expect(days).toHaveLength(7);
        expect(days[0]?.dateStr).toBe('2026-09-07');
        expect(days[2]?.dateStr).toBe('2026-09-09');
        expect(days[2]?.isToday).toBe(true);
    });

    it('formats full and compact week range labels', () => {
        const weekStart = new Date(2026, 8, 7);

        expect(formatManagerInstructorWeekRangeLabel(weekStart)).toContain(
            '7 września 2026',
        );
        expect(formatManagerInstructorWeekRangeCompactLabel(weekStart)).toBe(
            '07-13 września',
        );
    });

    it('groups slots by date and sorts them by start time', () => {
        const grouped = groupManagerInstructorSlotsByDate([
            { date: '2026-09-07', startTime: '10:00', endTime: '11:00' },
            { date: '2026-09-07', startTime: '08:00', endTime: '09:00' },
            { date: '2026-09-08', startTime: '09:00', endTime: '10:00' },
        ]);

        expect(grouped.get('2026-09-07')?.map((s) => s.startTime)).toEqual([
            '08:00',
            '10:00',
        ]);
        expect(grouped.get('2026-09-08')).toHaveLength(1);
    });

    it('returns earliest slot label and busiest day', () => {
        const days = buildManagerInstructorWeekDays(
            new Date(2026, 8, 7),
            new Date(2026, 8, 1),
        );
        const grouped = groupManagerInstructorSlotsByDate([
            { date: '2026-09-08', startTime: '12:00', endTime: '13:00' },
            { date: '2026-09-08', startTime: '09:00', endTime: '10:00' },
            { date: '2026-09-09', startTime: '08:00', endTime: '09:00' },
        ]);

        expect(
            getManagerInstructorEarliestSlotLabel([
                { date: '2026-09-08', startTime: '12:00', endTime: '13:00' },
                { date: '2026-09-08', startTime: '09:00', endTime: '10:00' },
            ]),
        ).toBe('09:00');
        expect(getManagerInstructorBusiestDay(days, grouped)).toEqual({
            label: days[1]?.shortHeader,
            count: 2,
        });
    });
});
