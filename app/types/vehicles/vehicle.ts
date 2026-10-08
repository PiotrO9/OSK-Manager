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
    /** Ostatni zapis całego rekordu pojazdu, ISO UTC lub null. */
    updatedAt: string | null;
}

export interface VehicleDetail extends Vehicle {
    photoUrl: string | null;
}

function parseStatus(raw: unknown): VehicleStatus {
    const normalizedStatus =
        typeof raw === 'string'
            ? raw.trim().toUpperCase()
            : String(raw ?? '')
                  .trim()
                  .toUpperCase();

    if (normalizedStatus === 'UNAVAILABLE') return 'UNAVAILABLE';

    return 'ACTIVE';
}

function parseStatusFromRecord(record: Record<string, unknown>): VehicleStatus {
    const explicit =
        record.status ?? record.vehicleStatus ?? record.availabilityStatus;

    if (
        explicit !== undefined &&
        explicit !== null &&
        String(explicit).trim() !== ''
    ) {
        return parseStatus(explicit);
    }

    if ('isActive' in record) {
        const active = record.isActive;

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
        const parsedDate = new Date(raw);

        if (Number.isNaN(parsedDate.getTime())) return null;

        return formatUtcDateYmd(parsedDate);
    }

    const dateText = typeof raw === 'string' ? raw.trim() : String(raw).trim();

    if (!dateText) return null;

    if (/^\d{4}-\d{2}-\d{2}$/.test(dateText)) return dateText;

    const parsedDate = new Date(dateText);

    if (Number.isNaN(parsedDate.getTime())) return null;

    return formatUtcDateYmd(parsedDate);
}

function formatUtcDateYmd(date: Date): string {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

function parseOptionalPhotoUrl(raw: unknown): string | null {
    if (raw === null || raw === undefined) return null;

    const photoUrl = typeof raw === 'string' ? raw.trim() : String(raw).trim();

    return photoUrl.length > 0 ? photoUrl : null;
}

export function parseVehicleUpdatedAt(raw: unknown): string | null {
    if (
        typeof raw !== 'string' ||
        !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(
            raw,
        )
    ) {
        return null;
    }

    const date = new Date(raw);

    return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

const MODEL_YEAR_MIN = 1900;
const MODEL_YEAR_MAX = 2100;
const MILEAGE_KM_MAX = 99_999_999;

function parseOptionalModelYear(raw: unknown): number | null {
    if (raw === null || raw === undefined) return null;

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
        return null;
    }

    return modelYear;
}

function parseOptionalMileageKm(raw: unknown): number | null {
    if (raw === null || raw === undefined) return null;

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
        return null;
    }

    return mileageKm;
}

export function normalizeVehiclesList(data: unknown): Vehicle[] {
    if (Array.isArray(data)) {
        return data
            .map((item, index) => normalizeVehicle(item, index))
            .filter((vehicle): vehicle is Vehicle => vehicle !== null);
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

    const vehicleRecord = item as Record<string, unknown>;
    const idRaw =
        vehicleRecord.id != null ? String(vehicleRecord.id).trim() : '';
    const id = idRaw || `vehicle-row-${index}`;

    const name =
        vehicleRecord.name != null
            ? String(vehicleRecord.name)
            : vehicleRecord.label != null
              ? String(vehicleRecord.label)
              : '';

    const registrationNumber =
        vehicleRecord.registrationNumber != null
            ? String(vehicleRecord.registrationNumber)
            : vehicleRecord.registration_number != null
              ? String(vehicleRecord.registration_number)
              : vehicleRecord.plate != null
                ? String(vehicleRecord.plate)
                : '';

    const status = parseStatusFromRecord(vehicleRecord);
    const isDefault = parseBoolean(
        vehicleRecord.isDefault ??
            vehicleRecord.is_default ??
            vehicleRecord.default,
    );

    const inspectionRaw =
        vehicleRecord.inspectionDate ?? vehicleRecord.inspection_date;
    const insuranceRaw =
        vehicleRecord.insuranceDate ?? vehicleRecord.insurance_date;
    const unavailableUntilRaw =
        vehicleRecord.unavailableUntil ?? vehicleRecord.unavailable_until;
    const modelYearRaw = vehicleRecord.modelYear ?? vehicleRecord.model_year;
    const mileageRaw = vehicleRecord.mileageKm ?? vehicleRecord.mileage_km;
    const updatedAtRaw = vehicleRecord.updatedAt ?? vehicleRecord.updated_at;

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
        updatedAt: parseVehicleUpdatedAt(updatedAtRaw),
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

    const vehicleRecord = item as Record<string, unknown>;

    return {
        ...base,
        photoUrl: parseOptionalPhotoUrl(
            vehicleRecord.photoUrl ?? vehicleRecord.photo_url,
        ),
    };
}
