import { isCourseKind } from '~~/shared/contracts/courses';
import type { CurrentUserCourseItem } from './courseModels';
import {
    isCourseParticipantStatus,
    normalizeCourseProgress,
    readTotalHours,
} from './courseNormalizeShared';

function normalizeCurrentUserCourseItem(
    raw: unknown,
): CurrentUserCourseItem | null {
    if (!raw || typeof raw !== 'object') {
        return null;
    }

    const o = raw as Record<string, unknown>;
    const id = o.id != null ? String(o.id).trim() : '';
    const schoolId =
        o.schoolId != null
            ? String(o.schoolId).trim()
            : o.school_id != null
              ? String(o.school_id).trim()
              : '';
    const name = o.name != null ? String(o.name).trim() : '';
    const statusRaw = o.status != null ? String(o.status).trim() : '';
    const typeRaw =
        o.type != null
            ? String(o.type).trim()
            : o.kind != null
              ? String(o.kind).trim()
              : '';

    if (
        !id ||
        !schoolId ||
        !name ||
        !isCourseParticipantStatus(statusRaw) ||
        !isCourseKind(typeRaw)
    ) {
        return null;
    }

    const totalHours = readTotalHours(o.totalHours ?? o.total_hours);

    if (totalHours === null) {
        return null;
    }

    return {
        id,
        schoolId,
        name,
        status: statusRaw,
        type: typeRaw,
        totalHours,
        progress: normalizeCourseProgress(o.progress),
    };
}

export function normalizeMyCoursesList(data: unknown): CurrentUserCourseItem[] {
    if (Array.isArray(data)) {
        return data
            .map((item) => normalizeCurrentUserCourseItem(item))
            .filter((x): x is CurrentUserCourseItem => x !== null);
    }

    if (!data || typeof data !== 'object') {
        return [];
    }

    const record = data as Record<string, unknown>;

    for (const key of ['courses', 'items', 'data'] as const) {
        const nested = record[key];

        if (Array.isArray(nested)) {
            return normalizeMyCoursesList(nested);
        }
    }

    return [];
}
