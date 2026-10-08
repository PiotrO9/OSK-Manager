export function parseOptionalDateInput(raw: unknown): string | null {
    if (raw === null || raw === undefined) return null;

    const dateText = typeof raw === 'string' ? raw.trim() : String(raw).trim();

    if (!dateText) return null;

    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateText)) return null;

    return dateText;
}

export interface ParsedVehicleWriteFields {
    name: string;
    registrationNumber: string;
    inspectionDate: string | null;
    insuranceDate: string | null;
    modelYear: number | null;
    mileageKm: number | null;
}

const MODEL_YEAR_MIN = 1900;
const MODEL_YEAR_MAX = 2100;
const MILEAGE_KM_MAX = 99_999_999;

function parseBodyModelYear(raw: unknown): number | null | false {
    if (raw === undefined || raw === null) return null;

    if (typeof raw === 'string' && raw.trim() === '') return null;

    const modelYear =
        typeof raw === 'number' && Number.isFinite(raw)
            ? Math.trunc(raw)
            : parseInt(
                  typeof raw === 'string' ? raw.trim() : String(raw).trim(),
                  10,
              );

    if (
        !Number.isInteger(modelYear) ||
        modelYear < MODEL_YEAR_MIN ||
        modelYear > MODEL_YEAR_MAX
    ) {
        return false;
    }

    return modelYear;
}

function parseBodyMileageKm(raw: unknown): number | null | false {
    if (raw === undefined || raw === null) return null;

    if (typeof raw === 'string' && raw.trim() === '') return null;

    const mileageKm =
        typeof raw === 'number' && Number.isFinite(raw)
            ? Math.trunc(raw)
            : parseInt(
                  typeof raw === 'string' ? raw.trim() : String(raw).trim(),
                  10,
              );

    if (
        !Number.isInteger(mileageKm) ||
        mileageKm < 0 ||
        mileageKm > MILEAGE_KM_MAX
    ) {
        return false;
    }

    return mileageKm;
}

export function parseVehicleWriteFields(
    body: unknown,
): ParsedVehicleWriteFields | null {
    if (!body || typeof body !== 'object') return null;

    const vehicleBody = body as Record<string, unknown>;
    const nameRaw = vehicleBody.name;
    const registrationNumberRaw = vehicleBody.registrationNumber;

    const name =
        typeof nameRaw === 'string'
            ? nameRaw.trim()
            : String(nameRaw ?? '').trim();

    const registrationNumber =
        typeof registrationNumberRaw === 'string'
            ? registrationNumberRaw.trim()
            : String(registrationNumberRaw ?? '').trim();

    const modelYear = parseBodyModelYear(vehicleBody.modelYear);

    if (modelYear === false) return null;

    const mileageKm = parseBodyMileageKm(vehicleBody.mileageKm);

    if (mileageKm === false) return null;

    return {
        name,
        registrationNumber,
        inspectionDate: parseOptionalDateInput(vehicleBody.inspectionDate),
        insuranceDate: parseOptionalDateInput(vehicleBody.insuranceDate),
        modelYear,
        mileageKm,
    };
}
