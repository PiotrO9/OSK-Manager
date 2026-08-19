import { parseDate } from '@internationalized/date';
import { describe, expect, it } from 'vitest';
import { useEventsDayDateSelection } from './useEventsDayDateSelection';

describe('useEventsDayDateSelection', () => {
    it('moves selected date across days and back to today', () => {
        const selection = useEventsDayDateSelection({
            initialDate: '2026-08-16',
            now: () => new Date('2026-08-20T10:00:00'),
        });

        selection.handlePrevDay();
        expect(selection.selectedDate.value).toBe('2026-08-15');

        selection.handleNextDay();
        expect(selection.selectedDate.value).toBe('2026-08-16');

        selection.handleTodayClick();
        expect(selection.selectedDate.value).toBe('2026-08-20');
        expect(selection.selectedDateLabel.value).toContain('Dzisiaj');
    });

    it('updates selected date from calendar and closes the popover', () => {
        const selection = useEventsDayDateSelection({
            initialDate: '2026-08-16',
            now: () => new Date('2026-08-16T10:00:00'),
        });

        selection.isCalendarOpen.value = true;
        selection.handleCalendarUpdate(parseDate('2026-08-18'));

        expect(selection.selectedDate.value).toBe('2026-08-18');
        expect(selection.calendarSelected.value.toString()).toBe('2026-08-18');
        expect(selection.isCalendarOpen.value).toBe(false);
    });
});
