import type { H3Event } from 'h3';

interface BackendEnvelope<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
}

export async function bffUpstreamCoursesList(
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
    const res = await fetch(`${upstreamBase}/courses?${qs.toString()}`, {
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
                    : 'Nie udało się pobrać listy kursów',
        });
    }

    return {
        success: true,
        data: json.data,
    };
}

export async function bffUpstreamMyCoursesList(
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

    const res = await fetch(`${upstreamBase}/me/courses`, {
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
                    : 'Nie udało się pobrać listy kursów użytkownika',
        });
    }

    return {
        success: true,
        data: json.data,
    };
}

export async function bffUpstreamCoursesGetById(
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
        `${upstreamBase}/courses/${encodeURIComponent(id)}`,
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
                    : 'Nie udało się pobrać szczegółów kursu',
        });
    }

    return {
        success: true,
        data: json.data,
    };
}

export async function bffUpstreamCoursesCreate(
    event: H3Event,
    upstreamBase: string,
    body: Record<string, unknown>,
): Promise<{ success: true; data: unknown }> {
    const access = getCookie(event, 'access_token');

    if (!access) {
        throw createError({
            statusCode: 401,
            message: 'Brak tokena dostępu',
        });
    }

    const res = await fetch(`${upstreamBase}/courses`, {
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
                    : 'Nie udało się utworzyć kursu',
        });
    }

    return {
        success: true,
        data: json.data,
    };
}

export async function bffUpstreamCoursesPatch(
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
        `${upstreamBase}/courses/${encodeURIComponent(id)}`,
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
                    : 'Nie udało się zaktualizować kursu',
        });
    }

    return {
        success: true,
        data: json.data,
    };
}
