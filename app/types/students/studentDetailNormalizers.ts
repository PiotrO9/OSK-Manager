import type { StudentCourseItem, StudentDetail } from './studentModels';
import { readStringOrNull } from './studentNormalizeShared';

function normalizeStudentCourseItem(raw: unknown): StudentCourseItem | null {
    if (!raw || typeof raw !== 'object') {
        return null;
    }

    const record = raw as Record<string, unknown>;
    const id = record.id != null ? String(record.id).trim() : '';

    if (!id) {
        return null;
    }

    const name =
        record.name != null
            ? String(record.name).trim()
            : record.title != null
              ? String(record.title).trim()
              : '';

    if (!name) {
        return null;
    }

    const category =
        record.category != null
            ? String(record.category).trim()
            : record.category_code != null
              ? String(record.category_code).trim()
              : '';

    const statusRaw = record.status;
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

    const record = raw as Record<string, unknown>;
    const id = record.id != null ? String(record.id).trim() : '';

    if (!id) {
        return null;
    }

    const userIdRaw = record.userId ?? record.user_id;
    const userId =
        userIdRaw != null && String(userIdRaw).trim().length > 0
            ? String(userIdRaw).trim()
            : id;
    const schoolIdRaw = record.schoolId ?? record.school_id;
    const schoolId =
        schoolIdRaw != null && String(schoolIdRaw).trim().length > 0
            ? String(schoolIdRaw).trim()
            : '';

    const firstName =
        record.firstName != null
            ? String(record.firstName).trim()
            : record.first_name != null
              ? String(record.first_name).trim()
              : '';

    const lastName =
        record.lastName != null
            ? String(record.lastName).trim()
            : record.last_name != null
              ? String(record.last_name).trim()
              : '';

    const email =
        record.email != null ? String(record.email).trim().toLowerCase() : '';

    if (!firstName || !lastName || !email || !schoolId) {
        return null;
    }

    const pkkNumber = readStringOrNull(record.pkkNumber ?? record.pkk_number);
    const notes = readStringOrNull(record.notes);

    const coursesRaw = record.courses;
    const courses: StudentCourseItem[] = Array.isArray(coursesRaw)
        ? coursesRaw
              .map((row) => normalizeStudentCourseItem(row))
              .filter((course): course is StudentCourseItem => course !== null)
        : [];

    return {
        id,
        userId,
        schoolId,
        firstName,
        lastName,
        email,
        pkkNumber,
        notes,
        courses,
    };
}
