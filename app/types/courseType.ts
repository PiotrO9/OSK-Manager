export interface CourseTypeOption {
    id: string;
    code: string;
    name: string;
}

export function normalizeCourseTypeOption(
    item: unknown,
): CourseTypeOption | null {
    if (!item || typeof item !== 'object') {
        return null;
    }

    const o = item as Record<string, unknown>;
    const id = o.id != null ? String(o.id).trim() : '';
    const code = o.code != null ? String(o.code).trim() : '';
    const name = o.name != null ? String(o.name).trim() : '';

    if (!id || !code) {
        return null;
    }

    return {
        id,
        code,
        name: name.length > 0 ? name : code,
    };
}

export function sortCourseTypeOptions(
    items: CourseTypeOption[],
): CourseTypeOption[] {
    return [...items].sort((a, b) => {
        const byCode = a.code.localeCompare(b.code, 'pl');

        if (byCode !== 0) {
            return byCode;
        }

        return a.id.localeCompare(b.id);
    });
}

export function normalizeCourseTypesList(data: unknown): CourseTypeOption[] {
    if (Array.isArray(data)) {
        return sortCourseTypeOptions(
            data
                .map((item) => normalizeCourseTypeOption(item))
                .filter((x): x is CourseTypeOption => x !== null),
        );
    }

    if (!data || typeof data !== 'object') {
        return [];
    }

    const record = data as Record<string, unknown>;

    for (const key of ['courseTypes', 'items', 'data'] as const) {
        const nested = record[key];

        if (Array.isArray(nested)) {
            return normalizeCourseTypesList(nested);
        }
    }

    return [];
}

export function formatCourseTypeOptionLabel(item: CourseTypeOption): string {
    const code = item.code.trim();
    const name = item.name.trim();

    if (!name || name === code) {
        return code;
    }

    return `${code} — ${name}`;
}
