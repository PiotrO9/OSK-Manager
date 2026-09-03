import { describe, expect, it } from 'vitest';
import type { Vehicle } from '~/types/vehicles/vehicle';
import {
    displayVehicleText,
    formatVehicleMeta,
    formatVehicleOptionalDate,
    vehicleStatusLabel,
    vehicleStatusTone,
} from './display';

function vehicle(overrides: Partial<Vehicle> = {}): Vehicle {
    return {
        id: 'vehicle-1',
        name: 'Toyota Yaris',
        registrationNumber: 'KR12345',
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

describe('vehicle display helpers', () => {
    it('normalizes empty text and optional dates', () => {
        expect(displayVehicleText(' Toyota Yaris ')).toBe('Toyota Yaris');
        expect(displayVehicleText('   ')).toBe('-');
        expect(formatVehicleOptionalDate(null)).toBe('Brak terminu');
        expect(formatVehicleOptionalDate('2026-09-03')).toBe('2026-09-03');
    });

    it('formats vehicle metadata from year and mileage', () => {
        expect(
            formatVehicleMeta(
                vehicle({
                    modelYear: 2020,
                    mileageKm: 123456,
                }),
            ),
        ).toBe('2020 - 123 456 km');
        expect(formatVehicleMeta(vehicle())).toBe('Brak metadanych');
    });

    it('maps vehicle status to display label and tone', () => {
        expect(vehicleStatusLabel(vehicle({ status: 'ACTIVE' }))).toBe(
            'Aktywny',
        );
        expect(vehicleStatusTone(vehicle({ status: 'ACTIVE' }))).toBe(
            'success',
        );
        expect(vehicleStatusLabel(vehicle({ status: 'UNAVAILABLE' }))).toBe(
            'Nieaktywny',
        );
        expect(vehicleStatusTone(vehicle({ status: 'UNAVAILABLE' }))).toBe(
            'warning',
        );
    });
});
