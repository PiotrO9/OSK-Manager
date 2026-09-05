import { normalizeCourseTypesList } from '~/types/courses/courseType';
import type { InstructorListItem } from './instructorModels';

function normalizeInstructorItem(
    item: unknown,
    index: number,
): InstructorListItem | null {
    if (!item || typeof item !== 'object') {
        return null;
    }

    const o = item as Record<string, unknown>;
    const profileFromApi =
        o.instructorProfileId != null
            ? String(o.instructorProfileId).trim()
            : o.instructor_profile_id != null
              ? String(o.instructor_profile_id).trim()
              : o.profileId != null
                ? String(o.profileId).trim()
                : '';

    const idRaw = o.id != null ? String(o.id).trim() : '';
    const id = profileFromApi || idRaw || `instructor-row-${index}`;

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

    const userIdRaw =
        o.userId != null
            ? String(o.userId).trim()
            : o.user_id != null
              ? String(o.user_id).trim()
              : o.user && typeof o.user === 'object'
                ? String((o.user as Record<string, unknown>).id ?? '').trim()
                : '';

    const userId = userIdRaw.length > 0 ? userIdRaw : undefined;

    return {
        id,
        firstName,
        lastName,
        email,
        qualifiedCourseTypes: normalizeCourseTypesList(o.qualifiedCourseTypes),
        ...(userId !== undefined ? { userId } : {}),
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
