import { describe, expect, it } from 'vitest';

import {
    buildManagerInstructorWeekDays,
    connectManagerInstructorAdjacentSlots,
    formatManagerInstructorWeekRangeCompactLabel,
    formatManagerInstructorWeekRangeLabel,
    getManagerInstructorBusiestDay,
    getManagerInstructorEarliestSlotLabel,
    getManagerInstructorSlotHeightPx,
    getManagerInstructorSlotTopPx,
    getManagerInstructorVisibleHourRange,
    groupManagerInstructorSlotRuns,
    groupManagerInstructorSlotsByDate,
} from './managerInstructorWeeklyCalendar';

describe('manager instructor weekly calendar model', () => {
    it('calculates slot top offset from the base hour', () => {
        expect(getManagerInstructorSlotTopPx('07:00')).toBe(0);
        expect(getManagerInstructorSlotTopPx('08:30')).toBe(90);
        expect(getManagerInstructorSlotTopPx('06:30', 6)).toBe(30);
        expect(getManagerInstructorSlotTopPx('bad')).toBe(0);
    });

    it('calculates slot height and expands visible hours around data', () => {
        expect(
            getManagerInstructorSlotHeightPx({
                startTime: '08:00',
                endTime: '09:30',
            }),
        ).toBe(90);
        expect(
            getManagerInstructorSlotHeightPx({
                startTime: '08:00',
                endTime: '08:10',
            }),
        ).toBe(28);

        expect(
            getManagerInstructorVisibleHourRange([
                {
                    date: '2026-09-07',
                    startTime: '06:30',
                    endTime: '20:15',
                },
            ]),
        ).toEqual({ baseHour: 6, endHour: 21 });
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

    it('marks only directly touching slots in the same day as connected', () => {
        const connected = connectManagerInstructorAdjacentSlots([
            { date: '2026-09-07', startTime: '11:00', endTime: '12:00' },
            { date: '2026-09-07', startTime: '10:00', endTime: '11:00' },
            { date: '2026-09-07', startTime: '12:00', endTime: '13:00' },
            { date: '2026-09-07', startTime: '14:00', endTime: '15:00' },
            { date: '2026-09-08', startTime: '15:00', endTime: '16:00' },
        ]);

        expect(
            connected.map(({ slot, joinsPrevious, joinsNext }) => ({
                startTime: slot.startTime,
                joinsPrevious,
                joinsNext,
            })),
        ).toEqual([
            { startTime: '10:00', joinsPrevious: false, joinsNext: true },
            { startTime: '11:00', joinsPrevious: true, joinsNext: true },
            { startTime: '12:00', joinsPrevious: true, joinsNext: false },
            { startTime: '14:00', joinsPrevious: false, joinsNext: false },
            { startTime: '15:00', joinsPrevious: false, joinsNext: false },
        ]);
    });

    it('does not connect overlapping slots', () => {
        const connected = connectManagerInstructorAdjacentSlots([
            { date: '2026-09-07', startTime: '10:00', endTime: '11:30' },
            { date: '2026-09-07', startTime: '11:00', endTime: '12:00' },
        ]);

        expect(
            connected.every((item) => !item.joinsPrevious && !item.joinsNext),
        ).toBe(true);
    });

    it('groups consecutive slots into one visual run while retaining exact bookable slots', () => {
        const runs = groupManagerInstructorSlotRuns([
            { date: '2026-09-07', startTime: '11:00', endTime: '12:00' },
            { date: '2026-09-07', startTime: '10:00', endTime: '11:00' },
            { date: '2026-09-07', startTime: '12:00', endTime: '13:00' },
            { date: '2026-09-07', startTime: '14:00', endTime: '15:00' },
            { date: '2026-09-08', startTime: '15:00', endTime: '16:00' },
        ]);

        expect(
            runs.map(({ date, startTime, endTime, slots }) => ({
                date,
                startTime,
                endTime,
                bookableTimes: slots.map((slot) => slot.startTime),
            })),
        ).toEqual([
            {
                date: '2026-09-07',
                startTime: '10:00',
                endTime: '13:00',
                bookableTimes: ['10:00', '11:00', '12:00'],
            },
            {
                date: '2026-09-07',
                startTime: '14:00',
                endTime: '15:00',
                bookableTimes: ['14:00'],
            },
            {
                date: '2026-09-08',
                startTime: '15:00',
                endTime: '16:00',
                bookableTimes: ['15:00'],
            },
        ]);
    });

    it('keeps overlapping slots in separate visual runs', () => {
        const runs = groupManagerInstructorSlotRuns([
            { date: '2026-09-07', startTime: '10:00', endTime: '11:30' },
            { date: '2026-09-07', startTime: '11:00', endTime: '12:00' },
        ]);

        expect(runs).toHaveLength(2);
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
