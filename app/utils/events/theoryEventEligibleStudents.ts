import type {
    InstructorEventStudent,
    TheoryEventEligibleCapacity,
    TheoryEventEligibleStudentRow,
    TheoryEventEligibleStudentsData,
} from '~/types/events/instructorEvent';
import type { StudentListItem } from '~/types/students/student';

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

    const c = raw as Record<string, unknown>;
    const limit = c.limit;

    const limitResolved =
        limit === null || limit === undefined
            ? null
            : typeof limit === 'number' && Number.isFinite(limit)
              ? Math.trunc(limit)
              : null;

    const usedRaw = c.used;

    const used =
        typeof usedRaw === 'number' && Number.isFinite(usedRaw)
            ? Math.max(0, Math.trunc(usedRaw))
            : 0;

    const rem = c.remaining;

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

    const o = raw as Record<string, unknown>;
    const id = readString(o.id);

    if (!id) {
        return null;
    }

    const userId =
        readString(o.userId) ||
        readString(o.user_id) ||
        readString(o.studentUserId);

    if (!userId) {
        return null;
    }

    const firstName = readString(o.firstName) || readString(o.first_name);
    const lastName = readString(o.lastName) || readString(o.last_name);
    const email = readString(o.email) || readString(o.Email);

    let phone: string | null = null;

    if (o.phone === null) {
        phone = null;
    } else if (typeof o.phone === 'string') {
        const p = o.phone.trim();

        phone = p.length > 0 ? p : null;
    }

    const createdAt = readString(o.createdAt) || readString(o.created_at) || '';

    return {
        id,
        userId,
        firstName,
        lastName,
        email,
        phone,
        createdAt,
        isAssignedToEvent: readBool(
            o.isAssignedToEvent ?? o.is_assigned_to_event,
        ),
        hasScheduleConflict: readBool(
            o.hasScheduleConflict ?? o.has_schedule_conflict,
        ),
        canAssign: readBool(o.canAssign ?? o.can_assign),
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

    const o = raw as Record<string, unknown>;
    const courseId = readString(o.courseId ?? o.course_id);

    if (!courseId) {
        return null;
    }

    const studentsRaw = o.students;

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
        capacity: readCapacity(o.capacity),
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
        pkkNumber: null,
        isActive: true,
        createdAt: '',
    };
}
