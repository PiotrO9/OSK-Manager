export type VehicleStatus = 'ACTIVE' | 'UNAVAILABLE';

/** Wspólne pola zapisu pojazdu (formularz create/edit bez schoolId). */
export interface VehicleWritePayload {
    name: string;
    registrationNumber: string;
    inspectionDate: string | null;
    insuranceDate: string | null;
    /** Rocznik modelu (np. 2018) lub null, gdy nie podano. */
    modelYear: number | null;
    /** Przebieg w km lub null. */
    mileageKm: number | null;
}

export interface Vehicle {
    id: string;
    name: string;
    registrationNumber: string;
    status: VehicleStatus;
    unavailableUntil: string | null;
    isDefault: boolean;
    /** ISO YYYY-MM-DD lub null */
    inspectionDate: string | null;
    /** ISO YYYY-MM-DD lub null */
    insuranceDate: string | null;
    modelYear: number | null;
    mileageKm: number | null;
}

export interface VehicleDetail extends Vehicle {
    photoUrl: string | null;
}

function parseStatus(raw: unknown): VehicleStatus {
    const s =
        typeof raw === 'string'
            ? raw.trim().toUpperCase()
            : String(raw ?? '')
                  .trim()
                  .toUpperCase();

    if (s === 'UNAVAILABLE') return 'UNAVAILABLE';

    return 'ACTIVE';
}

function parseStatusFromRecord(o: Record<string, unknown>): VehicleStatus {
    const explicit = o.status ?? o.vehicleStatus ?? o.availabilityStatus;

    if (
        explicit !== undefined &&
        explicit !== null &&
        String(explicit).trim() !== ''
    ) {
        return parseStatus(explicit);
    }

    if ('isActive' in o) {
        const active = o.isActive;

        if (active === false || active === 'false' || active === 0) {
            return 'UNAVAILABLE';
        }
    }

    return 'ACTIVE';
}

function parseBoolean(raw: unknown): boolean {
    if (typeof raw === 'boolean') return raw;

    if (raw === 'true' || raw === 1) return true;

    return false;
}

function parseOptionalIsoDate(raw: unknown): string | null {
    if (raw === null || raw === undefined) return null;

    if (typeof raw === 'number' && Number.isFinite(raw)) {
        const d = new Date(raw);

        if (Number.isNaN(d.getTime())) return null;

        return formatUtcDateYmd(d);
    }

    const s = typeof raw === 'string' ? raw.trim() : String(raw).trim();

    if (!s) return null;

    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;

    const d = new Date(s);

    if (Number.isNaN(d.getTime())) return null;

    return formatUtcDateYmd(d);
}

function formatUtcDateYmd(d: Date): string {
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');

    return `${y}-${m}-${day}`;
}

function parseOptionalPhotoUrl(raw: unknown): string | null {
    if (raw === null || raw === undefined) return null;

    const s = typeof raw === 'string' ? raw.trim() : String(raw).trim();

    return s.length > 0 ? s : null;
}

const MODEL_YEAR_MIN = 1900;
const MODEL_YEAR_MAX = 2100;
const MILEAGE_KM_MAX = 99_999_999;

function parseOptionalModelYear(raw: unknown): number | null {
    if (raw === null || raw === undefined) return null;

    if (typeof raw === 'string' && raw.trim() === '') return null;

    const n =
        typeof raw === 'number' && Number.isFinite(raw)
            ? Math.trunc(raw)
            : parseInt(
                  typeof raw === 'string' ? raw.trim() : String(raw).trim(),
                  10,
              );

    if (!Number.isInteger(n) || n < MODEL_YEAR_MIN || n > MODEL_YEAR_MAX) {
        return null;
    }

    return n;
}

function parseOptionalMileageKm(raw: unknown): number | null {
    if (raw === null || raw === undefined) return null;

    if (typeof raw === 'string' && raw.trim() === '') return null;

    const n =
        typeof raw === 'number' && Number.isFinite(raw)
            ? Math.trunc(raw)
            : parseInt(
                  typeof raw === 'string' ? raw.trim() : String(raw).trim(),
                  10,
              );

    if (!Number.isInteger(n) || n < 0 || n > MILEAGE_KM_MAX) {
        return null;
    }

    return n;
}

export function normalizeVehiclesList(data: unknown): Vehicle[] {
    if (Array.isArray(data)) {
        return data
            .map((item, index) => normalizeVehicle(item, index))
            .filter((x): x is Vehicle => x !== null);
    }

    if (!data || typeof data !== 'object') {
        return [];
    }

    const record = data as Record<string, unknown>;

    for (const key of ['items', 'vehicles', 'data'] as const) {
        const nested = record[key];

        if (Array.isArray(nested)) {
            return normalizeVehiclesList(nested);
        }
    }

    return [];
}

export function normalizeVehicle(item: unknown, index: number): Vehicle | null {
    if (!item || typeof item !== 'object') {
        return null;
    }

    const o = item as Record<string, unknown>;
    const idRaw = o.id != null ? String(o.id).trim() : '';
    const id = idRaw || `vehicle-row-${index}`;

    const name =
        o.name != null
            ? String(o.name)
            : o.label != null
              ? String(o.label)
              : '';

    const registrationNumber =
        o.registrationNumber != null
            ? String(o.registrationNumber)
            : o.registration_number != null
              ? String(o.registration_number)
              : o.plate != null
                ? String(o.plate)
                : '';

    const status = parseStatusFromRecord(o);
    const isDefault = parseBoolean(o.isDefault ?? o.is_default ?? o.default);

    const inspectionRaw = o.inspectionDate ?? o.inspection_date;
    const insuranceRaw = o.insuranceDate ?? o.insurance_date;
    const unavailableUntilRaw = o.unavailableUntil ?? o.unavailable_until;
    const modelYearRaw = o.modelYear ?? o.model_year;
    const mileageRaw = o.mileageKm ?? o.mileage_km;

    return {
        id,
        name: name.trim(),
        registrationNumber: registrationNumber.trim(),
        status,
        unavailableUntil: parseOptionalIsoDate(unavailableUntilRaw),
        isDefault,
        inspectionDate: parseOptionalIsoDate(inspectionRaw),
        insuranceDate: parseOptionalIsoDate(insuranceRaw),
        modelYear: parseOptionalModelYear(modelYearRaw),
        mileageKm: parseOptionalMileageKm(mileageRaw),
    };
}

export function normalizeVehicleDetail(
    item: unknown,
    index: number,
): VehicleDetail | null {
    const base = normalizeVehicle(item, index);

    if (!base) return null;

    if (!item || typeof item !== 'object') {
        return { ...base, photoUrl: null };
    }

    const o = item as Record<string, unknown>;

    return {
        ...base,
        photoUrl: parseOptionalPhotoUrl(o.photoUrl ?? o.photo_url),
    };
}
