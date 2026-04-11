import { randomUUID } from 'node:crypto';
import { bffEventsPost } from '~~/server/utils/eventsBff';
import { isUuid } from '~~/server/utils/parseVehicleRequestBody';

type EventTypeLiteral = 'DRIVE' | 'THEORY';

function validatePostBody(raw: unknown):
    | {
          ok: true;
          body: {
              instructorId: string;
              type: EventTypeLiteral;
              startTime: string;
              endTime: string;
              vehicleId?: string;
          };
      }
    | { ok: false; message: string } {
    if (!raw || typeof raw !== 'object') {
        return { ok: false, message: 'Oczekiwano obiektu JSON.' };
    }

    const o = raw as Record<string, unknown>;
    const instructorId =
        typeof o.instructorId === 'string' ? o.instructorId.trim() : '';

    if (!instructorId || !isUuid(instructorId)) {
        return {
            ok: false,
            message: 'Pole instructorId musi być poprawnym UUID.',
        };
    }

    const typeRaw = typeof o.type === 'string' ? o.type.trim() : '';
    const type = typeRaw === 'DRIVE' || typeRaw === 'THEORY' ? typeRaw : null;

    if (!type) {
        return { ok: false, message: 'Pole type musi być DRIVE lub THEORY.' };
    }

    const startTime = typeof o.startTime === 'string' ? o.startTime.trim() : '';
    const endTime = typeof o.endTime === 'string' ? o.endTime.trim() : '';

    if (!startTime || !endTime) {
        return {
            ok: false,
            message: 'Pola startTime i endTime są wymagane (ISO 8601).',
        };
    }

    let vehicleId: string | undefined;

    if (type === 'DRIVE') {
        const v = typeof o.vehicleId === 'string' ? o.vehicleId.trim() : '';

        if (!v || !isUuid(v)) {
            return {
                ok: false,
                message: 'Dla typu DRIVE wymagane jest pole vehicleId (UUID).',
            };
        }

        vehicleId = v;
    }

    return {
        ok: true,
        body: {
            instructorId,
            type,
            startTime,
            endTime,
            vehicleId,
        },
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

    const upstream = resolveUpstreamBase(event);

    if (upstream) {
        return bffEventsPost(event, upstream, parsed.body);
    }

    await requireManagerFromCookie(event);

    const now = new Date().toISOString();

    return {
        success: true,
        data: {
            event: {
                id: randomUUID(),
                instructorId: parsed.body.instructorId,
                type: parsed.body.type,
                startTime: parsed.body.startTime,
                endTime: parsed.body.endTime,
                vehicleId:
                    parsed.body.type === 'DRIVE'
                        ? (parsed.body.vehicleId ?? null)
                        : null,
                createdAt: now,
            },
        },
    };
});
