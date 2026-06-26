import type {
    ScheduleLessonItem,
    SchedulePersonRef,
} from '~/types/schedule/schedule';

function readStringField(
    o: Record<string, unknown>,
    ...keys: string[]
): string {
    for (const k of keys) {
        const v = o[k];

        if (typeof v === 'string') {
            const t = v.trim();

            if (t.length > 0) {
                return t;
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

    const o = data as Record<string, unknown>;
    const items = o.items;

    if (Array.isArray(items)) {
        return items;
    }

    const events = o.events;

    if (Array.isArray(events)) {
        return events;
    }

    return [];
}

function normalizeLessonTypeCode(raw: string): string {
    const t = raw.trim().toUpperCase();

    if (t === 'DRIVE') {
        return 'PRACTICE';
    }

    return raw.trim();
}

function readInstructor(
    o: Record<string, unknown>,
): SchedulePersonRef | undefined {
    const inst = o.instructor;

    if (inst !== null && typeof inst === 'object') {
        const ir = inst as Record<string, unknown>;
        const id = readStringField(ir, 'id', 'instructorId');
        const firstName = readStringField(ir, 'firstName', 'first_name');
        const lastName = readStringField(ir, 'lastName', 'last_name');

        if (id || firstName || lastName) {
            return {
                id: id || readStringField(o, 'instructorId', 'instructor_id'),
                firstName,
                lastName,
            };
        }
    }

    const onlyId = readStringField(o, 'instructorId', 'instructor_id');

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

    const o = raw as Record<string, unknown>;
    const id = readStringField(o, 'id', 'eventId');

    if (!id) {
        return null;
    }

    const startTime = readStringField(o, 'startTime', 'start_time');
    const endTime = readStringField(o, 'endTime', 'end_time');

    if (!startTime || !endTime) {
        return null;
    }

    const typeRaw = readStringField(o, 'type');
    const type =
        typeRaw.length > 0 ? normalizeLessonTypeCode(typeRaw) : 'THEORY';
    const status = readStringField(o, 'status') || 'ACTIVE';
    const kind = readStringField(o, 'kind');

    return {
        id,
        ...(kind.length > 0 ? { kind } : {}),
        type,
        status,
        startTime,
        endTime,
        instructor: readInstructor(o),
    };
}

export function studentEventsPayloadToScheduleItems(
    data: unknown,
): ScheduleLessonItem[] {
    const rows = unwrapStudentEventsPayload(data);
    const out: ScheduleLessonItem[] = [];

    for (const r of rows) {
        const item = normalizeStudentEventToScheduleItem(r);

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
