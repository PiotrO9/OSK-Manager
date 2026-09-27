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
        expect(buildScheduleManagerItemEditRoute(lesson, 'school-1')).toEqual({
            path: '/manager/lessons/lesson-1/edit',
        });
    });

    it('keeps school context for instructor event editing', () => {
        expect(
            buildScheduleManagerItemEditRoute(
                { ...lesson, id: 'event-1', kind: 'instructor_event' },
                'school-1',
            ),
        ).toEqual({
            path: '/manager/events/event-1/edit',
            query: { schoolId: 'school-1' },
        });
    });

    it('does not link to completed or past lessons', () => {
        expect(
            buildScheduleManagerItemEditRoute(
                { ...lesson, status: 'COMPLETED' },
                'school-1',
            ),
        ).toBeNull();
        expect(
            buildScheduleManagerItemEditRoute(
                { ...lesson, endTime: '2026-09-20T08:00:00.000Z' },
                'school-1',
            ),
        ).toBeNull();
    });
});
