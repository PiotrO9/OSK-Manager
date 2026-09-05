import { describe, expect, it } from 'vitest';
import type { ScheduleLessonItem } from '~/types/schedule/schedule';
import {
    buildStudentScheduleDayGroups,
    displayStudentScheduleTimeRange,
    getStudentScheduleDateKeyFromIso,
    getStudentScheduleItemDescription,
    getStudentScheduleItemTitle,
    getStudentScheduleStatusLabel,
    getStudentScheduleStatusTone,
    isStudentScheduleCancellableLesson,
} from './studentScheduleGroupedList';

const item = (
    overrides: Partial<ScheduleLessonItem> = {},
): ScheduleLessonItem => ({
    id: 'lesson-1',
    kind: 'lesson',
    type: 'PRACTICE',
    status: 'SCHEDULED',
    startTime: '2026-09-05T08:00:00.000Z',
    endTime: '2026-09-05T09:00:00.000Z',
    instructor: {
        id: 'instructor-1',
        firstName: 'Adam',
        lastName: 'Nowak',
    },
    student: undefined,
    vehicle: {
        id: 'vehicle-1',
        name: 'Toyota',
        registrationNumber: 'KR12345',
    },
    participantCount: null,
    ...overrides,
});

describe('student schedule grouped list utilities', () => {
    it('builds stable date keys and time ranges', () => {
        expect(getStudentScheduleDateKeyFromIso(item().startTime)).toBe(
            '2026-09-05',
        );
        expect(getStudentScheduleDateKeyFromIso('invalid-date')).toBe(
            'invalid-da',
        );
        expect(displayStudentScheduleTimeRange(item())).toMatch(
            /^\d{2}:\d{2} - \d{2}:\d{2}$/,
        );
    });

    it('groups schedule items by day and sorts days and items', () => {
        const groups = buildStudentScheduleDayGroups([
            item({
                id: 'later',
                startTime: '2026-09-06T10:00:00.000Z',
                endTime: '2026-09-06T11:00:00.000Z',
            }),
            item({
                id: 'second',
                startTime: '2026-09-05T09:00:00.000Z',
                endTime: '2026-09-05T10:00:00.000Z',
            }),
            item({
                id: 'first',
                startTime: '2026-09-05T08:00:00.000Z',
                endTime: '2026-09-05T09:00:00.000Z',
            }),
        ]);

        expect(groups.map((group) => group.date)).toEqual([
            '2026-09-05',
            '2026-09-06',
        ]);
        expect(groups[0]?.items.map((entry) => entry.id)).toEqual([
            'first',
            'second',
        ]);
    });

    it('formats item title, description and status presentation', () => {
        expect(getStudentScheduleItemTitle(item())).toBe(
            'Jazda praktyczna - Adam Nowak',
        );
        expect(getStudentScheduleItemDescription(item())).toBe(
            'Toyota (KR12345)',
        );
        expect(
            getStudentScheduleItemDescription(
                item({
                    type: 'THEORY',
                    vehicle: undefined,
                    participantCount: 12,
                }),
            ),
        ).toBe('12 uczestnikow');
        expect(getStudentScheduleStatusLabel('DONE')).toBe('Zakończone');
        expect(getStudentScheduleStatusTone('NO_SHOW')).toBe('warning');
    });

    it('allows cancellation only for scheduled practice lessons when enabled', () => {
        expect(
            isStudentScheduleCancellableLesson({
                item: item(),
                studentLessonCancelEnabled: true,
            }),
        ).toBe(true);
        expect(
            isStudentScheduleCancellableLesson({
                item: item({ type: 'THEORY' }),
                studentLessonCancelEnabled: true,
            }),
        ).toBe(false);
        expect(
            isStudentScheduleCancellableLesson({
                item: item(),
                studentLessonCancelEnabled: false,
            }),
        ).toBe(false);
    });
});
