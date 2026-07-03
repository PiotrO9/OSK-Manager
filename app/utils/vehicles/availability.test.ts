import { describe, expect, it } from 'vitest';
import type { Vehicle } from '~/types/vehicles/vehicle';
import {
    addUtcDaysYmd,
    formatYmdDatePl,
    isUnavailableUntilSelectable,
    vehicleAvailabilityLabel,
} from './availability';

function vehicle(overrides: Partial<Vehicle>): Vehicle {
    return {
        id: 'vehicle-1',
        name: 'Toyota',
        registrationNumber: 'KR 12345',
        status: 'ACTIVE',
        unavailableUntil: null,
        isDefault: false,
        inspectionDate: null,
        insuranceDate: null,
        modelYear: null,
        mileageKm: null,
        ...overrides,
    };
}

describe('vehicle availability helpers', () => {
    const now = new Date('2026-07-03T12:00:00.000Z');

    it('formats unavailableUntil as DD.MM.YYYY', () => {
        expect(formatYmdDatePl('2026-07-10')).toBe('10.07.2026');
    });

    it('builds a temporary unavailable label when a date exists', () => {
        expect(
            vehicleAvailabilityLabel(
                vehicle({
                    status: 'UNAVAILABLE',
                    unavailableUntil: '2026-07-10',
                }),
            ),
        ).toBe('Nieaktywny do 10.07.2026');
    });

    it('builds an indefinite unavailable label without a date', () => {
        expect(
            vehicleAvailabilityLabel(
                vehicle({ status: 'UNAVAILABLE', unavailableUntil: null }),
            ),
        ).toBe('Nieaktywny');
    });

    it('generates preset end dates from the current UTC day', () => {
        expect(addUtcDaysYmd(7, now)).toBe('2026-07-10');
        expect(addUtcDaysYmd(14, now)).toBe('2026-07-17');
    });

    it('validates selectable temporary dates', () => {
        expect(isUnavailableUntilSelectable('', now)).toBe(false);
        expect(isUnavailableUntilSelectable('2026-07-02', now)).toBe(false);
        expect(isUnavailableUntilSelectable('2026-07-03', now)).toBe(true);
        expect(isUnavailableUntilSelectable('2026-07-04', now)).toBe(true);
    });
});
