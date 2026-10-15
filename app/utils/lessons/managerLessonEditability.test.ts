import { describe, expect, it } from 'vitest';
import { isManagerLessonCancellable } from './managerLessonEditability';

describe('isManagerLessonCancellable', () => {
    const now = Date.parse('2026-10-14T08:00:00.000Z');

    it('allows only a scheduled lesson that has not started', () => {
        expect(
            isManagerLessonCancellable(
                'SCHEDULED',
                '2026-10-19T08:00:00.000Z',
                now,
            ),
        ).toBe(true);
        expect(
            isManagerLessonCancellable(
                'SCHEDULED',
                '2026-10-14T08:00:00.000Z',
                now,
            ),
        ).toBe(false);
        expect(
            isManagerLessonCancellable(
                'CANCELLED',
                '2026-10-19T08:00:00.000Z',
                now,
            ),
        ).toBe(false);
    });
});
