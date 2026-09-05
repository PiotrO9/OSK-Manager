import type { InstructorListItem } from '~/types/instructors/instructor';
import type {
    FreeWindow,
    InstructorEventStudent,
} from '~/types/events/instructorEvent';

export function readNestedInstructorListItem(
    raw: unknown,
): InstructorListItem | null {
    if (!raw || typeof raw !== 'object') {
        return null;
    }

    const o = raw as Record<string, unknown>;
    const id = typeof o.id === 'string' ? o.id.trim() : '';

    if (!id) {
        return null;
    }

    const firstName =
        typeof o.firstName === 'string'
            ? o.firstName.trim()
            : typeof o.first_name === 'string'
              ? o.first_name.trim()
              : '';
    const lastName =
        typeof o.lastName === 'string'
            ? o.lastName.trim()
            : typeof o.last_name === 'string'
              ? o.last_name.trim()
              : '';
    const email =
        typeof o.email === 'string'
            ? o.email.trim()
            : typeof o.Email === 'string'
              ? o.Email.trim()
              : '';
    let phone: string | null | undefined;

    if (o.phone === null) {
        phone = null;
    } else if (typeof o.phone === 'string') {
        const p = o.phone.trim();

        phone = p.length > 0 ? p : null;
    }

    return {
        id,
        firstName,
        lastName,
        email,
        ...(phone !== undefined ? { phone } : {}),
    };
}

export function readNestedEventStudents(
    raw: unknown,
): InstructorEventStudent[] | undefined {
    if (!Array.isArray(raw)) {
        return undefined;
    }

    const out: InstructorEventStudent[] = [];

    for (const item of raw) {
        if (!item || typeof item !== 'object') {
            continue;
        }

        const o = item as Record<string, unknown>;
        const id =
            typeof o.id === 'string'
                ? o.id.trim()
                : o.student_id != null
                  ? String(o.student_id).trim()
                  : '';

        if (!id) {
            continue;
        }

        const userIdRaw =
            o.userId ?? o.user_id ?? o.studentUserId ?? o.student_user_id;
        const userId =
            typeof userIdRaw === 'string'
                ? userIdRaw.trim()
                : userIdRaw != null
                  ? String(userIdRaw).trim()
                  : '';

        if (!userId) {
            continue;
        }

        const firstName =
            typeof o.firstName === 'string'
                ? o.firstName.trim()
                : typeof o.first_name === 'string'
                  ? o.first_name.trim()
                  : '';
        const lastName =
            typeof o.lastName === 'string'
                ? o.lastName.trim()
                : typeof o.last_name === 'string'
                  ? o.last_name.trim()
                  : '';
        const email =
            typeof o.email === 'string'
                ? o.email.trim()
                : typeof o.Email === 'string'
                  ? o.Email.trim()
                  : '';

        let phone: string | null = null;

        if (o.phone === null) {
            phone = null;
        } else if (typeof o.phone === 'string') {
            const p = o.phone.trim();

            phone = p.length > 0 ? p : null;
        }

        out.push({
            id,
            userId,
            firstName,
            lastName,
            email,
            phone,
        });
    }

    return out;
}

export function readFreeWindowsFromRaw(
    o: Record<string, unknown>,
): FreeWindow[] | undefined {
    const raw = o.freeWindows;

    if (!Array.isArray(raw)) {
        return undefined;
    }

    const out: FreeWindow[] = [];

    for (const item of raw) {
        if (!item || typeof item !== 'object') {
            continue;
        }

        const w = item as Record<string, unknown>;
        const startTime =
            typeof w.startTime === 'string'
                ? w.startTime.trim()
                : typeof w.start_time === 'string'
                  ? w.start_time.trim()
                  : '';
        const endTime =
            typeof w.endTime === 'string'
                ? w.endTime.trim()
                : typeof w.end_time === 'string'
                  ? w.end_time.trim()
                  : '';

        if (startTime && endTime) {
            out.push({ startTime, endTime });
        }
    }

    return out;
}
