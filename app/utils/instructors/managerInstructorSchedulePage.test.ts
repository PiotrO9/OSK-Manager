import { describe, expect, it } from 'vitest';
import {
    buildManagerInstructorScheduleBackHref,
    formatManagerInstructorScheduleRangeLabel,
    formatManagerInstructorScheduleWeekCompact,
    formatManagerInstructorScheduleWeekLabel,
    getManagerInstructorScheduleInstructorId,
    getManagerInstructorScheduleRouteString,
} from './managerInstructorSchedulePage';

describe('manager instructor schedule page helpers', () => {
    it('normalizes route params and query values', () => {
        expect(getManagerInstructorScheduleRouteString(' instructor-1 ')).toBe(
            'instructor-1',
        );
        expect(
            getManagerInstructorScheduleRouteString([' instructor-2 ', 'x']),
        ).toBe('instructor-2');
        expect(getManagerInstructorScheduleRouteString(undefined)).toBe('');
    });

    it('reads instructor identifier from Nuxt route shape', () => {
        const route = {
            params: { id: [' instructor-1 '] },
        };

        expect(getManagerInstructorScheduleInstructorId(route)).toBe(
            'instructor-1',
        );
    });

    it('formats schedule date labels and keeps invalid input unchanged', () => {
        expect(formatManagerInstructorScheduleRangeLabel('not-a-date')).toBe(
            'not-a-date',
        );
        expect(
            formatManagerInstructorScheduleWeekCompact(new Date(2026, 8, 7)),
        ).toBe('7-13 września');
        expect(
            formatManagerInstructorScheduleWeekLabel(new Date(2026, 8, 7)),
        ).toBe('7 września 2026');
    });

    it('builds back href without school query', () => {
        expect(buildManagerInstructorScheduleBackHref('')).toBe(
            '/manager/instructors',
        );
        expect(buildManagerInstructorScheduleBackHref('instructor-1')).toBe(
            '/manager/instructors/instructor-1',
        );
        expect(buildManagerInstructorScheduleBackHref(' instructor-1 ')).toBe(
            '/manager/instructors/instructor-1',
        );
    });
});
