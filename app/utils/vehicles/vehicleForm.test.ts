import { describe, expect, it } from 'vitest';
import type { Vehicle } from '~/types/vehicles/vehicle';
import {
    buildVehicleWritePayload,
    getEmptyVehicleFormDraft,
    numericFieldInputToTrimmedString,
    parseOptionalVehicleMileageKm,
    parseOptionalVehicleModelYear,
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
        expect(numericFieldInputToTrimmedString(2020.9)).toBe('2020');
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
