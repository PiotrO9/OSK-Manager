import type { CourseDetail, CourseListItem } from './courseModels';
import { normalizeCourseListItem } from './courseNormalizeShared';

function normalizeCourseCapacity(
    courseRecord: Record<string, unknown>,
): number | null {
    if (!('capacity' in courseRecord)) {
        return null;
    }

    const capacityValue = courseRecord.capacity;

    if (capacityValue === null || capacityValue === undefined) {
        return null;
    }

    if (typeof capacityValue === 'number' && Number.isFinite(capacityValue)) {
        const parsedCapacity = Math.trunc(capacityValue);

        if (parsedCapacity < 0) {
            return null;
        }

        return parsedCapacity;
    }

    if (typeof capacityValue === 'string') {
        const parsed = Number.parseInt(capacityValue.trim(), 10);

        if (Number.isNaN(parsed) || parsed < 0) {
            return null;
        }

        return parsed;
    }

    return null;
}

function readCourseSchoolId(
    courseRecord: Record<string, unknown>,
): string | undefined {
    for (const key of ['schoolId', 'school_id'] as const) {
        const raw = courseRecord[key];

        if (raw == null) {
            continue;
        }

        const schoolId = String(raw).trim();

        if (schoolId.length > 0) {
            return schoolId;
        }
    }

    const school = courseRecord.school;

    if (school && typeof school === 'object' && school !== null) {
        const schoolRecord = school as Record<string, unknown>;

        for (const key of ['id', 'schoolId', 'school_id'] as const) {
            const raw = schoolRecord[key];

            if (raw == null) {
                continue;
            }

            const schoolId = String(raw).trim();

            if (schoolId.length > 0) {
                return schoolId;
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

    const courseRecord = raw as Record<string, unknown>;
    const schoolId = readCourseSchoolId(courseRecord);

    return {
        ...base,
        capacity: normalizeCourseCapacity(courseRecord),
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
            .filter((course): course is CourseListItem => course !== null);
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
