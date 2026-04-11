import { randomUUID } from 'node:crypto';
import { bffEventsPost } from '~~/server/utils/eventsBff';
import { isUuid } from '~~/server/utils/parseVehicleRequestBody';

type EventTypeLiteral = 'DRIVE' | 'THEORY';

function parseOptionalCapacity(
    o: Record<string, unknown>,
): number | undefined | false {
    const raw = o.capacity;

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
        const t = raw.trim();

        if (t === '') {
            return undefined;
        }

        const n = Number.parseInt(t, 10);

        if (!Number.isFinite(n) || n < 0) {
            return false;
        }

        return n;
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

    const cap = parseOptionalCapacity(o);

    if (cap === false) {
        return {
            ok: false,
            message:
                'Pole capacity musi być nieujemną liczbą całkowitą lub puste.',
        };
    }

    const body: {
        instructorId: string;
        type: EventTypeLiteral;
        startTime: string;
        endTime: string;
        vehicleId?: string;
        capacity?: number;
    } = {
        instructorId,
        type,
        startTime,
        endTime,
        vehicleId,
    };

    if (cap !== undefined) {
        body.capacity = cap;
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

    const upstream = resolveUpstreamBase(event);

    if (upstream) {
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

        return bffEventsPost(event, upstream, upstreamBody);
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
                capacity:
                    parsed.body.capacity !== undefined
                        ? parsed.body.capacity
                        : null,
                createdAt: now,
            },
        },
    };
});
