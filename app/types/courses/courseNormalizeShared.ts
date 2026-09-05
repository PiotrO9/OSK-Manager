import { isCourseKind, type CourseKind } from '~~/shared/contracts/courses';
import { normalizeCourseTypeOption } from '~/types/courses/courseType';
import type {
    CourseInstructorRef,
    CourseListItem,
    CourseParticipantStatus,
} from './courseModels';

export function isCourseParticipantStatus(
    value: string,
): value is CourseParticipantStatus {
    return value === 'ACTIVE' || value === 'FINISHED';
}

export function normalizeCourseProgress(raw: unknown): number {
    let progress = 0;

    if (typeof raw === 'number' && Number.isFinite(raw)) {
        progress = raw;
    } else if (typeof raw === 'string') {
        const parsed = Number.parseFloat(raw.trim());

        if (Number.isFinite(parsed)) {
            progress = parsed;
        }
    }

    return Math.max(0, Math.min(100, Math.round(progress)));
}

export function normalizeInstructorRef(
    raw: unknown,
): CourseInstructorRef | null {
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

export function normalizeCourseListItem(raw: unknown): CourseListItem | null {
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

    const totalHours = readTotalHours(o.totalHours);

    if (totalHours === null) {
        return null;
    }

    return {
        id,
        name,
        category,
        courseType: normalizeCourseTypeOption(o.courseType),
        type: typeRaw satisfies CourseKind,
        totalHours,
        instructor: normalizeInstructorRef(o.instructor),
    };
}

export function readTotalHours(raw: unknown): number | null {
    let totalHours: number;

    if (typeof raw === 'number' && Number.isFinite(raw)) {
        totalHours = Math.trunc(raw);
    } else if (typeof raw === 'string') {
        const parsed = Number.parseInt(raw.trim(), 10);

        if (Number.isNaN(parsed)) {
            return null;
        }

        totalHours = parsed;
    } else {
        return null;
    }

    return totalHours >= 0 ? totalHours : null;
}
