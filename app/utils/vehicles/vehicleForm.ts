import type { Vehicle, VehicleWritePayload } from '~/types/vehicles/vehicle';

export const VEHICLE_MODEL_YEAR_MIN = 1900;
export const VEHICLE_MODEL_YEAR_MAX = 2100;
export const VEHICLE_MILEAGE_KM_MAX = 99_999_999;
export const VEHICLE_PHOTO_MAX_BYTES = 5 * 1024 * 1024;
export const VEHICLE_PHOTO_ACCEPTED_TYPES = [
    'image/jpeg',
    'image/png',
    'image/webp',
] as const;

export interface VehicleFormDraft {
    name: string;
    registrationNumber: string;
    inspectionDate: string;
    insuranceDate: string;
    modelYear: string;
    mileageKm: string;
}

export interface VehicleOptionalNumberParseResult {
    isValid: boolean;
    value: number | null;
}

export interface VehiclePhotoFileLike {
    size: number;
    type: string;
}

export function getEmptyVehicleFormDraft(): VehicleFormDraft {
    return {
        name: '',
        registrationNumber: '',
        inspectionDate: '',
        insuranceDate: '',
        modelYear: '',
        mileageKm: '',
    };
}

export function vehicleToFormDraft(
    mode: 'create' | 'edit',
    vehicle: Vehicle | null,
): VehicleFormDraft {
    if (mode !== 'edit' || !vehicle) {
        return getEmptyVehicleFormDraft();
    }

    return {
        name: vehicle.name,
        registrationNumber: vehicle.registrationNumber,
        inspectionDate: vehicle.inspectionDate ?? '',
        insuranceDate: vehicle.insuranceDate ?? '',
        modelYear: vehicle.modelYear != null ? String(vehicle.modelYear) : '',
        mileageKm: vehicle.mileageKm != null ? String(vehicle.mileageKm) : '',
    };
}

export function dateInputToPayload(value: string): string | null {
    const t = value.trim();

    return t.length > 0 ? t : null;
}

export function numericFieldInputToTrimmedString(
    raw: string | number | null | undefined,
): string {
    if (raw === null || raw === undefined) return '';

    if (typeof raw === 'number') {
        if (!Number.isFinite(raw)) return '';

        return String(raw);
    }

    return String(raw).trim();
}

export function parseOptionalVehicleModelYear(
    raw: string | number | null | undefined,
): VehicleOptionalNumberParseResult {
    const yearStr = numericFieldInputToTrimmedString(raw);

    if (yearStr.length === 0) {
        return { isValid: true, value: null };
    }

    if (!/^\d+$/.test(yearStr)) {
        return { isValid: false, value: null };
    }

    const y = Number(yearStr);

    if (
        !Number.isInteger(y) ||
        y < VEHICLE_MODEL_YEAR_MIN ||
        y > VEHICLE_MODEL_YEAR_MAX
    ) {
        return { isValid: false, value: null };
    }

    return { isValid: true, value: y };
}

export function parseOptionalVehicleMileageKm(
    raw: string | number | null | undefined,
): VehicleOptionalNumberParseResult {
    const mileageStr = numericFieldInputToTrimmedString(raw);

    if (mileageStr.length === 0) {
        return { isValid: true, value: null };
    }

    if (!/^\d+$/.test(mileageStr)) {
        return { isValid: false, value: null };
    }

    const m = Number(mileageStr);

    if (!Number.isInteger(m) || m < 0 || m > VEHICLE_MILEAGE_KM_MAX) {
        return { isValid: false, value: null };
    }

    return { isValid: true, value: m };
}

export function normalizeVehicleRegistrationNumber(value: string): string {
    return value.trim().replace(/\s+/g, ' ').toLocaleUpperCase('pl-PL');
}

export function validateVehiclePhotoFile(
    file: VehiclePhotoFileLike,
): string | null {
    if (
        !VEHICLE_PHOTO_ACCEPTED_TYPES.includes(
            file.type as (typeof VEHICLE_PHOTO_ACCEPTED_TYPES)[number],
        )
    ) {
        return 'Wybierz plik JPEG, PNG lub WebP.';
    }

    if (file.size > VEHICLE_PHOTO_MAX_BYTES) {
        return 'Plik jest za duży. Maksymalny rozmiar to 5 MB.';
    }

    return null;
}

export function buildVehicleWritePayload(
    draft: VehicleFormDraft,
    modelYear: number | null,
    mileageKm: number | null,
): VehicleWritePayload {
    return {
        name: draft.name.trim(),
        registrationNumber: normalizeVehicleRegistrationNumber(
            draft.registrationNumber,
        ),
        inspectionDate: dateInputToPayload(draft.inspectionDate),
        insuranceDate: dateInputToPayload(draft.insuranceDate),
        modelYear,
        mileageKm,
    };
}
