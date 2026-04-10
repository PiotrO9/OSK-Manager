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
