import type { CourseDetail, CourseListItem } from './courseModels';
import { normalizeCourseListItem } from './courseNormalizeShared';

function normalizeCourseCapacity(o: Record<string, unknown>): number | null {
    if (!('capacity' in o)) {
        return null;
    }

    const c = o.capacity;

    if (c === null || c === undefined) {
        return null;
    }

    if (typeof c === 'number' && Number.isFinite(c)) {
        const n = Math.trunc(c);

        if (n < 0) {
            return null;
        }

        return n;
    }

    if (typeof c === 'string') {
        const parsed = Number.parseInt(c.trim(), 10);

        if (Number.isNaN(parsed) || parsed < 0) {
            return null;
        }

        return parsed;
    }

    return null;
}

function readCourseSchoolId(o: Record<string, unknown>): string | undefined {
    for (const key of ['schoolId', 'school_id'] as const) {
        const raw = o[key];

        if (raw == null) {
            continue;
        }

        const s = String(raw).trim();

        if (s.length > 0) {
            return s;
        }
    }

    const school = o.school;

    if (school && typeof school === 'object' && school !== null) {
        const so = school as Record<string, unknown>;

        for (const key of ['id', 'schoolId', 'school_id'] as const) {
            const raw = so[key];

            if (raw == null) {
                continue;
            }

            const s = String(raw).trim();

            if (s.length > 0) {
                return s;
            }
        }
    }

    return undefined;
}

function normalizeCourseDetailInner(raw: unknown): CourseDetail | null {
    const base = normalizeCourseListItem(raw);

    if (!base || typeof raw !== 'object' || raw === null) {
        return null;
    }

    const o = raw as Record<string, unknown>;
    const schoolId = readCourseSchoolId(o);

    return {
        ...base,
        capacity: normalizeCourseCapacity(o),
        ...(schoolId !== undefined ? { schoolId } : {}),
    };
}

/**
 * Normalizuje payload ze `unwrapApiSuccessData`: `{ course }` (BE) lub płaski obiekt kursu.
 */
export function normalizeCourseDetailData(data: unknown): CourseDetail | null {
    if (!data || typeof data !== 'object') {
        return null;
    }

    const record = data as Record<string, unknown>;

    if ('course' in record) {
        const nested = record.course;

        if (nested === null || nested === undefined) {
            return null;
        }

        return normalizeCourseDetailInner(nested);
    }

    return normalizeCourseDetailInner(data);
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
