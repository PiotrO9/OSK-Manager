import type { InstructorListItem } from '~/types/instructors/instructor';
import type {
    FreeWindow,
    InstructorEventStudent,
} from '~/types/events/instructorEvent';
import { readAvatarUrlFromRecord } from '~/types/profileAvatar';

export function readNestedInstructorListItem(
    raw: unknown,
): InstructorListItem | null {
    if (!raw || typeof raw !== 'object') {
        return null;
    }

    const record = raw as Record<string, unknown>;
    const id = typeof record.id === 'string' ? record.id.trim() : '';

    if (!id) {
        return null;
    }

    const firstName =
        typeof record.firstName === 'string'
            ? record.firstName.trim()
            : typeof record.first_name === 'string'
              ? record.first_name.trim()
              : '';
    const lastName =
        typeof record.lastName === 'string'
            ? record.lastName.trim()
            : typeof record.last_name === 'string'
              ? record.last_name.trim()
              : '';
    const email =
        typeof record.email === 'string'
            ? record.email.trim()
            : typeof record.Email === 'string'
              ? record.Email.trim()
              : '';
    let phone: string | null | undefined;

    if (record.phone === null) {
        phone = null;
    } else if (typeof record.phone === 'string') {
        const trimmedPhone = record.phone.trim();

        phone = trimmedPhone.length > 0 ? trimmedPhone : null;
    }

    return {
        id,
        firstName,
        lastName,
        email,
        avatarUrl: readAvatarUrlFromRecord(record),
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

        const record = item as Record<string, unknown>;
        const id =
            typeof record.id === 'string'
                ? record.id.trim()
                : record.student_id != null
                  ? String(record.student_id).trim()
                  : '';

        if (!id) {
            continue;
        }

        const userIdRaw =
            record.userId ??
            record.user_id ??
            record.studentUserId ??
            record.student_user_id;
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
            typeof record.firstName === 'string'
                ? record.firstName.trim()
                : typeof record.first_name === 'string'
                  ? record.first_name.trim()
                  : '';
        const lastName =
            typeof record.lastName === 'string'
                ? record.lastName.trim()
                : typeof record.last_name === 'string'
                  ? record.last_name.trim()
                  : '';
        const email =
            typeof record.email === 'string'
                ? record.email.trim()
                : typeof record.Email === 'string'
                  ? record.Email.trim()
                  : '';

        let phone: string | null = null;

        if (record.phone === null) {
            phone = null;
        } else if (typeof record.phone === 'string') {
            const trimmedPhone = record.phone.trim();

            phone = trimmedPhone.length > 0 ? trimmedPhone : null;
        }

        out.push({
            id,
            userId,
            firstName,
            lastName,
            email,
            phone,
            avatarUrl: readAvatarUrlFromRecord(record),
        });
    }

    return out;
}

export function readFreeWindowsFromRaw(
    record: Record<string, unknown>,
): FreeWindow[] | undefined {
    const raw = record.freeWindows;

    if (!Array.isArray(raw)) {
        return undefined;
    }

    const out: FreeWindow[] = [];

    for (const item of raw) {
        if (!item || typeof item !== 'object') {
            continue;
        }

        const windowRecord = item as Record<string, unknown>;
        const startTime =
            typeof windowRecord.startTime === 'string'
                ? windowRecord.startTime.trim()
                : typeof windowRecord.start_time === 'string'
                  ? windowRecord.start_time.trim()
                  : '';
        const endTime =
            typeof windowRecord.endTime === 'string'
                ? windowRecord.endTime.trim()
                : typeof windowRecord.end_time === 'string'
                  ? windowRecord.end_time.trim()
                  : '';

        if (startTime && endTime) {
            out.push({ startTime, endTime });
        }
    }

    return out;
}
