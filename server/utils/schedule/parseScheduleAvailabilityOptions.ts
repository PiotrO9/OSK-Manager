import { isUuid } from '../validation/requestValidation';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export type BffScheduleAvailabilityOptions =
    | {
          intent: 'event_create';
          instructorId: string;
          eventType: 'DRIVE' | 'THEORY';
          date: string;
          vehicleId?: string;
          courseId?: string;
      }
    | {
          intent: 'event_edit';
          eventId: string;
          instructorId: string;
          date: string;
          vehicleId?: string;
      }
    | {
          intent: 'lesson_edit';
          lessonId: string;
          instructorId: string;
          date: string;
          vehicleId?: string;
      };

const ALLOWED_FIELDS = new Set([
    'intent',
    'instructorId',
    'eventType',
    'date',
    'vehicleId',
    'courseId',
    'eventId',
    'lessonId',
]);

export function parseScheduleAvailabilityOptions(
    raw: unknown,
): BffScheduleAvailabilityOptions | null {
    if (!raw || typeof raw !== 'object') return null;

    const body = raw as Record<string, unknown>;

    if (Object.keys(body).some((field) => !ALLOWED_FIELDS.has(field))) {
        return null;
    }

    const intent = String(body.intent ?? '').trim();
    const instructorId = String(body.instructorId ?? '').trim();
    const eventType = String(body.eventType ?? '').trim();
    const date = String(body.date ?? '').trim();
    const vehicleId = String(body.vehicleId ?? '').trim();
    const courseId = String(body.courseId ?? '').trim();
    const eventId = String(body.eventId ?? '').trim();
    const lessonId = String(body.lessonId ?? '').trim();

    if (
        (intent === 'event_edit' || intent === 'lesson_edit') &&
        isUuid(instructorId) &&
        DATE_RE.test(date) &&
        (!vehicleId || isUuid(vehicleId)) &&
        !eventType &&
        !courseId
    ) {
        const recordId = intent === 'event_edit' ? eventId : lessonId;
        const otherRecordId = intent === 'event_edit' ? lessonId : eventId;

        if (!isUuid(recordId) || otherRecordId) return null;

        return {
            intent,
            ...(intent === 'event_edit'
                ? { eventId: recordId }
                : { lessonId: recordId }),
            instructorId,
            date,
            ...(vehicleId ? { vehicleId } : {}),
        } as BffScheduleAvailabilityOptions;
    }

    if (
        intent !== 'event_create' ||
        !isUuid(instructorId) ||
        !DATE_RE.test(date) ||
        (eventType !== 'DRIVE' && eventType !== 'THEORY')
    ) {
        return null;
    }

    if (eventId || lessonId) return null;

    if (
        eventType === 'DRIVE' &&
        ((Boolean(vehicleId) && !isUuid(vehicleId)) || Boolean(courseId))
    ) {
        return null;
    }

    if (
        eventType === 'THEORY' &&
        (Boolean(vehicleId) || (courseId && !isUuid(courseId)))
    ) {
        return null;
    }

    return {
        intent: 'event_create',
        instructorId,
        eventType,
        date,
        ...(vehicleId ? { vehicleId } : {}),
        ...(courseId ? { courseId } : {}),
    };
}
