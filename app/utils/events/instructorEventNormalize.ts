import type { InstructorEvent } from '~/types/events/instructorEvent';
import {
    readFreeWindowsFromRaw,
    readNestedEventStudents,
    readNestedInstructorListItem,
} from './instructorEventNestedReaders';

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
