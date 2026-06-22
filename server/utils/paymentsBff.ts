import type { H3Event } from 'h3';

interface BackendEnvelope<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
}

function readAccessToken(event: H3Event): string {
    const access = getCookie(event, 'access_token');

    if (!access) {
        throw createError({
            statusCode: 401,
            message: 'Brak tokena dostępu',
        });
    }

    return access;
}

async function readBackendEnvelope(res: Response, fallback: string) {
    const json = (await res.json()) as BackendEnvelope<unknown>;

    if (!res.ok || !json.success) {
        throw createError({
            statusCode: res.status || 502,
            statusMessage:
                typeof json.error === 'string' ? json.error : fallback,
        });
    }

    return {
        success: true as const,
        data: json.data,
    };
}

export async function bffUpstreamMyPaymentsList(
    event: H3Event,
    upstreamBase: string,
): Promise<{ success: true; data: unknown }> {
    const access = readAccessToken(event);

    const res = await fetch(`${upstreamBase}/me/payments`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${access}`,
        },
    });

    return readBackendEnvelope(
        res,
        'Nie udało się pobrać listy opłat użytkownika',
    );
}

export async function bffUpstreamStudentPaymentsList(
    event: H3Event,
    upstreamBase: string,
    userId: string,
    schoolId: string,
): Promise<{ success: true; data: unknown }> {
    const access = readAccessToken(event);
    const qs = new URLSearchParams({ schoolId: schoolId.trim() });

    const res = await fetch(
        `${upstreamBase}/students/${encodeURIComponent(userId)}/payments?${qs.toString()}`,
        {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${access}`,
            },
        },
    );

    return readBackendEnvelope(
        res,
        'Nie udało się pobrać listy opłat kursanta',
    );
}
