import type { StudentCourseItem, StudentDetail } from './studentModels';
import { readStringOrNull } from './studentNormalizeShared';

function normalizeStudentCourseItem(raw: unknown): StudentCourseItem | null {
    if (!raw || typeof raw !== 'object') {
        return null;
    }

    const o = raw as Record<string, unknown>;
    const id = o.id != null ? String(o.id).trim() : '';

    if (!id) {
        return null;
    }

    const name =
        o.name != null
            ? String(o.name).trim()
            : o.title != null
              ? String(o.title).trim()
              : '';

    if (!name) {
        return null;
    }

    const category =
        o.category != null
            ? String(o.category).trim()
            : o.category_code != null
              ? String(o.category_code).trim()
              : '';

    const statusRaw = o.status;
    const status =
        statusRaw != null && String(statusRaw).trim().length > 0
            ? String(statusRaw).trim().toUpperCase()
            : 'UNKNOWN';

    return {
        id,
        name,
        category,
        status,
    };
}

/**
 * Normalizuje `data` z koperty po `unwrapApiSuccessData` — szczegóły kursanta
 * wg students-api.md (GET /students/:userId).
 */
export function normalizeStudentDetail(raw: unknown): StudentDetail | null {
    if (!raw || typeof raw !== 'object') {
        return null;
    }

    const o = raw as Record<string, unknown>;
    const id = o.id != null ? String(o.id).trim() : '';

    if (!id) {
        return null;
    }

    const userIdRaw = o.userId ?? o.user_id;
    const userId =
        userIdRaw != null && String(userIdRaw).trim().length > 0
            ? String(userIdRaw).trim()
            : id;

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

    const email = o.email != null ? String(o.email).trim().toLowerCase() : '';

    if (!firstName || !lastName || !email) {
        return null;
    }

    const pkkNumber = readStringOrNull(o.pkkNumber ?? o.pkk_number);
    const notes = readStringOrNull(o.notes);

    const coursesRaw = o.courses;
    const courses: StudentCourseItem[] = Array.isArray(coursesRaw)
        ? coursesRaw
              .map((row) => normalizeStudentCourseItem(row))
              .filter((x): x is StudentCourseItem => x !== null)
        : [];

    return {
        id,
        userId,
        firstName,
        lastName,
        email,
        pkkNumber,
        notes,
        courses,
    };
}
