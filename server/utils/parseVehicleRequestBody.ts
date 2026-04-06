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

    return {
        name,
        registrationNumber,
        inspectionDate: parseOptionalDateInput(o.inspectionDate),
        insuranceDate: parseOptionalDateInput(o.insuranceDate),
    };
}

export function isUuid(value: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        value.trim(),
    );
}

export function parseSchoolIdFromBody(body: unknown): string | null {
    if (!body || typeof body !== 'object') return null;

    const o = body as Record<string, unknown>;
    const raw = o.schoolId;

    const s =
        typeof raw === 'string'
            ? raw.trim()
            : raw == null
              ? ''
              : String(raw).trim();

    if (!s) return null;

    if (!isUuid(s)) return null;

    return s;
}
