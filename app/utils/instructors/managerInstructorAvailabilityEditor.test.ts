import { describe, expect, it } from 'vitest';
import {
    getInstructorAvailabilityDraftTimelineBar,
    getInstructorAvailabilityLabel,
    getInstructorAvailabilityStatusClass,
    getInstructorAvailabilityStatusLabel,
    validateInstructorAvailabilityRow,
} from './managerInstructorAvailabilityEditor';
import type { WeeklyDayFormRow } from '~/types/instructors/instructorAvailability';

const row = (overrides: Partial<WeeklyDayFormRow> = {}): WeeklyDayFormRow => ({
    dayOfWeek: 1,
    label: 'Poniedziałek',
    enabled: true,
    startTime: '08:00',
    endTime: '16:00',
    entryId: 'entry-1',
    ...overrides,
});

describe('manager instructor availability editor model', () => {
    it('formats availability labels for enabled and disabled rows', () => {
        expect(getInstructorAvailabilityLabel(row())).toBe('08:00-16:00');
        expect(getInstructorAvailabilityLabel(row({ enabled: false }))).toBe(
            'Brak dostępności',
        );
    });

    it('returns status labels and classes from row state', () => {
        expect(getInstructorAvailabilityStatusLabel(row())).toBe('aktywny');
        expect(
            getInstructorAvailabilityStatusLabel(row({ endTime: '14:00' })),
        ).toBe('krócej');
        expect(
            getInstructorAvailabilityStatusLabel(row({ enabled: false })),
        ).toBe('wyłączony');

        expect(getInstructorAvailabilityStatusClass(row())).toContain(
            'emerald',
        );
        expect(
            getInstructorAvailabilityStatusClass(row({ endTime: '14:00' })),
        ).toContain('amber');
        expect(
            getInstructorAvailabilityStatusClass(row({ enabled: false })),
        ).toContain('slate');
    });

    it('validates required and ordered times only for enabled rows', () => {
        expect(
            validateInstructorAvailabilityRow(row({ enabled: false })),
        ).toBeNull();
        expect(validateInstructorAvailabilityRow(row({ startTime: '' }))).toBe(
            'Podaj godzinę rozpoczęcia.',
        );
        expect(validateInstructorAvailabilityRow(row({ endTime: '' }))).toBe(
            'Podaj godzinę zakończenia.',
        );
        expect(
            validateInstructorAvailabilityRow({
                ...row(),
                startTime: '16:00',
                endTime: '08:00',
            }),
        ).toBe('Godzina rozpoczęcia musi być wcześniejsza niż zakończenia.');
    });

    it('returns draft timeline bar only for enabled valid windows', () => {
        expect(getInstructorAvailabilityDraftTimelineBar(row())).toEqual({
            leftPct: 12.5,
            widthPct: 50,
        });
        expect(
            getInstructorAvailabilityDraftTimelineBar(row({ enabled: false })),
        ).toBeNull();
    });
});
