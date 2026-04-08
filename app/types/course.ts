export type CourseKind = 'THEORY_GROUP' | 'PRACTICAL' | 'EXTRA';

export interface CourseInstructorRef {
    id: string;
    name: string;
}

export interface CourseListItem {
    id: string;
    name: string;
    category: string;
    type: CourseKind;
    totalHours: number;
    instructor: CourseInstructorRef | null;
}

const COURSE_KIND_LABELS: Record<CourseKind, string> = {
    THEORY_GROUP: 'Teoria (grupa)',
    PRACTICAL: 'Praktyka',
    EXTRA: 'Kurs dodatkowy',
};

export function formatCourseKindLabel(kind: CourseKind): string {
    return COURSE_KIND_LABELS[kind] ?? kind;
}

function isCourseKind(value: string): value is CourseKind {
    return (
        value === 'THEORY_GROUP' || value === 'PRACTICAL' || value === 'EXTRA'
    );
}

function normalizeInstructorRef(raw: unknown): CourseInstructorRef | null {
    if (raw === null || raw === undefined) {
        return null;
    }

    if (typeof raw !== 'object') {
        return null;
    }

    const o = raw as Record<string, unknown>;
    const id = o.id != null ? String(o.id).trim() : '';
    const name = o.name != null ? String(o.name).trim() : '';

    if (!id || !name) {
        return null;
    }

    return { id, name };
}

function normalizeCourseListItem(raw: unknown): CourseListItem | null {
    if (!raw || typeof raw !== 'object') {
        return null;
    }

    const o = raw as Record<string, unknown>;
    const id = o.id != null ? String(o.id).trim() : '';

    if (!id) {
        return null;
    }

    const name = o.name != null ? String(o.name).trim() : '';

    if (!name) {
        return null;
    }

    const category = o.category != null ? String(o.category).trim() : '';

    if (!category) {
        return null;
    }

    const typeRaw =
        o.type != null
            ? String(o.type).trim()
            : o.kind != null
              ? String(o.kind).trim()
              : '';

    if (!typeRaw || !isCourseKind(typeRaw)) {
        return null;
    }

    const th = o.totalHours;
    let totalHours: number;

    if (typeof th === 'number' && Number.isFinite(th)) {
        totalHours = Math.trunc(th);
    } else if (typeof th === 'string') {
        const parsed = Number.parseInt(th.trim(), 10);

        if (Number.isNaN(parsed)) {
            return null;
        }

        totalHours = parsed;
    } else {
        return null;
    }

    if (totalHours < 0) {
        return null;
    }

    return {
        id,
        name,
        category,
        type: typeRaw,
        totalHours,
        instructor: normalizeInstructorRef(o.instructor),
    };
}

export function normalizeCoursesList(data: unknown): CourseListItem[] {
    if (Array.isArray(data)) {
        return data
            .map((item) => normalizeCourseListItem(item))
            .filter((x): x is CourseListItem => x !== null);
    }

    if (!data || typeof data !== 'object') {
        return [];
    }

    const record = data as Record<string, unknown>;

    for (const key of ['courses', 'items', 'data'] as const) {
        const nested = record[key];

        if (Array.isArray(nested)) {
            return normalizeCoursesList(nested);
        }
    }

    return [];
}
