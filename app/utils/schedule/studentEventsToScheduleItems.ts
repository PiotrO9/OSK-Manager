import type {
    ScheduleLessonItem,
    SchedulePersonRef,
} from '~/types/schedule/schedule';

function readStringField(
    record: Record<string, unknown>,
    ...keys: string[]
): string {
    for (const key of keys) {
        const fieldValue = record[key];

        if (typeof fieldValue === 'string') {
            const trimmedValue = fieldValue.trim();

            if (trimmedValue.length > 0) {
                return trimmedValue;
            }
        }
    }

    return '';
}

export function unwrapStudentEventsPayload(data: unknown): unknown[] {
    if (Array.isArray(data)) {
        return data;
    }

    if (data === null || typeof data !== 'object') {
        return [];
    }

    const record = data as Record<string, unknown>;
    const items = record.items;

    if (Array.isArray(items)) {
        return items;
    }

    const events = record.events;

    if (Array.isArray(events)) {
        return events;
    }

    return [];
}

function normalizeLessonTypeCode(raw: string): string {
    const trimmedValue = raw.trim().toUpperCase();

    if (trimmedValue === 'DRIVE') {
        return 'PRACTICE';
    }

    return raw.trim();
}

function readInstructor(
    record: Record<string, unknown>,
): SchedulePersonRef | undefined {
    const instructorValue = record.instructor;

    if (instructorValue !== null && typeof instructorValue === 'object') {
        const instructorRecord = instructorValue as Record<string, unknown>;
        const id = readStringField(instructorRecord, 'id', 'instructorId');
        const firstName = readStringField(
            instructorRecord,
            'firstName',
            'first_name',
        );
        const lastName = readStringField(
            instructorRecord,
            'lastName',
            'last_name',
        );

        if (id || firstName || lastName) {
            return {
                id:
                    id ||
                    readStringField(record, 'instructorId', 'instructor_id'),
                firstName,
                lastName,
            };
        }
    }

    const onlyId = readStringField(record, 'instructorId', 'instructor_id');

    if (onlyId) {
        return {
            id: onlyId,
            firstName: '',
            lastName: '',
        };
    }

    return undefined;
}

/**
 * Jedna pozycja z GET /students/:id/events → wiersz tabeli harmonogramu (read-only).
 */
export function normalizeStudentEventToScheduleItem(
    raw: unknown,
): ScheduleLessonItem | null {
    if (raw === null || typeof raw !== 'object') {
        return null;
    }

    const record = raw as Record<string, unknown>;
    const id = readStringField(record, 'id', 'eventId');

    if (!id) {
        return null;
    }

    const startTime = readStringField(record, 'startTime', 'start_time');
    const endTime = readStringField(record, 'endTime', 'end_time');

    if (!startTime || !endTime) {
        return null;
    }

    const typeRaw = readStringField(record, 'type');
    const type =
        typeRaw.length > 0 ? normalizeLessonTypeCode(typeRaw) : 'THEORY';
    const status = readStringField(record, 'status') || 'ACTIVE';
    const kind = readStringField(record, 'kind');

    return {
        id,
        ...(kind.length > 0 ? { kind } : {}),
        type,
        status,
        startTime,
        endTime,
        instructor: readInstructor(record),
    };
}

export function studentEventsPayloadToScheduleItems(
    data: unknown,
): ScheduleLessonItem[] {
    const rows = unwrapStudentEventsPayload(data);
    const out: ScheduleLessonItem[] = [];

    for (const eventRow of rows) {
        const item = normalizeStudentEventToScheduleItem(eventRow);

        if (item) {
            out.push(item);
        }
    }

    out.sort((a, b) => a.startTime.localeCompare(b.startTime));

    return out;
}

/** Filtrowanie tygodnia po `YYYY-MM-DD` (porównanie z początkiem `startTime` ISO). */
export function filterScheduleItemsByYyyyMmDdRange(
    items: readonly ScheduleLessonItem[],
    dateFrom: string,
    dateTo: string,
): ScheduleLessonItem[] {
    const from = dateFrom.trim();
    const to = dateTo.trim();

    if (!from || !to) {
        return [...items];
    }

    return items.filter((item) => {
        const day = item.startTime.slice(0, 10);

        return day >= from && day <= to;
    });
}
