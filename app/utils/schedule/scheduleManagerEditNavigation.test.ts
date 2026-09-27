import { describe, expect, it } from 'vitest';
import type { ScheduleLessonItem } from '~/types/schedule/schedule';
import { buildScheduleManagerItemEditRoute } from './scheduleManagerEditNavigation';

const lesson: ScheduleLessonItem = {
    id: 'lesson-1',
    kind: 'lesson',
    type: 'PRACTICE',
    status: 'SCHEDULED',
    startTime: '2099-09-30T07:00:00.000Z',
    endTime: '2099-09-30T08:00:00.000Z',
};

describe('schedule manager edit navigation', () => {
    it('opens lesson editing without schoolId in the URL', () => {
        expect(buildScheduleManagerItemEditRoute(lesson)).toEqual({
            path: '/manager/lessons/lesson-1/edit',
        });
    });

    it('opens instructor event editing without schoolId in the URL', () => {
        expect(
            buildScheduleManagerItemEditRoute({
                ...lesson,
                id: 'event-1',
                kind: 'instructor_event',
            }),
        ).toEqual({
            path: '/manager/events/event-1/edit',
        });
    });

    it('does not link to completed or past lessons', () => {
        expect(
            buildScheduleManagerItemEditRoute({
                ...lesson,
                status: 'COMPLETED',
            }),
        ).toBeNull();
        expect(
            buildScheduleManagerItemEditRoute({
                ...lesson,
                endTime: '2026-09-20T08:00:00.000Z',
            }),
        ).toBeNull();
    });
});
