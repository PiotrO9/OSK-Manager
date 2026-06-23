import { bffEventsPatch } from '~~/server/utils/eventsBff';
import { isUuid } from '~~/server/utils/parseVehicleRequestBody';

type EventTypeLiteral = 'DRIVE' | 'THEORY';

function parseOptionalCapacityPatch(
    raw: unknown,
): number | null | false | undefined {
    if (raw === undefined) {
        return undefined;
    }

    if (raw === null) {
        return null;
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

function validatePatchBody(
    raw: unknown,
):
    | { ok: true; body: Record<string, unknown> }
    | { ok: false; message: string } {
    if (raw === null || raw === undefined) {
        return { ok: true, body: {} };
    }

    if (typeof raw !== 'object') {
        return { ok: false, message: 'Oczekiwano obiektu JSON.' };
    }

    const o = raw as Record<string, unknown>;
    const body: Record<string, unknown> = {};

    if ('instructorId' in o) {
        const id =
            typeof o.instructorId === 'string' ? o.instructorId.trim() : '';

        if (!id || !isUuid(id)) {
            return {
                ok: false,
                message: 'Pole instructorId musi być poprawnym UUID.',
            };
        }

        body.instructorId = id;
    }

    if ('type' in o) {
        const typeRaw = typeof o.type === 'string' ? o.type.trim() : '';
        const type =
            typeRaw === 'DRIVE' || typeRaw === 'THEORY' ? typeRaw : null;

        if (!type) {
            return {
                ok: false,
                message: 'Pole type musi być DRIVE lub THEORY.',
            };
        }

        body.type = type;
    }

    if ('startTime' in o) {
        const startTime =
            typeof o.startTime === 'string' ? o.startTime.trim() : '';

        if (!startTime) {
            return {
                ok: false,
                message: 'Pole startTime nie może być puste.',
            };
        }

        body.startTime = startTime;
    }

    if ('endTime' in o) {
        const endTime = typeof o.endTime === 'string' ? o.endTime.trim() : '';

        if (!endTime) {
            return {
                ok: false,
                message: 'Pole endTime nie może być puste.',
            };
        }

        body.endTime = endTime;
    }

    if ('vehicleId' in o) {
        const v = o.vehicleId;

        if (v === null) {
            body.vehicleId = null;
        } else if (typeof v === 'string') {
            const t = v.trim();

            if (!t || !isUuid(t)) {
                return {
                    ok: false,
                    message: 'Pole vehicleId musi być poprawnym UUID lub null.',
                };
            }

            body.vehicleId = t;
        } else {
            return {
                ok: false,
                message: 'Pole vehicleId musi być poprawnym UUID lub null.',
            };
        }
    }

    if ('capacity' in o) {
        const cap = parseOptionalCapacityPatch(o.capacity);

        if (cap === false) {
            return {
                ok: false,
                message:
                    'Pole capacity musi być nieujemną liczbą całkowitą, null lub puste.',
            };
        }

        if (cap !== undefined) {
            body.capacity = cap;
        }
    }

    if ('status' in o) {
        const sRaw = typeof o.status === 'string' ? o.status.trim() : '';
        const allowed = new Set(['PLANNED', 'DONE', 'NO_SHOW', 'CANCELLED']);

        if (!sRaw || !allowed.has(sRaw)) {
            return {
                ok: false,
                message:
                    'Pole status musi być PLANNED, DONE, NO_SHOW lub CANCELLED.',
            };
        }

        body.status = sRaw;
    }

    return { ok: true, body };
}

export default defineEventHandler(async (event) => {
    const eventIdRaw = getRouterParam(event, 'eventId');
    const eventId = eventIdRaw?.trim() ?? '';

    if (!eventId) {
        throw createError({
            statusCode: 400,
            message: 'Brak identyfikatora wydarzenia.',
        });
    }

    if (!isUuid(eventId)) {
        throw createError({
            statusCode: 400,
            message: 'Nieprawidłowy identyfikator wydarzenia.',
        });
    }

    const rawBody = await readBody(event);
    const parsed = validatePatchBody(rawBody);

    if (!parsed.ok) {
        throw createError({
            statusCode: 400,
            message: parsed.message,
        });
    }

    const upstream = resolveUpstreamBase(event);

    if (upstream) {
        return bffEventsPatch(event, upstream, eventId, parsed.body);
    }

    await requireManagerFromCookie(event);

    const now = new Date().toISOString();
    const b = parsed.body;

    const type =
        (b.type as EventTypeLiteral | undefined) ??
        ('THEORY' as EventTypeLiteral);

    let vehicleId: string | null = null;

    if (type === 'DRIVE') {
        vehicleId =
            b.vehicleId !== undefined
                ? (b.vehicleId as string | null)
                : '00000000-0000-4000-8000-000000000002';
    }

    const defaultStatus = 'PLANNED' as const;

    return {
        success: true,
        data: {
            event: {
                id: eventId,
                instructorId:
                    (b.instructorId as string | undefined) ??
                    '00000000-0000-4000-8000-000000000001',
                type,
                startTime: (b.startTime as string | undefined) ?? now,
                endTime: (b.endTime as string | undefined) ?? now,
                vehicleId,
                capacity:
                    b.capacity !== undefined
                        ? (b.capacity as number | null)
                        : null,
                status: (b.status as string | undefined) ?? defaultStatus,
                createdAt: now,
            },
        },
    };
});
