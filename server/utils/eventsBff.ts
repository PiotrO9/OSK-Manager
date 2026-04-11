import type { H3Event } from 'h3';

interface BackendEnvelope<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
}

export interface InstructorEventResponse {
    id: string;
    instructorId: string;
    type: string;
    startTime: string;
    endTime: string;
    vehicleId: string | null;
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

    const json = (await res.json()) as BackendEnvelope<{
        event: InstructorEventResponse;
    }>;

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
