import { isUuid } from '../validation/requestValidation';
import { polishSlotToIso } from '../../../app/utils/date/polishScheduleTime';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

export interface BffEventCreateAvailabilityCheck {
    intent: 'event_create';
    instructorId: string;
    eventType: 'DRIVE' | 'THEORY';
    date: string;
    startTime: string;
    endTime: string;
    vehicleId?: string;
    courseId?: string;
}

export interface BffEventEditAvailabilityCheck {
    intent: 'event_edit';
    eventId: string;
    instructorId: string;
    date: string;
    startTime: string;
    endTime: string;
    vehicleId?: string;
}

export interface BffLessonEditAvailabilityCheck {
    intent: 'lesson_edit';
    lessonId: string;
    instructorId: string;
    vehicleId: string;
    date: string;
    startTime: string;
    endTime: string;
}

export interface BffLessonCreateAvailabilityCheck {
    intent: 'lesson_create';
    courseId: string;
    studentId: string;
    instructorId: string;
    vehicleId: string;
    date: string;
    startTime: string;
    endTime: string;
}

export interface BffLessonSelfBookAvailabilityCheck {
    intent: 'lesson_self_book';
    courseId: string;
    instructorId: string;
    date: string;
    startTime: string;
    endTime: string;
}

export type BffScheduleAvailabilityCheck =
    | BffEventCreateAvailabilityCheck
    | BffEventEditAvailabilityCheck
    | BffLessonEditAvailabilityCheck
    | BffLessonCreateAvailabilityCheck
    | BffLessonSelfBookAvailabilityCheck;

const ALLOWED_FIELDS: Record<string, ReadonlySet<string>> = {
    event_create: new Set([
        'intent',
        'instructorId',
        'eventType',
        'date',
        'startTime',
        'endTime',
        'vehicleId',
        'courseId',
    ]),
    event_edit: new Set([
        'intent',
        'eventId',
        'instructorId',
        'date',
        'startTime',
        'endTime',
        'vehicleId',
    ]),
    lesson_edit: new Set([
        'intent',
        'lessonId',
        'instructorId',
        'vehicleId',
        'date',
        'startTime',
        'endTime',
    ]),
    lesson_create: new Set([
        'intent',
        'courseId',
        'studentId',
        'instructorId',
        'vehicleId',
        'date',
        'startTime',
        'endTime',
    ]),
    lesson_self_book: new Set([
        'intent',
        'courseId',
        'instructorId',
        'date',
        'startTime',
        'endTime',
    ]),
};

export function parseScheduleAvailabilityCheck(
    raw: unknown,
): BffScheduleAvailabilityCheck | null {
    if (!raw || typeof raw !== 'object') return null;

    const body = raw as Record<string, unknown>;
    const intent = String(body.intent ?? '').trim();
    const eventId = String(body.eventId ?? '').trim();
    const lessonId = String(body.lessonId ?? '').trim();
    const studentId = String(body.studentId ?? '').trim();
    const instructorId = String(body.instructorId ?? '').trim();
    const eventType = String(body.eventType ?? '').trim();
    const date = String(body.date ?? '').trim();
    const startTime = String(body.startTime ?? '').trim();
    const endTime = String(body.endTime ?? '').trim();
    const vehicleId = String(body.vehicleId ?? '').trim();
    const courseId = String(body.courseId ?? '').trim();
    const allowedFields = ALLOWED_FIELDS[intent];

    if (
        !allowedFields ||
        Object.keys(body).some((field) => !allowedFields.has(field))
    ) {
        return null;
    }

    const startIso = polishSlotToIso(date, startTime);
    const endIso = polishSlotToIso(date, endTime);

    if (
        !isUuid(instructorId) ||
        !DATE_RE.test(date) ||
        !TIME_RE.test(startTime) ||
        !TIME_RE.test(endTime) ||
        !startIso ||
        !endIso ||
        new Date(startIso).getTime() >= new Date(endIso).getTime()
    ) {
        return null;
    }

    if (intent === 'event_edit') {
        if (
            !isUuid(eventId) ||
            Boolean(eventType) ||
            Boolean(courseId) ||
            (vehicleId && !isUuid(vehicleId))
        ) {
            return null;
        }

        return {
            intent,
            eventId,
            instructorId,
            date,
            startTime,
            endTime,
            ...(vehicleId ? { vehicleId } : {}),
        };
    }

    if (intent === 'lesson_edit') {
        if (
            !isUuid(lessonId) ||
            !isUuid(vehicleId) ||
            Boolean(eventId) ||
            Boolean(eventType) ||
            Boolean(courseId)
        ) {
            return null;
        }

        return {
            intent,
            lessonId,
            instructorId,
            vehicleId,
            date,
            startTime,
            endTime,
        };
    }

    if (intent === 'lesson_create') {
        if (
            !isUuid(courseId) ||
            !isUuid(studentId) ||
            !isUuid(vehicleId) ||
            Boolean(eventId) ||
            Boolean(lessonId) ||
            Boolean(eventType)
        ) {
            return null;
        }

        return {
            intent,
            courseId,
            studentId,
            instructorId,
            vehicleId,
            date,
            startTime,
            endTime,
        };
    }

    if (intent === 'lesson_self_book') {
        if (
            !isUuid(courseId) ||
            Boolean(studentId) ||
            Boolean(vehicleId) ||
            Boolean(eventId) ||
            Boolean(lessonId) ||
            Boolean(eventType)
        ) {
            return null;
        }

        return {
            intent,
            courseId,
            instructorId,
            date,
            startTime,
            endTime,
        };
    }

    if (
        intent !== 'event_create' ||
        (eventType !== 'DRIVE' && eventType !== 'THEORY') ||
        (eventType === 'DRIVE' && Boolean(vehicleId) && !isUuid(vehicleId)) ||
        (eventType === 'DRIVE' && Boolean(courseId)) ||
        (eventType === 'THEORY' && Boolean(vehicleId)) ||
        (courseId && !isUuid(courseId))
    ) {
        return null;
    }

    return {
        intent: 'event_create',
        instructorId,
        eventType,
        date,
        startTime,
        endTime,
        ...(vehicleId ? { vehicleId } : {}),
        ...(courseId ? { courseId } : {}),
    };
}
