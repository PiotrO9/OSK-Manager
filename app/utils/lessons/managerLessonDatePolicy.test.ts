import { parseDate } from '@internationalized/date';
import { describe, expect, it } from 'vitest';
import { isManagerLessonDateDisabled } from './managerLessonDatePolicy';

describe('manager lesson date selection', () => {
    const weekdays = [1, 2, 3, 4, 5];

    it('disables an ordinary weekend outside instructor working days', () => {
        expect(
            isManagerLessonDateDisabled(parseDate('2026-10-03'), {
                workingWeekdays: weekdays,
            }),
        ).toBe(true);
    });

    it('allows a weekend with a working exception', () => {
        expect(
            isManagerLessonDateDisabled(parseDate('2026-10-03'), {
                workingWeekdays: weekdays,
                workingExceptionDates: ['2026-10-03'],
            }),
        ).toBe(false);
    });

    it('keeps a school-closed weekend disabled despite an instructor exception', () => {
        expect(
            isManagerLessonDateDisabled(parseDate('2026-10-03'), {
                workingWeekdays: weekdays,
                workingExceptionDates: ['2026-10-03'],
                schoolWorkingDaysMask: 62,
            }),
        ).toBe(true);
    });

    it('allows Saturday when both OSK and instructor work then', () => {
        expect(
            isManagerLessonDateDisabled(parseDate('2026-10-03'), {
                workingWeekdays: weekdays,
                workingExceptionDates: ['2026-10-03'],
                schoolWorkingDaysMask: 126,
            }),
        ).toBe(false);
    });

    it('disables a weekday marked as day off', () => {
        expect(
            isManagerLessonDateDisabled(parseDate('2026-10-05'), {
                workingWeekdays: weekdays,
                dayOffDates: ['2026-10-05'],
            }),
        ).toBe(true);
    });
});
