import { describe, expect, it } from 'vitest';
import type { Vehicle } from '~/types/vehicles/vehicle';
import { filterVehicles, formatVehiclesResultsLabel } from './filters';

function vehicle(overrides: Partial<Vehicle>): Vehicle {
    return {
        id: 'vehicle-1',
        name: 'Toyota Yaris',
        registrationNumber: 'KR 12345',
        status: 'ACTIVE',
        unavailableUntil: null,
        isDefault: false,
        inspectionDate: null,
        insuranceDate: null,
        modelYear: null,
        mileageKm: null,
        updatedAt: null,
        ...overrides,
    };
}

const vehicles = [
    vehicle({
        id: 'active',
        name: 'Škoda Fabia',
        registrationNumber: 'KR 12345',
    }),
    vehicle({
        id: 'unavailable',
        name: 'Toyota Yaris',
        registrationNumber: 'WA 98765',
        status: 'UNAVAILABLE',
    }),
];

describe('filterVehicles', () => {
    it('searches names without diacritics and registrations without spaces', () => {
        expect(
            filterVehicles(vehicles, 'skoda', 'all').map((item) => item.id),
        ).toEqual(['active']);
        expect(
            filterVehicles(vehicles, 'KR123', 'all').map((item) => item.id),
        ).toEqual(['active']);
    });

    it('combines text and availability filters', () => {
        expect(
            filterVehicles(vehicles, 'toyota', 'UNAVAILABLE').map(
                (item) => item.id,
            ),
        ).toEqual(['unavailable']);
        expect(
            filterVehicles(vehicles, '', 'ACTIVE').map((item) => item.id),
        ).toEqual(['active']);
    });
});

describe('formatVehiclesResultsLabel', () => {
    it.each([
        [0, '0 wyników'],
        [1, '1 wynik'],
        [2, '2 wyniki'],
        [5, '5 wyników'],
        [12, '12 wyników'],
        [22, '22 wyniki'],
        [24, '24 wyniki'],
        [25, '25 wyników'],
    ])('formats %i using the correct Polish plural form', (count, expected) => {
        expect(formatVehiclesResultsLabel(count)).toBe(expected);
    });
});
