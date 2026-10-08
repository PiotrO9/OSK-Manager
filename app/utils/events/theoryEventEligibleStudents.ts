import type {
    InstructorEventStudent,
    TheoryEventEligibleCapacity,
    TheoryEventEligibleStudentRow,
    TheoryEventEligibleStudentsData,
} from '~/types/events/instructorEvent';
import type { StudentListItem } from '~/types/students/student';
import { readAvatarUrlFromRecord } from '~/types/profileAvatar';

function readString(raw: unknown): string {
    if (raw === null || raw === undefined) {
        return '';
    }

    return String(raw).trim();
}

function readBool(raw: unknown, fallback = false): boolean {
    if (typeof raw === 'boolean') {
        return raw;
    }

    return fallback;
}

function readCapacity(raw: unknown): TheoryEventEligibleCapacity {
    if (!raw || typeof raw !== 'object') {
        return { limit: null, used: 0, remaining: null };
    }

    const courseRecord = raw as Record<string, unknown>;
    const limit = courseRecord.limit;

    const limitResolved =
        limit === null || limit === undefined
            ? null
            : typeof limit === 'number' && Number.isFinite(limit)
              ? Math.trunc(limit)
              : null;

    const usedRaw = courseRecord.used;

    const used =
        typeof usedRaw === 'number' && Number.isFinite(usedRaw)
            ? Math.max(0, Math.trunc(usedRaw))
            : 0;

    const rem = courseRecord.remaining;

    const remaining =
        rem === null || rem === undefined
            ? null
            : typeof rem === 'number' && Number.isFinite(rem)
              ? Math.max(0, Math.trunc(rem))
              : null;

    return {
        limit: limitResolved,
        used,
        remaining,
    };
}

function readOneStudent(raw: unknown): TheoryEventEligibleStudentRow | null {
    if (!raw || typeof raw !== 'object') {
        return null;
    }

    const studentRecord = raw as Record<string, unknown>;
    const id = readString(studentRecord.id);

    if (!id) {
        return null;
    }

    const userId =
        readString(studentRecord.userId) ||
        readString(studentRecord.user_id) ||
        readString(studentRecord.studentUserId);

    if (!userId) {
        return null;
    }

    const firstName =
        readString(studentRecord.firstName) ||
        readString(studentRecord.first_name);
    const lastName =
        readString(studentRecord.lastName) ||
        readString(studentRecord.last_name);
    const email =
        readString(studentRecord.email) || readString(studentRecord.Email);

    let phone: string | null = null;

    if (studentRecord.phone === null) {
        phone = null;
    } else if (typeof studentRecord.phone === 'string') {
        const trimmedPhone = studentRecord.phone.trim();

        phone = trimmedPhone.length > 0 ? trimmedPhone : null;
    }

    const createdAt =
        readString(studentRecord.createdAt) ||
        readString(studentRecord.created_at) ||
        '';

    return {
        id,
        userId,
        firstName,
        lastName,
        email,
        phone,
        avatarUrl: readAvatarUrlFromRecord(studentRecord),
        createdAt,
        isAssignedToEvent: readBool(
            studentRecord.isAssignedToEvent ??
                studentRecord.is_assigned_to_event,
        ),
        hasScheduleConflict: readBool(
            studentRecord.hasScheduleConflict ??
                studentRecord.has_schedule_conflict,
        ),
        canAssign: readBool(
            studentRecord.canAssign ?? studentRecord.can_assign,
        ),
    };
}

/**
 * Normalizacja `data` z GET /events/:id/eligible-students.
 */
export function normalizeTheoryEventEligibleStudents(
    raw: unknown,
): TheoryEventEligibleStudentsData | null {
    if (!raw || typeof raw !== 'object') {
        return null;
    }

    const studentRecord = raw as Record<string, unknown>;
    const courseId = readString(
        studentRecord.courseId ?? studentRecord.course_id,
    );

    if (!courseId) {
        return null;
    }

    const studentsRaw = studentRecord.students;

    const students: TheoryEventEligibleStudentRow[] = [];

    if (Array.isArray(studentsRaw)) {
        for (const item of studentsRaw) {
            const row = readOneStudent(item);

            if (row) {
                students.push(row);
            }
        }
    }

    return {
        courseId,
        capacity: readCapacity(studentRecord.capacity),
        students,
    };
}

export function theoryEligibleRowToStudentListItem(
    row: TheoryEventEligibleStudentRow,
): StudentListItem {
    return {
        id: row.id,
        userId: row.userId,
        firstName: row.firstName,
        lastName: row.lastName,
        email: row.email,
        phone: row.phone,
        avatarUrl: row.avatarUrl,
        pkkNumber: null,
        isActive: true,
        createdAt: row.createdAt,
    };
}

export function instructorEventStudentToStudentListItem(
    s: InstructorEventStudent,
): StudentListItem {
    return {
        id: s.id,
        userId: s.userId,
        firstName: s.firstName,
        lastName: s.lastName,
        email: s.email,
        phone: s.phone,
        avatarUrl: s.avatarUrl,
        pkkNumber: null,
        isActive: true,
        createdAt: '',
    };
}
