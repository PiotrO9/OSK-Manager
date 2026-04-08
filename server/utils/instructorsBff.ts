import type { H3Event } from 'h3';

interface BackendEnvelope<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
}

export async function bffUpstreamInstructorsList(
    event: H3Event,
    upstreamBase: string,
    schoolId: string,
): Promise<{ success: true; data: unknown }> {
    const access = getCookie(event, 'access_token');

    if (!access) {
        throw createError({
            statusCode: 401,
            message: 'Brak tokena dostępu',
        });
    }

    const qs = new URLSearchParams({ schoolId });
    const res = await fetch(`${upstreamBase}/instructors?${qs.toString()}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${access}`,
        },
    });

    const json = (await res.json()) as BackendEnvelope<unknown>;

    if (!res.ok || !json.success) {
        throw createError({
            statusCode: res.status || 502,
            statusMessage:
                typeof json.error === 'string'
                    ? json.error
                    : 'Nie udało się pobrać listy instruktorów',
        });
    }

    return {
        success: true,
        data: json.data,
    };
}

export async function bffUpstreamInstructorsGetById(
    event: H3Event,
    upstreamBase: string,
    id: string,
): Promise<{ success: true; data: unknown }> {
    const access = getCookie(event, 'access_token');

    if (!access) {
        throw createError({
            statusCode: 401,
            message: 'Brak tokena dostępu',
        });
    }

    const res = await fetch(
        `${upstreamBase}/instructors/${encodeURIComponent(id)}`,
        {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${access}`,
            },
        },
    );

    const json = (await res.json()) as BackendEnvelope<unknown>;

    if (!res.ok || !json.success) {
        throw createError({
            statusCode: res.status || 502,
            statusMessage:
                typeof json.error === 'string'
                    ? json.error
                    : 'Nie udało się pobrać instruktora',
        });
    }

    return {
        success: true,
        data: json.data,
    };
}

export async function bffUpstreamInstructorsPatch(
    event: H3Event,
    upstreamBase: string,
    id: string,
    body: Record<string, unknown>,
): Promise<{ success: true; data: unknown }> {
    const access = getCookie(event, 'access_token');

    if (!access) {
        throw createError({
            statusCode: 401,
            message: 'Brak tokena dostępu',
        });
    }

    const res = await fetch(
        `${upstreamBase}/instructors/${encodeURIComponent(id)}`,
        {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${access}`,
            },
            body: JSON.stringify(body),
        },
    );

    const json = (await res.json()) as BackendEnvelope<unknown>;

    if (!res.ok || !json.success) {
        throw createError({
            statusCode: res.status || 502,
            statusMessage:
                typeof json.error === 'string'
                    ? json.error
                    : 'Nie udało się zaktualizować instruktora',
        });
    }

    return {
        success: true,
        data: json.data,
    };
}

/**
 * Soft delete instruktora — upstream zwraca 204 bez body.
 */
export async function bffUpstreamInstructorsDelete(
    event: H3Event,
    upstreamBase: string,
    id: string,
): Promise<{ success: true }> {
    const access = getCookie(event, 'access_token');

    if (!access) {
        throw createError({
            statusCode: 401,
            message: 'Brak tokena dostępu',
        });
    }

    const res = await fetch(
        `${upstreamBase}/instructors/${encodeURIComponent(id)}`,
        {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${access}`,
            },
        },
    );

    if (res.status === 204) {
        return { success: true };
    }

    const text = await res.text();
    let json: BackendEnvelope<unknown> | null = null;

    if (text.trim().length > 0) {
        try {
            json = JSON.parse(text) as BackendEnvelope<unknown>;
        } catch {
            json = null;
        }
    }

    if (!res.ok) {
        throw createError({
            statusCode: res.status || 502,
            statusMessage:
                json !== null && typeof json.error === 'string'
                    ? json.error
                    : res.status === 404
                      ? 'Instruktor nie istnieje.'
                      : 'Nie udało się usunąć instruktora',
        });
    }

    if (json !== null && json.success === true) {
        return { success: true };
    }

    throw createError({
        statusCode: 502,
        statusMessage: 'Nieprawidłowa odpowiedź serwera.',
    });
}
