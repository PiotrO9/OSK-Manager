import { describe, expect, it } from 'vitest';
import {
    buildEventsDayEditRoute,
    buildEventsDayReturnRoute,
    readEventsDayDate,
} from './eventsDayNavigation';

describe('events day navigation', () => {
    it('accepts real dates and rejects invalid query values', () => {
        expect(readEventsDayDate('2026-09-27')).toBe('2026-09-27');
        expect(readEventsDayDate('2026-02-30')).toBeNull();
        expect(readEventsDayDate('0000-01-01')).toBeNull();
        expect(readEventsDayDate('x')).toBeNull();
    });

    it('opens a manager event with day context and without schoolId', () => {
        expect(
            buildEventsDayEditRoute(
                {
                    id: 'e-1',
                    kind: 'instructor_event',
                    type: 'THEORY',
                    status: 'PLANNED',
                    startTime: '2099-09-27T08:00:00Z',
                    endTime: '2099-09-27T09:00:00Z',
                },
                '2099-09-27',
            ),
        ).toEqual({
            path: '/manager/events/e-1/edit',
            query: { from: 'events', date: '2099-09-27' },
        });
        expect(
            buildEventsDayReturnRoute('events', '2099-09-27', 's-1'),
        ).toEqual({
            path: '/events',
            query: { date: '2099-09-27', schoolId: 's-1' },
        });
    });

    it('opens an editable lesson and ignores unrelated return paths', () => {
        expect(
            buildEventsDayEditRoute(
                {
                    id: 'l-1',
                    kind: 'lesson',
                    type: 'PRACTICE',
                    status: 'SCHEDULED',
                    startTime: '2099-09-27T08:00:00Z',
                    endTime: '2099-09-27T09:00:00Z',
                },
                '2099-09-27',
            ),
        ).toEqual({
            path: '/manager/lessons/l-1/edit',
            query: { from: 'events', date: '2099-09-27' },
        });
        expect(
            buildEventsDayReturnRoute(
                'https://example.com',
                '2099-09-27',
                's-1',
            ),
        ).toBeNull();
    });
});
