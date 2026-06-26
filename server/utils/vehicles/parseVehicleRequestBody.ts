export function parseOptionalDateInput(raw: unknown): string | null {
    if (raw === null || raw === undefined) return null;

    const s = typeof raw === 'string' ? raw.trim() : String(raw).trim();

    if (!s) return null;

    if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;

    return s;
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

    const n =
        typeof raw === 'number' && Number.isFinite(raw)
            ? Math.trunc(raw)
            : parseInt(
                  typeof raw === 'string' ? raw.trim() : String(raw).trim(),
                  10,
              );

    if (!Number.isInteger(n) || n < MODEL_YEAR_MIN || n > MODEL_YEAR_MAX) {
        return false;
    }

    return n;
}

function parseBodyMileageKm(raw: unknown): number | null | false {
    if (raw === undefined || raw === null) return null;

    if (typeof raw === 'string' && raw.trim() === '') return null;

    const n =
        typeof raw === 'number' && Number.isFinite(raw)
            ? Math.trunc(raw)
            : parseInt(
                  typeof raw === 'string' ? raw.trim() : String(raw).trim(),
                  10,
              );

    if (!Number.isInteger(n) || n < 0 || n > MILEAGE_KM_MAX) {
        return false;
    }

    return n;
}

export function parseVehicleWriteFields(
    body: unknown,
): ParsedVehicleWriteFields | null {
    if (!body || typeof body !== 'object') return null;

    const o = body as Record<string, unknown>;
    const nameRaw = o.name;
    const regRaw = o.registrationNumber;

    const name =
        typeof nameRaw === 'string'
            ? nameRaw.trim()
            : String(nameRaw ?? '').trim();

    const registrationNumber =
        typeof regRaw === 'string'
            ? regRaw.trim()
            : String(regRaw ?? '').trim();

    const modelYear = parseBodyModelYear(o.modelYear);

    if (modelYear === false) return null;

    const mileageKm = parseBodyMileageKm(o.mileageKm);

    if (mileageKm === false) return null;

    return {
        name,
        registrationNumber,
        inspectionDate: parseOptionalDateInput(o.inspectionDate),
        insuranceDate: parseOptionalDateInput(o.insuranceDate),
        modelYear,
        mileageKm,
    };
}
