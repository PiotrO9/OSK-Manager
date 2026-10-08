import { isCourseKind, type CourseKind } from '~~/shared/contracts/courses';
import { normalizeCourseTypeOption } from '~/types/courses/courseType';
import { readAvatarUrlFromRecord } from '~/types/profileAvatar';
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

    const courseRecord = raw as Record<string, unknown>;
    const id = courseRecord.id != null ? String(courseRecord.id).trim() : '';
    const name =
        courseRecord.name != null ? String(courseRecord.name).trim() : '';

    if (!id || !name) {
        return null;
    }

    return { id, name, avatarUrl: readAvatarUrlFromRecord(courseRecord) };
}

export function normalizeCourseListItem(raw: unknown): CourseListItem | null {
    if (!raw || typeof raw !== 'object') {
        return null;
    }

    const courseRecord = raw as Record<string, unknown>;
    const id = courseRecord.id != null ? String(courseRecord.id).trim() : '';

    if (!id) {
        return null;
    }

    const name =
        courseRecord.name != null ? String(courseRecord.name).trim() : '';

    if (!name) {
        return null;
    }

    const category =
        courseRecord.category != null
            ? String(courseRecord.category).trim()
            : '';

    if (!category) {
        return null;
    }

    const typeRaw =
        courseRecord.type != null
            ? String(courseRecord.type).trim()
            : courseRecord.kind != null
              ? String(courseRecord.kind).trim()
              : '';

    if (!typeRaw || !isCourseKind(typeRaw)) {
        return null;
    }

    const totalHours = readTotalHours(courseRecord.totalHours);

    if (totalHours === null) {
        return null;
    }

    return {
        id,
        name,
        category,
        courseType: normalizeCourseTypeOption(courseRecord.courseType),
        type: typeRaw satisfies CourseKind,
        totalHours,
        instructor: normalizeInstructorRef(courseRecord.instructor),
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
