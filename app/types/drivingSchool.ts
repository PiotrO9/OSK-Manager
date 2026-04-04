export interface DrivingSchool {
    id: string;
    name: string;
    city?: string | null;
    address?: string | null;
    /** Czy szkoła jest domyślną (jeśli backend zwraca to pole). */
    isDefault?: boolean;
}

export function normalizeDrivingSchoolsList(data: unknown): DrivingSchool[] {
    if (Array.isArray(data)) {
        return data
            .map((item) => normalizeDrivingSchool(item))
            .filter((x): x is DrivingSchool => x !== null);
    }

    if (!data || typeof data !== 'object') {
        return [];
    }

    const record = data as Record<string, unknown>;

    for (const key of ['items', 'drivingSchools', 'schools', 'data'] as const) {
        const nested = record[key];

        if (Array.isArray(nested)) {
            return normalizeDrivingSchoolsList(nested);
        }
    }

    return [];
}

export function normalizeDrivingSchool(item: unknown): DrivingSchool | null {
    if (!item || typeof item !== 'object') {
        return null;
    }

    const o = item as Record<string, unknown>;
    const id = o.id != null ? String(o.id) : '';
    const name = o.name != null ? String(o.name) : '';

    if (!id || !name) {
        return null;
    }

    let isDefault: boolean | undefined;

    if (typeof o.isDefault === 'boolean') {
        isDefault = o.isDefault;
    } else if (typeof o.is_default === 'boolean') {
        isDefault = o.is_default;
    } else if (typeof o.default === 'boolean') {
        isDefault = o.default;
    }

    return {
        id,
        name,
        city: o.city != null ? String(o.city) : null,
        address: o.address != null ? String(o.address) : null,
        ...(isDefault !== undefined ? { isDefault } : {}),
    };
}
