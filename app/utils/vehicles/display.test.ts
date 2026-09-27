import { describe, expect, it } from 'vitest';
import type { Vehicle } from '~/types/vehicles/vehicle';
import {
    displayVehicleText,
    formatVehicleMeta,
    formatVehicleOptionalDate,
    getVehicleDeadlinePresentation,
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
        expect(formatVehicleOptionalDate('2026-09-03')).toBe('03.09.2026');
    });

    it('distinguishes expired, upcoming, valid and missing document dates', () => {
        const now = new Date('2026-09-27T12:00:00Z');

        expect(getVehicleDeadlinePresentation(null, now)).toEqual({
            label: 'Brak terminu',
            state: 'missing',
            tone: 'neutral',
        });
        expect(getVehicleDeadlinePresentation('2026-09-20', now)).toEqual({
            label: '20.09.2026 · po terminie',
            state: 'expired',
            tone: 'danger',
        });
        expect(getVehicleDeadlinePresentation('2026-10-10', now)).toEqual({
            label: '10.10.2026 · wkrótce',
            state: 'soon',
            tone: 'warning',
        });
        expect(getVehicleDeadlinePresentation('2026-12-01', now)).toEqual({
            label: '01.12.2026',
            state: 'valid',
            tone: 'success',
        });
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
