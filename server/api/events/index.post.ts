import { executeBffAdapter } from '~~/server/utils/bff/bffAdapterExecutor';
import { bffEventsPost } from '~~/server/utils/events/eventsCrudBff';
import { isUuid } from '~~/server/utils/validation/requestValidation';

type EventTypeLiteral = 'DRIVE' | 'THEORY';

function parseOptionalCapacity(
    eventRecord: Record<string, unknown>,
): number | undefined | false {
    const raw = eventRecord.capacity;

    if (raw === undefined || raw === null) {
        return undefined;
    }

    if (typeof raw === 'number') {
        if (!Number.isFinite(raw) || raw < 0 || Math.floor(raw) !== raw) {
            return false;
        }

        return raw;
    }

    if (typeof raw === 'string') {
        const trimmedValue = raw.trim();

        if (trimmedValue === '') {
            return undefined;
        }

        const parsedCapacity = Number.parseInt(trimmedValue, 10);

        if (!Number.isFinite(parsedCapacity) || parsedCapacity < 0) {
            return false;
        }

        return parsedCapacity;
    }

    return false;
}

function validatePostBody(raw: unknown):
    | {
          ok: true;
          body: {
              instructorId: string;
              type: EventTypeLiteral;
              startTime: string;
              endTime: string;
              vehicleId?: string;
              capacity?: number;
              courseId?: string;
          };
      }
    | { ok: false; message: string } {
    if (!raw || typeof raw !== 'object') {
        return { ok: false, message: 'Oczekiwano obiektu JSON.' };
    }

    const eventRecord = raw as Record<string, unknown>;
    const instructorId =
        typeof eventRecord.instructorId === 'string'
            ? eventRecord.instructorId.trim()
            : '';

    if (!instructorId || !isUuid(instructorId)) {
        return {
            ok: false,
            message: 'Pole instructorId musi być poprawnym UUID.',
        };
    }

    const typeRaw =
        typeof eventRecord.type === 'string' ? eventRecord.type.trim() : '';
    const type = typeRaw === 'DRIVE' || typeRaw === 'THEORY' ? typeRaw : null;

    if (!type) {
        return { ok: false, message: 'Pole type musi być DRIVE lub THEORY.' };
    }

    const startTime =
        typeof eventRecord.startTime === 'string'
            ? eventRecord.startTime.trim()
            : '';
    const endTime =
        typeof eventRecord.endTime === 'string'
            ? eventRecord.endTime.trim()
            : '';

    if (!startTime || !endTime) {
        return {
            ok: false,
            message: 'Pola startTime i endTime są wymagane (ISO 8601).',
        };
    }

    let vehicleId: string | undefined;

    if (type === 'DRIVE') {
        const vehicleIdValue =
            typeof eventRecord.vehicleId === 'string'
                ? eventRecord.vehicleId.trim()
                : '';

        if (!vehicleIdValue || !isUuid(vehicleIdValue)) {
            return {
                ok: false,
                message: 'Dla typu DRIVE wymagane jest pole vehicleId (UUID).',
            };
        }

        vehicleId = vehicleIdValue;
    }

    const capacity = parseOptionalCapacity(eventRecord);

    if (capacity === false) {
        return {
            ok: false,
            message:
                'Pole capacity musi być nieujemną liczbą całkowitą lub puste.',
        };
    }

    const courseRaw =
        typeof eventRecord.courseId === 'string'
            ? eventRecord.courseId.trim()
            : '';

    if (courseRaw) {
        if (type !== 'THEORY') {
            return {
                ok: false,
                message: 'Pole courseId jest dozwolone tylko przy type THEORY.',
            };
        }

        if (!isUuid(courseRaw)) {
            return {
                ok: false,
                message: 'Pole courseId musi być poprawnym UUID.',
            };
        }
    } else if (
        eventRecord.courseId !== undefined &&
        eventRecord.courseId !== null
    ) {
        return {
            ok: false,
            message: 'Pole courseId musi być niepustym UUID lub pominięte.',
        };
    }

    const body: {
        instructorId: string;
        type: EventTypeLiteral;
        startTime: string;
        endTime: string;
        vehicleId?: string;
        capacity?: number;
        courseId?: string;
    } = {
        instructorId,
        type,
        startTime,
        endTime,
        vehicleId,
    };

    if (capacity !== undefined) {
        body.capacity = capacity;
    }

    if (type === 'THEORY' && courseRaw) {
        body.courseId = courseRaw;
    }

    return {
        ok: true,
        body,
    };
}

export default defineEventHandler(async (event) => {
    const rawBody = await readBody(event);
    const parsed = validatePostBody(rawBody);

    if (!parsed.ok) {
        throw createError({
            statusCode: 400,
            message: parsed.message,
        });
    }

    return executeBffAdapter(event, {
        upstream: ({ upstreamBase }) => {
            const upstreamBody: Record<string, unknown> = {
                instructorId: parsed.body.instructorId,
                type: parsed.body.type,
                startTime: parsed.body.startTime,
                endTime: parsed.body.endTime,
            };

            if (parsed.body.type === 'DRIVE' && parsed.body.vehicleId) {
                upstreamBody.vehicleId = parsed.body.vehicleId;
            }

            if (parsed.body.capacity !== undefined) {
                upstreamBody.capacity = parsed.body.capacity;
            }

            if (parsed.body.type === 'THEORY' && parsed.body.courseId) {
                upstreamBody.courseId = parsed.body.courseId;
            }

            return bffEventsPost(event, upstreamBase, upstreamBody);
        },
        mock: async () => {
            await requireManagerFromCookie(event);

            return bffMockEventsPost(parsed.body);
        },
    });
});
