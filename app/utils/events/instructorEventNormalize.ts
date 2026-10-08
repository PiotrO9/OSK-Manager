import type { InstructorEvent } from '~/types/events/instructorEvent';
import {
    readFreeWindowsFromRaw,
    readNestedEventStudents,
    readNestedInstructorListItem,
} from './instructorEventNestedReaders';

export function readInstructorIdFromEventRaw(
    eventRecord: Record<string, unknown>,
): string {
    const direct = eventRecord.instructorId;

    if (typeof direct === 'string' && direct.trim()) {
        return direct.trim();
    }

    const instructorValue = eventRecord.instructor;

    if (instructorValue && typeof instructorValue === 'object') {
        const id = (instructorValue as Record<string, unknown>).id;

        if (typeof id === 'string' && id.trim()) {
            return id.trim();
        }
    }

    return '';
}

export function readCourseIdFromEventRaw(
    eventRecord: Record<string, unknown>,
): string | null | undefined {
    if (!('courseId' in eventRecord) && !('course_id' in eventRecord)) {
        return undefined;
    }

    const rawCourseId =
        'courseId' in eventRecord && eventRecord.courseId !== undefined
            ? eventRecord.courseId
            : eventRecord.course_id;

    if (rawCourseId === null) {
        return null;
    }

    if (typeof rawCourseId === 'string') {
        const trimmedValue = rawCourseId.trim();

        return trimmedValue.length > 0 ? trimmedValue : null;
    }

    return null;
}

export function readEventStatusFromRaw(
    eventRecord: Record<string, unknown>,
): string | undefined {
    if (!('status' in eventRecord)) {
        return undefined;
    }

    const statusValue = eventRecord.status;

    if (typeof statusValue !== 'string') {
        return undefined;
    }

    const trimmedValue = statusValue.trim();

    return trimmedValue.length > 0 ? trimmedValue : undefined;
}

export function readVehicleIdFromEventRaw(
    eventRecord: Record<string, unknown>,
): string | null {
    if (eventRecord.vehicleId === null) {
        return null;
    }

    if (typeof eventRecord.vehicleId === 'string') {
        const trimmedValue = eventRecord.vehicleId.trim();

        return trimmedValue.length > 0 ? trimmedValue : null;
    }

    const vehicleValue = eventRecord.vehicle;

    if (vehicleValue && typeof vehicleValue === 'object') {
        const id = (vehicleValue as Record<string, unknown>).id;

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

    const eventRecord = raw as Record<string, unknown>;
    const baseEvent = raw as InstructorEvent;
    const instructorId = readInstructorIdFromEventRaw(eventRecord);
    const vehicleId = readVehicleIdFromEventRaw(eventRecord);
    const courseIdResolved = readCourseIdFromEventRaw(eventRecord);
    const startTime =
        typeof eventRecord.startTime === 'string'
            ? eventRecord.startTime
            : typeof baseEvent.startTime === 'string'
              ? baseEvent.startTime
              : '';
    const endTime =
        typeof eventRecord.endTime === 'string'
            ? eventRecord.endTime
            : typeof baseEvent.endTime === 'string'
              ? baseEvent.endTime
              : '';
    const eventInstructor = readNestedInstructorListItem(
        eventRecord.instructor,
    );
    const eventStudents =
        'students' in eventRecord
            ? readNestedEventStudents(eventRecord.students)
            : undefined;
    const freeWindowsResolved = readFreeWindowsFromRaw(eventRecord);
    const statusResolved = readEventStatusFromRaw(eventRecord);

    return {
        ...baseEvent,
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
