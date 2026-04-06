export type VehicleStatus = 'ACTIVE' | 'UNAVAILABLE';

/** Wspólne pola zapisu pojazdu (formularz create/edit bez schoolId). */
export interface VehicleWritePayload {
    name: string;
    registrationNumber: string;
    inspectionDate: string | null;
    insuranceDate: string | null;
}

export interface Vehicle {
    id: string;
    name: string;
    registrationNumber: string;
    status: VehicleStatus;
    isDefault: boolean;
    /** ISO YYYY-MM-DD lub null */
    inspectionDate: string | null;
    /** ISO YYYY-MM-DD lub null */
    insuranceDate: string | null;
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

function parseBoolean(raw: unknown): boolean {
    if (typeof raw === 'boolean') return raw;

    if (raw === 'true' || raw === 1) return true;

    return false;
}

function parseOptionalIsoDate(raw: unknown): string | null {
    if (raw === null || raw === undefined) return null;

    const s = typeof raw === 'string' ? raw.trim() : String(raw).trim();

    if (!s) return null;

    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;

    return null;
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

    const status = parseStatus(o.status ?? o.vehicleStatus);
    const isDefault = parseBoolean(o.isDefault ?? o.is_default ?? o.default);

    const inspectionRaw = o.inspectionDate ?? o.inspection_date;
    const insuranceRaw = o.insuranceDate ?? o.insurance_date;

    return {
        id,
        name: name.trim(),
        registrationNumber: registrationNumber.trim(),
        status,
        isDefault,
        inspectionDate: parseOptionalIsoDate(inspectionRaw),
        insuranceDate: parseOptionalIsoDate(insuranceRaw),
    };
}
