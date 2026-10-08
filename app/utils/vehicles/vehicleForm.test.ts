import { describe, expect, it } from 'vitest';
import type { Vehicle } from '~/types/vehicles/vehicle';
import {
    buildVehicleWritePayload,
    getEmptyVehicleFormDraft,
    isVehicleRegistrationConflict,
    numericFieldInputToTrimmedString,
    parseOptionalVehicleMileageKm,
    parseOptionalVehicleModelYear,
    normalizeVehicleRegistrationNumber,
    validateVehiclePhotoFile,
    vehicleToFormDraft,
    VEHICLE_MILEAGE_KM_MAX,
    VEHICLE_MODEL_YEAR_MAX,
    VEHICLE_MODEL_YEAR_MIN,
} from './vehicleForm';

function vehicle(overrides: Partial<Vehicle> = {}): Vehicle {
    return {
        id: 'vehicle-1',
        name: 'Toyota Yaris',
        registrationNumber: 'KR12345',
        status: 'ACTIVE',
        unavailableUntil: null,
        isDefault: false,
        inspectionDate: '2026-09-01',
        insuranceDate: '2026-09-02',
        modelYear: 2020,
        mileageKm: 123456,
        updatedAt: null,
        ...overrides,
    };
}

describe('vehicle form utilities', () => {
    it('returns empty draft defaults', () => {
        expect(getEmptyVehicleFormDraft()).toEqual({
            name: '',
            registrationNumber: '',
            inspectionDate: '',
            insuranceDate: '',
            modelYear: '',
            mileageKm: '',
        });
    });

    it('maps edit vehicles to form draft strings', () => {
        expect(vehicleToFormDraft('edit', vehicle())).toEqual({
            name: 'Toyota Yaris',
            registrationNumber: 'KR12345',
            inspectionDate: '2026-09-01',
            insuranceDate: '2026-09-02',
            modelYear: '2020',
            mileageKm: '123456',
        });
        expect(vehicleToFormDraft('create', vehicle())).toEqual(
            getEmptyVehicleFormDraft(),
        );
    });

    it('normalizes numeric field input values before parsing', () => {
        expect(numericFieldInputToTrimmedString(' 2020 ')).toBe('2020');
        expect(numericFieldInputToTrimmedString(2020.9)).toBe('2020.9');
        expect(numericFieldInputToTrimmedString(Number.NaN)).toBe('');
        expect(numericFieldInputToTrimmedString(null)).toBe('');
    });

    it('parses optional model year range', () => {
        expect(parseOptionalVehicleModelYear('')).toEqual({
            isValid: true,
            value: null,
        });
        expect(parseOptionalVehicleModelYear(VEHICLE_MODEL_YEAR_MIN)).toEqual({
            isValid: true,
            value: VEHICLE_MODEL_YEAR_MIN,
        });
        expect(parseOptionalVehicleModelYear(VEHICLE_MODEL_YEAR_MAX)).toEqual({
            isValid: true,
            value: VEHICLE_MODEL_YEAR_MAX,
        });
        expect(
            parseOptionalVehicleModelYear(VEHICLE_MODEL_YEAR_MIN - 1),
        ).toMatchObject({ isValid: false });
        expect(
            parseOptionalVehicleModelYear(VEHICLE_MODEL_YEAR_MAX + 1),
        ).toMatchObject({ isValid: false });
        expect(parseOptionalVehicleModelYear('2020.5')).toMatchObject({
            isValid: false,
        });
    });

    it('parses optional mileage range', () => {
        expect(parseOptionalVehicleMileageKm('')).toEqual({
            isValid: true,
            value: null,
        });
        expect(parseOptionalVehicleMileageKm('0')).toEqual({
            isValid: true,
            value: 0,
        });
        expect(parseOptionalVehicleMileageKm(VEHICLE_MILEAGE_KM_MAX)).toEqual({
            isValid: true,
            value: VEHICLE_MILEAGE_KM_MAX,
        });
        expect(parseOptionalVehicleMileageKm(-1)).toMatchObject({
            isValid: false,
        });
        expect(
            parseOptionalVehicleMileageKm(VEHICLE_MILEAGE_KM_MAX + 1),
        ).toMatchObject({ isValid: false });
        expect(parseOptionalVehicleMileageKm('123.5')).toMatchObject({
            isValid: false,
        });
    });

    it('normalizes a registration number without changing its grouping', () => {
        expect(normalizeVehicleRegistrationNumber('  dw  00001 ')).toBe(
            'DW 00001',
        );
    });

    it('recognizes registration number conflicts returned by the API', () => {
        expect(
            isVehicleRegistrationConflict(
                'Vehicle registrationNumber already exists (conflict)',
            ),
        ).toBe(true);
        expect(
            isVehicleRegistrationConflict(
                'Pojazd z tym numerem rejestracyjnym już istnieje.',
            ),
        ).toBe(true);
        expect(isVehicleRegistrationConflict('Backend unavailable')).toBe(
            false,
        );
    });

    it('validates vehicle photo type and size before upload', () => {
        expect(
            validateVehiclePhotoFile({
                type: 'text/plain',
                size: 100,
            }),
        ).toBe('Wybierz plik JPEG, PNG lub WebP.');
        expect(
            validateVehiclePhotoFile({
                type: 'image/jpeg',
                size: 5 * 1024 * 1024 + 1,
            }),
        ).toBe('Plik jest za duży. Maksymalny rozmiar to 5 MB.');
        expect(
            validateVehiclePhotoFile({
                type: 'image/webp',
                size: 5 * 1024 * 1024,
            }),
        ).toBeNull();
    });

    it('builds trimmed write payload with optional dates and numbers', () => {
        expect(
            buildVehicleWritePayload(
                {
                    name: ' Toyota Yaris ',
                    registrationNumber: ' KR12345 ',
                    inspectionDate: ' 2026-09-01 ',
                    insuranceDate: ' ',
                    modelYear: '2020',
                    mileageKm: '123456',
                },
                2020,
                123456,
            ),
        ).toEqual({
            name: 'Toyota Yaris',
            registrationNumber: 'KR12345',
            inspectionDate: '2026-09-01',
            insuranceDate: null,
            modelYear: 2020,
            mileageKm: 123456,
        });
    });
});
