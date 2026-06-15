import type { H3Event } from 'h3';

interface BackendEnvelope<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
}

export async function bffUpstreamStudentsList(
    event: H3Event,
    upstreamBase: string,
    params: {
        schoolId: string;
        page: number;
        limit: number;
        courseId?: string;
    },
): Promise<{ success: true; data: unknown }> {
    const access = getCookie(event, 'access_token');

    if (!access) {
        throw createError({
            statusCode: 401,
            message: 'Brak tokena dostępu',
        });
    }

    const qs = new URLSearchParams({
        schoolId: params.schoolId,
        page: String(params.page),
        limit: String(params.limit),
    });

    if (params.courseId !== undefined && params.courseId.trim().length > 0) {
        qs.set('courseId', params.courseId.trim());
    }

    const res = await fetch(`${upstreamBase}/students?${qs.toString()}`, {
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
                    : 'Nie udało się pobrać listy kursantów',
        });
    }

    return {
        success: true,
        data: json.data,
    };
}

export async function bffUpstreamStudentDetail(
    event: H3Event,
    upstreamBase: string,
    userId: string,
    schoolId: string,
): Promise<{ success: true; data: unknown }> {
    const access = getCookie(event, 'access_token');

    if (!access) {
        throw createError({
            statusCode: 401,
            message: 'Brak tokena dostępu',
        });
    }

    const qs = new URLSearchParams({ schoolId: schoolId.trim() });

    const res = await fetch(
        `${upstreamBase}/students/${encodeURIComponent(userId)}?${qs.toString()}`,
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
                    : 'Nie udało się pobrać danych kursanta',
        });
    }

    return {
        success: true,
        data: json.data,
    };
}

/**
 * GET {upstream}/students/:userId/events — wydarzenia przypisane do kursanta.
 * Opcjonalny query (np. dateFrom, dateTo) przekazywany bez zmian, jeśli backend wspiera.
 */
export async function bffUpstreamStudentEvents(
    event: H3Event,
    upstreamBase: string,
    userId: string,
    queryString?: string,
): Promise<{ success: true; data: unknown }> {
    const access = getCookie(event, 'access_token');

    if (!access) {
        throw createError({
            statusCode: 401,
            message: 'Brak tokena dostępu',
        });
    }

    const qs = queryString?.trim() ?? '';
    const path = `${upstreamBase}/students/${encodeURIComponent(userId)}/events`;
    const url = qs.length > 0 ? `${path}?${qs}` : path;

    const res = await fetch(url, {
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
                    : 'Nie udało się pobrać wydarzeń kursanta',
        });
    }

    return {
        success: true,
        data: json.data,
    };
}

export async function bffUpstreamStudentProcessStatus(
    event: H3Event,
    upstreamBase: string,
    userId: string,
    schoolId: string,
): Promise<{ success: true; data: unknown }> {
    const access = getCookie(event, 'access_token');

    if (!access) {
        throw createError({
            statusCode: 401,
            message: 'Brak tokena dostÄ™pu',
        });
    }

    const qs = new URLSearchParams({ schoolId: schoolId.trim() });

    const res = await fetch(
        `${upstreamBase}/students/${encodeURIComponent(userId)}/process-status?${qs.toString()}`,
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
                    : 'Nie udaĹ‚o siÄ™ pobraÄ‡ statusu procesu kursanta',
        });
    }

    return {
        success: true,
        data: json.data,
    };
}

export async function bffUpstreamUpdateStudentNotes(
    event: H3Event,
    upstreamBase: string,
    userId: string,
    notes: string | null,
): Promise<{ success: true; data: unknown }> {
    const access = getCookie(event, 'access_token');

    if (!access) {
        throw createError({
            statusCode: 401,
            message: 'Brak tokena dostępu',
        });
    }

    const res = await fetch(
        `${upstreamBase}/students/${encodeURIComponent(userId)}`,
        {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${access}`,
            },
            body: JSON.stringify({ notes }),
        },
    );

    const json = (await res.json()) as BackendEnvelope<unknown>;

    if (!res.ok || !json.success) {
        throw createError({
            statusCode: res.status || 502,
            statusMessage:
                typeof json.error === 'string'
                    ? json.error
                    : 'Nie udało się zapisać notatki kursanta',
        });
    }

    return {
        success: true,
        data: json.data,
    };
}

export async function bffUpstreamStudentAssignToCourse(
    event: H3Event,
    upstreamBase: string,
    studentUserId: string,
    body: { courseId: string },
): Promise<{ success: true; data: unknown }> {
    const access = getCookie(event, 'access_token');

    if (!access) {
        throw createError({
            statusCode: 401,
            message: 'Brak tokena dostępu',
        });
    }

    const res = await fetch(
        `${upstreamBase}/students/${encodeURIComponent(studentUserId)}/courses`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${access}`,
            },
            body: JSON.stringify({ courseId: body.courseId }),
        },
    );

    const json = (await res.json()) as BackendEnvelope<unknown>;

    if (!res.ok || !json.success) {
        throw createError({
            statusCode: res.status || 502,
            statusMessage:
                typeof json.error === 'string'
                    ? json.error
                    : 'Nie udało się zapisać kursanta na kurs',
        });
    }

    return {
        success: true,
        data: json.data,
    };
}
