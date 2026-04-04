import type { H3Event } from 'h3';

interface BackendEnvelope<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
}

export async function bffUpstreamDrivingSchoolsList(
    event: H3Event,
    upstreamBase: string,
): Promise<{ success: true; data: unknown }> {
    const access = getCookie(event, 'access_token');

    if (!access) {
        throw createError({
            statusCode: 401,
            message: 'Brak tokena dostępu',
        });
    }

    const res = await fetch(`${upstreamBase}/driving-schools`, {
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
                    : 'Nie udało się pobrać listy OSK',
        });
    }

    return {
        success: true,
        data: json.data,
    };
}

export async function bffUpstreamDrivingSchoolsDefault(
    event: H3Event,
    upstreamBase: string,
): Promise<{ success: true; data: unknown | null }> {
    const access = getCookie(event, 'access_token');

    if (!access) {
        throw createError({
            statusCode: 401,
            message: 'Brak tokena dostępu',
        });
    }

    const res = await fetch(`${upstreamBase}/driving-schools/default`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${access}`,
        },
    });

    if (res.status === 404) {
        return { success: true, data: null };
    }

    const json = (await res.json()) as BackendEnvelope<unknown>;

    if (!res.ok || !json.success) {
        throw createError({
            statusCode: res.status || 502,
            statusMessage:
                typeof json.error === 'string'
                    ? json.error
                    : 'Nie udało się pobrać domyślnego OSK',
        });
    }

    return {
        success: true,
        data: json.data ?? null,
    };
}

export async function bffUpstreamDrivingSchoolsCreate(
    event: H3Event,
    upstreamBase: string,
    body: { name: string; city?: string; address?: string },
): Promise<{ success: true; data: unknown }> {
    const access = getCookie(event, 'access_token');

    if (!access) {
        throw createError({
            statusCode: 401,
            message: 'Brak tokena dostępu',
        });
    }

    const res = await fetch(`${upstreamBase}/driving-schools`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${access}`,
        },
        body: JSON.stringify(body),
    });

    const json = (await res.json()) as BackendEnvelope<unknown>;

    if (!res.ok || !json.success) {
        throw createError({
            statusCode: res.status || 502,
            statusMessage:
                typeof json.error === 'string'
                    ? json.error
                    : 'Nie udało się utworzyć OSK',
        });
    }

    return {
        success: true,
        data: json.data,
    };
}

export async function bffUpstreamDrivingSchoolsDelete(
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

    const res = await fetch(`${upstreamBase}/driving-schools/${id}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${access}`,
        },
    });

    if (!res.ok) {
        let errorMessage = 'Nie udało się usunąć OSK';

        try {
            const json = (await res.json()) as BackendEnvelope<unknown>;
            if (typeof json.error === 'string') errorMessage = json.error;
        } catch {
            /* ignoruj błąd parsowania */
        }

        throw createError({
            statusCode: res.status || 502,
            statusMessage: errorMessage,
        });
    }

    return { success: true };
}

export async function bffUpstreamDrivingSchoolsUpdate(
    event: H3Event,
    upstreamBase: string,
    id: string,
    body: { name: string; city?: string | null; address?: string | null },
): Promise<{ success: true; data: unknown }> {
    const access = getCookie(event, 'access_token');

    if (!access) {
        throw createError({
            statusCode: 401,
            message: 'Brak tokena dostępu',
        });
    }

    const res = await fetch(`${upstreamBase}/driving-schools/${id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${access}`,
        },
        body: JSON.stringify(body),
    });

    const json = (await res.json()) as BackendEnvelope<unknown>;

    if (!res.ok || !json.success) {
        throw createError({
            statusCode: res.status || 502,
            statusMessage:
                typeof json.error === 'string'
                    ? json.error
                    : 'Nie udało się zaktualizować OSK',
        });
    }

    return {
        success: true,
        data: json.data,
    };
}

export async function bffUpstreamDrivingSchoolsSetDefault(
    event: H3Event,
    upstreamBase: string,
    id: string,
): Promise<{ success: true; data?: unknown }> {
    const access = getCookie(event, 'access_token');

    if (!access) {
        throw createError({
            statusCode: 401,
            message: 'Brak tokena dostępu',
        });
    }

    const res = await fetch(
        `${upstreamBase}/driving-schools/${id}/set-default`,
        {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${access}`,
            },
        },
    );

    const text = await res.text();
    let json: BackendEnvelope<unknown> | null = null;

    if (text) {
        try {
            json = JSON.parse(text) as BackendEnvelope<unknown>;
        } catch {
            /* odpowiedź może być pusta */
        }
    }

    if (!res.ok) {
        const msg =
            json && typeof json.error === 'string'
                ? json.error
                : 'Nie udało się ustawić domyślnego OSK';

        throw createError({
            statusCode: res.status || 502,
            statusMessage: msg,
        });
    }

    if (json && json.success === false) {
        throw createError({
            statusCode: res.status || 502,
            statusMessage:
                typeof json.error === 'string'
                    ? json.error
                    : 'Nie udało się ustawić domyślnego OSK',
        });
    }

    return {
        success: true,
        data: json?.data,
    };
}
