export interface InstructorListItem {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
}

export function formatInstructorDisplayName(item: InstructorListItem): string {
    const parts = [item.firstName, item.lastName]
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

    if (parts.length === 0) {
        return '—';
    }

    return parts.join(' ');
}

function normalizeInstructorItem(
    item: unknown,
    index: number,
): InstructorListItem | null {
    if (!item || typeof item !== 'object') {
        return null;
    }

    const o = item as Record<string, unknown>;
    const idRaw = o.id != null ? String(o.id).trim() : '';
    const id = idRaw || `instructor-row-${index}`;

    const firstName =
        o.firstName != null
            ? String(o.firstName).trim()
            : o.first_name != null
              ? String(o.first_name).trim()
              : '';

    const lastName =
        o.lastName != null
            ? String(o.lastName).trim()
            : o.last_name != null
              ? String(o.last_name).trim()
              : '';

    const email = o.email != null ? String(o.email).trim() : '';

    return {
        id,
        firstName,
        lastName,
        email,
    };
}

export function normalizeInstructorsList(data: unknown): InstructorListItem[] {
    if (Array.isArray(data)) {
        return data
            .map((item, index) => normalizeInstructorItem(item, index))
            .filter((x): x is InstructorListItem => x !== null);
    }

    if (!data || typeof data !== 'object') {
        return [];
    }

    const record = data as Record<string, unknown>;

    for (const key of ['instructors', 'items', 'data'] as const) {
        const nested = record[key];

        if (Array.isArray(nested)) {
            return normalizeInstructorsList(nested);
        }
    }

    return [];
}
