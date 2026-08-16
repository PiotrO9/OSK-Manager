import { describe, expect, it } from 'vitest';
import {
    getEventStudentPickerCapacitySummary,
    normalizeEventStudentPickerCapacity,
} from './eventStudentPickerCapacity';

describe('eventStudentPickerCapacity', () => {
    it('treats null, undefined and invalid capacity as unlimited', () => {
        expect(normalizeEventStudentPickerCapacity(null)).toBeNull();
        expect(normalizeEventStudentPickerCapacity(undefined)).toBeNull();
        expect(normalizeEventStudentPickerCapacity(Number.NaN)).toBeNull();

        expect(
            getEventStudentPickerCapacitySummary({
                capacity: null,
                selectedCount: 2,
            }),
        ).toMatchObject({
            capacityNumber: null,
            isCapacityReached: false,
            remainingSlots: null,
            badgeVariant: 'secondary',
            badgeLabel: '2 wybrano (bez limitu)',
        });
    });

    it('normalizes finite capacity to a non-negative integer', () => {
        expect(normalizeEventStudentPickerCapacity(4.9)).toBe(4);
        expect(normalizeEventStudentPickerCapacity(-2)).toBe(0);
    });

    it('marks zero capacity as unavailable', () => {
        expect(
            getEventStudentPickerCapacitySummary({
                capacity: 0,
                selectedCount: 0,
            }),
        ).toMatchObject({
            capacityNumber: 0,
            isCapacityReached: true,
            remainingSlots: 0,
            badgeVariant: 'destructive',
            badgeLabel: 'Brak miejsc',
        });
    });

    it('reports remaining slots and destructive badge when capacity is reached', () => {
        expect(
            getEventStudentPickerCapacitySummary({
                capacity: 3,
                selectedCount: 2,
            }),
        ).toMatchObject({
            capacityNumber: 3,
            isCapacityReached: false,
            remainingSlots: 1,
            badgeVariant: 'secondary',
            badgeLabel: '2 / 3 miejsc zajętych',
        });

        expect(
            getEventStudentPickerCapacitySummary({
                capacity: 3,
                selectedCount: 3,
            }),
        ).toMatchObject({
            isCapacityReached: true,
            remainingSlots: 0,
            badgeVariant: 'destructive',
            badgeLabel: '3 / 3 miejsc zajętych',
        });
    });
});
