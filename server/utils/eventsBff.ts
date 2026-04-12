import type { H3Event } from 'h3';

interface BackendEnvelope<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
}

/**
 * Upstream czasem zwraca HTML (404 nginx, brak routy) zamiast JSON — `res.json()` wtedy rzuca.
 */
function parseBackendEnvelopeFromResponseText<T>(
    res: Response,
    text: string,
    fallbackError: string,
): BackendEnvelope<T> {
    const trimmed = text.trim();

    if (trimmed.startsWith('<') || trimmed === '') {
        const code = res.status >= 400 && res.status < 600 ? res.status : 502;
        const msg =
            res.status === 404
                ? 'Nie znaleziono zasobu lub brak endpointu GET/PATCH /events/:id na serwerze (odpowiedź HTML zamiast JSON).'
                : 'Serwer zwrócił odpowiedź HTML lub pustą zamiast JSON — sprawdź upstream API.';

        throw createError({
            statusCode: code,
            statusMessage: msg,
        });
    }

    try {
        return JSON.parse(text) as BackendEnvelope<T>;
    } catch {
        throw createError({
            statusCode: 502,
            statusMessage: fallbackError,
        });
    }
}

export interface InstructorEventResponse {
    id: string;
    instructorId: string;
    type: string;
    startTime: string;
    endTime: string;
    vehicleId: string | null;
    capacity?: number | null;
    createdAt: string;
}

export async function bffEventsPost(
    event: H3Event,
    upstreamBase: string,
    body: unknown,
): Promise<{ success: true; data: { event: InstructorEventResponse } }> {
    const access = getCookie(event, 'access_token');

    if (!access) {
        throw createError({ statusCode: 401, message: 'Brak tokena dostępu' });
    }

    const res = await fetch(`${upstreamBase}/events`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${access}`,
        },
        body: JSON.stringify(body ?? {}),
    });

    const text = await res.text();
    const json = parseBackendEnvelopeFromResponseText<{
        event: InstructorEventResponse;
    }>(res, text, 'Nieprawidłowa odpowiedź serwera (niepoprawny JSON).');

    if (!res.ok || !json.success) {
        throw createError({
            statusCode: res.status || 502,
            statusMessage:
                typeof json.error === 'string'
                    ? json.error
                    : 'Nie udało się utworzyć bloku czasu',
        });
    }

    const ev = json.data?.event;

    if (!ev || typeof ev !== 'object') {
        throw createError({
            statusCode: 502,
            statusMessage: 'Nieprawidłowa odpowiedź serwera',
        });
    }

    return {
        success: true,
        data: { event: ev },
    };
}

export async function bffEventsGet(
    event: H3Event,
    upstreamBase: string,
    eventId: string,
): Promise<{ success: true; data: { event: InstructorEventResponse } }> {
    const access = getCookie(event, 'access_token');

    if (!access) {
        throw createError({ statusCode: 401, message: 'Brak tokena dostępu' });
    }

    const res = await fetch(
        `${upstreamBase}/events/${encodeURIComponent(eventId)}`,
        {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${access}`,
            },
        },
    );

    const text = await res.text();
    const json = parseBackendEnvelopeFromResponseText<{
        event: InstructorEventResponse;
    }>(res, text, 'Nieprawidłowa odpowiedź serwera (niepoprawny JSON).');

    if (!res.ok || !json.success) {
        throw createError({
            statusCode: res.status || 502,
            statusMessage:
                typeof json.error === 'string'
                    ? json.error
                    : 'Nie udało się pobrać wydarzenia',
        });
    }

    const ev = json.data?.event;

    if (!ev || typeof ev !== 'object') {
        throw createError({
            statusCode: 502,
            statusMessage: 'Nieprawidłowa odpowiedź serwera',
        });
    }

    return {
        success: true,
        data: { event: ev },
    };
}

/**
 * GET {upstream}/events/:eventId/students — lista kursantów przypisanych (np. teoria).
 * Kształt `data` przekazywany dalej (normalizacja po stronie klienta).
 */
export async function bffEventStudentsGet(
    event: H3Event,
    upstreamBase: string,
    eventId: string,
): Promise<{ success: true; data: unknown }> {
    const access = getCookie(event, 'access_token');

    if (!access) {
        throw createError({ statusCode: 401, message: 'Brak tokena dostępu' });
    }

    const res = await fetch(
        `${upstreamBase}/events/${encodeURIComponent(eventId)}/students`,
        {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${access}`,
            },
        },
    );

    const text = await res.text();
    const json = parseBackendEnvelopeFromResponseText<unknown>(
        res,
        text,
        'Nieprawidłowa odpowiedź serwera (niepoprawny JSON).',
    );

    if (!res.ok || !json.success) {
        throw createError({
            statusCode: res.status || 502,
            statusMessage:
                typeof json.error === 'string'
                    ? json.error
                    : 'Nie udało się pobrać kursantów wydarzenia',
        });
    }

    return {
        success: true,
        data: json.data,
    };
}

export async function bffEventsPatch(
    event: H3Event,
    upstreamBase: string,
    eventId: string,
    body: unknown,
): Promise<{ success: true; data: { event: InstructorEventResponse } }> {
    const access = getCookie(event, 'access_token');

    if (!access) {
        throw createError({ statusCode: 401, message: 'Brak tokena dostępu' });
    }

    const res = await fetch(
        `${upstreamBase}/events/${encodeURIComponent(eventId)}`,
        {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${access}`,
            },
            body: JSON.stringify(body ?? {}),
        },
    );

    const text = await res.text();
    const json = parseBackendEnvelopeFromResponseText<{
        event: InstructorEventResponse;
    }>(res, text, 'Nieprawidłowa odpowiedź serwera (niepoprawny JSON).');

    if (!res.ok || !json.success) {
        throw createError({
            statusCode: res.status || 502,
            statusMessage:
                typeof json.error === 'string'
                    ? json.error
                    : 'Nie udało się zaktualizować wydarzenia',
        });
    }

    const ev = json.data?.event;

    if (!ev || typeof ev !== 'object') {
        throw createError({
            statusCode: 502,
            statusMessage: 'Nieprawidłowa odpowiedź serwera',
        });
    }

    return {
        success: true,
        data: { event: ev },
    };
}

export interface EventStudentsAssignResponse {
    assigned: number;
    skipped: number;
}

export async function bffEventStudentsPost(
    event: H3Event,
    upstreamBase: string,
    eventId: string,
    body: { studentIds: string[] },
): Promise<{
    success: true;
    data: EventStudentsAssignResponse;
}> {
    const access = getCookie(event, 'access_token');

    if (!access) {
        throw createError({ statusCode: 401, message: 'Brak tokena dostępu' });
    }

    const res = await fetch(
        `${upstreamBase}/events/${encodeURIComponent(eventId)}/students`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${access}`,
            },
            body: JSON.stringify(body),
        },
    );

    const text = await res.text();
    const json =
        parseBackendEnvelopeFromResponseText<EventStudentsAssignResponse>(
            res,
            text,
            'Nieprawidłowa odpowiedź serwera (niepoprawny JSON).',
        );

    if (!res.ok || !json.success) {
        throw createError({
            statusCode: res.status || 502,
            statusMessage:
                typeof json.error === 'string'
                    ? json.error
                    : 'Nie udało się przypisać kursantów do wydarzenia',
        });
    }

    const data = json.data;

    if (
        !data ||
        typeof data !== 'object' ||
        typeof data.assigned !== 'number' ||
        typeof data.skipped !== 'number'
    ) {
        throw createError({
            statusCode: 502,
            statusMessage: 'Nieprawidłowa odpowiedź serwera',
        });
    }

    return {
        success: true,
        data: {
            assigned: data.assigned,
            skipped: data.skipped,
        },
    };
}

export interface EventStudentsRemoveResponse {
    removed: number;
}

export async function bffEventStudentsDelete(
    event: H3Event,
    upstreamBase: string,
    eventId: string,
    body: { studentIds: string[] },
): Promise<{
    success: true;
    data: EventStudentsRemoveResponse;
}> {
    const access = getCookie(event, 'access_token');

    if (!access) {
        throw createError({ statusCode: 401, message: 'Brak tokena dostępu' });
    }

    const res = await fetch(
        `${upstreamBase}/events/${encodeURIComponent(eventId)}/students`,
        {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${access}`,
            },
            body: JSON.stringify({ studentIds: body.studentIds }),
        },
    );

    const text = await res.text();
    const json =
        parseBackendEnvelopeFromResponseText<EventStudentsRemoveResponse>(
            res,
            text,
            'Nieprawidłowa odpowiedź serwera (niepoprawny JSON).',
        );

    if (!res.ok || !json.success) {
        throw createError({
            statusCode: res.status || 502,
            statusMessage:
                typeof json.error === 'string'
                    ? json.error
                    : 'Nie udało się usunąć kursantów z wydarzenia',
        });
    }

    const data = json.data;

    if (!data || typeof data !== 'object' || typeof data.removed !== 'number') {
        throw createError({
            statusCode: 502,
            statusMessage: 'Nieprawidłowa odpowiedź serwera',
        });
    }

    return {
        success: true,
        data: {
            removed: data.removed,
        },
    };
}
