import { describe, expect, it } from 'vitest';
import {
    buildManagerEventBaselineSnapshot,
    buildManagerEventCurrentSnapshot,
    isManagerEventEditFormDirty,
    needsManagerEventSlotValidation,
    parseManagerEventCapacity,
} from './managerEventEditForm';

describe('manager event edit form helpers', () => {
    it('parses capacity input for edit form payloads and comparisons', () => {
        expect(parseManagerEventCapacity(null)).toBeNull();
        expect(parseManagerEventCapacity('')).toBeNull();
        expect(parseManagerEventCapacity(' 3 ')).toBe(3);
        expect(parseManagerEventCapacity(2.9)).toBe(2);
        expect(parseManagerEventCapacity(-1)).toBe(false);
        expect(parseManagerEventCapacity('abc')).toBe(false);
    });

    it('builds matching baseline and current snapshots for an unchanged event', () => {
        const baseline = buildManagerEventBaselineSnapshot({
            id: 'event-1',
            instructorId: ' instructor-1 ',
            type: 'DRIVE',
            startTime: '2026-08-16T08:00:00.000Z',
            endTime: '2026-08-16T09:00:00.000Z',
            vehicleId: ' vehicle-1 ',
            capacity: 2,
            createdAt: '2026-08-15T10:00:00.000Z',
        });
        const current = buildManagerEventCurrentSnapshot({
            type: baseline.type,
            startLocal: baseline.start,
            endLocal: baseline.end,
            vehicleId: ' vehicle-1 ',
            capacityInput: '2',
            instructorId: ' instructor-1 ',
        });

        expect(current).toEqual(baseline);
        expect(isManagerEventEditFormDirty(baseline, current)).toBe(false);
        expect(needsManagerEventSlotValidation(baseline, current)).toBe(false);
    });

    it('marks instructor changes as dirty and slot-validation relevant', () => {
        const baseline = {
            type: 'THEORY' as const,
            start: '2026-08-16T10:00',
            end: '2026-08-16T11:00',
            vehicle: '',
            capacity: '',
            instructorId: 'instructor-1',
        };
        const current = {
            ...baseline,
            instructorId: 'instructor-2',
        };

        expect(isManagerEventEditFormDirty(baseline, current)).toBe(true);
        expect(needsManagerEventSlotValidation(baseline, current)).toBe(true);
    });
});
