import type { InstructorListItem } from '~/types/instructors/instructor';
import type {
    FreeWindow,
    InstructorEvent,
    InstructorEventStudent,
} from '~/types/events/instructorEvent';

export function readInstructorIdFromEventRaw(
    o: Record<string, unknown>,
): string {
    const direct = o.instructorId;

    if (typeof direct === 'string' && direct.trim()) {
        return direct.trim();
    }

    const inst = o.instructor;

    if (inst && typeof inst === 'object') {
        const id = (inst as Record<string, unknown>).id;

        if (typeof id === 'string' && id.trim()) {
            return id.trim();
        }
    }

    return '';
}

export function readCourseIdFromEventRaw(
    o: Record<string, unknown>,
): string | null | undefined {
    if (!('courseId' in o) && !('course_id' in o)) {
        return undefined;
    }

    const val =
        'courseId' in o && o.courseId !== undefined ? o.courseId : o.course_id;

    if (val === null) {
        return null;
    }

    if (typeof val === 'string') {
        const t = val.trim();

        return t.length > 0 ? t : null;
    }

    return null;
}

export function readEventStatusFromRaw(
    o: Record<string, unknown>,
): string | undefined {
    if (!('status' in o)) {
        return undefined;
    }

    const s = o.status;

    if (typeof s !== 'string') {
        return undefined;
    }

    const t = s.trim();

    return t.length > 0 ? t : undefined;
}

export function readVehicleIdFromEventRaw(
    o: Record<string, unknown>,
): string | null {
    if (o.vehicleId === null) {
        return null;
    }

    if (typeof o.vehicleId === 'string') {
        const t = o.vehicleId.trim();

        return t.length > 0 ? t : null;
    }

    const veh = o.vehicle;

    if (veh && typeof veh === 'object') {
        const id = (veh as Record<string, unknown>).id;

        if (typeof id === 'string' && id.trim()) {
            return id.trim();
        }
    }

    return null;
}

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

export function normalizeInstructorEventFromApi(raw: unknown): InstructorEvent {
    if (!raw || typeof raw !== 'object') {
        throw new Error('Nieprawidłowa odpowiedź serwera');
    }

    const o = raw as Record<string, unknown>;
    const base = raw as InstructorEvent;
    const instructorId = readInstructorIdFromEventRaw(o);
    const vehicleId = readVehicleIdFromEventRaw(o);
    const courseIdResolved = readCourseIdFromEventRaw(o);
    const startTime =
        typeof o.startTime === 'string'
            ? o.startTime
            : typeof base.startTime === 'string'
              ? base.startTime
              : '';
    const endTime =
        typeof o.endTime === 'string'
            ? o.endTime
            : typeof base.endTime === 'string'
              ? base.endTime
              : '';
    const eventInstructor = readNestedInstructorListItem(o.instructor);
    const eventStudents =
        'students' in o ? readNestedEventStudents(o.students) : undefined;
    const freeWindowsResolved = readFreeWindowsFromRaw(o);
    const statusResolved = readEventStatusFromRaw(o);

    return {
        ...base,
        instructorId,
        vehicleId,
        startTime,
        endTime,
        ...(statusResolved !== undefined ? { status: statusResolved } : {}),
        ...(eventInstructor ? { eventInstructor } : {}),
        ...(courseIdResolved !== undefined
            ? { courseId: courseIdResolved }
            : {}),
        ...(eventStudents !== undefined ? { students: eventStudents } : {}),
        ...(freeWindowsResolved !== undefined
            ? { freeWindows: freeWindowsResolved }
            : {}),
    };
}
