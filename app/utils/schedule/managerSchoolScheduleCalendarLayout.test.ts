import { describe, expect, it } from 'vitest';
import type { ScheduleLessonItem } from '~/types/schedule/schedule';
import {
    buildScheduleItemsByDate,
    calculateSameStartTileHeightPx,
    calculateScheduleBlockTopPx,
    countScheduleInstructors,
    formatEarliestScheduleStartLabel,
} from './managerSchoolScheduleCalendarLayout';

function scheduleLesson(
    overrides: Partial<ScheduleLessonItem> = {},
): ScheduleLessonItem {
    return {
        id: 'lesson-1',
        kind: 'lesson',
        type: 'PRACTICE',
        status: 'SCHEDULED',
        startTime: '2026-08-10T09:00:00',
        endTime: '2026-08-10T10:00:00',
        instructor: {
            id: 'instructor-1',
            firstName: 'Jan',
            lastName: 'Kowalski',
        },
        student: {
            id: 'student-1',
            firstName: 'Anna',
            lastName: 'Nowak',
        },
        ...overrides,
    };
}

describe('managerSchoolScheduleCalendarLayout', () => {
    it('groups schedule items by date and keeps day items sorted by start time', () => {
        const late = scheduleLesson({
            id: 'late',
            startTime: '2026-08-10T12:00:00',
        });
        const invalid = scheduleLesson({
            id: 'invalid',
            startTime: 'not-a-date',
        });
        const early = scheduleLesson({
            id: 'early',
            startTime: '2026-08-10T08:00:00',
        });

        const grouped = buildScheduleItemsByDate([late, invalid, early]);

        expect([...grouped.keys()]).toEqual(['2026-08-10']);
        expect(grouped.get('2026-08-10')).toEqual([early, late]);
    });

    it('counts instructors by id first and falls back to names without ids', () => {
        expect(
            countScheduleInstructors([
                scheduleLesson({
                    id: 'a',
                    instructor: {
                        id: 'instructor-1',
                        firstName: 'Jan',
                        lastName: 'Kowalski',
                    },
                }),
                scheduleLesson({
                    id: 'b',
                    instructor: {
                        id: 'instructor-1',
                        firstName: 'Jan',
                        lastName: 'Kowalski',
                    },
                }),
                scheduleLesson({
                    id: 'c',
                    instructor: {
                        id: '',
                        firstName: 'Anna',
                        lastName: 'Nowak',
                    },
                }),
            ]),
        ).toBe(2);
    });

    it('formats earliest valid start time and exposes empty fallback', () => {
        expect(
            formatEarliestScheduleStartLabel([
                scheduleLesson({ startTime: 'not-a-date' }),
                scheduleLesson({ startTime: '2026-08-10T11:30:00' }),
                scheduleLesson({ startTime: '2026-08-10T08:15:00' }),
            ]),
        ).toBe('08:15');
        expect(formatEarliestScheduleStartLabel([])).toBe('--:--');
    });

    it('stacks same-start lessons by deterministic id order', () => {
        const first = scheduleLesson({
            id: 'a-same-start',
            startTime: '2026-08-10T09:00:00',
            endTime: '2026-08-10T10:00:00',
        });
        const second = scheduleLesson({
            id: 'b-same-start',
            startTime: '2026-08-10T09:00:00',
            endTime: '2026-08-10T10:30:00',
        });
        const dayItems = [second, first];

        expect(calculateSameStartTileHeightPx(first, dayItems)).toBe(43.5);
        expect(calculateScheduleBlockTopPx(first, dayItems)).toBe(120);
        expect(calculateScheduleBlockTopPx(second, dayItems)).toBe(165.5);
    });
});
