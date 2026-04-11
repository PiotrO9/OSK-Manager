import type { H3Event } from 'h3';

interface BackendEnvelope<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
}

export interface LessonCreateResponse {
    id: string;
    courseId: string;
    studentId: string;
    instructorId: string;
    vehicleId: string | null;
    lessonType: string;
    startTime: string;
    endTime: string;
    status: string;
    createdAt: string;
}

export async function bffLessonsPost(
    event: H3Event,
    upstreamBase: string,
    body: Record<string, unknown>,
): Promise<{ success: true; data: { lesson: LessonCreateResponse } }> {
    const access = getCookie(event, 'access_token');

    if (!access) {
        throw createError({ statusCode: 401, message: 'Brak tokena dostępu' });
    }

    const res = await fetch(`${upstreamBase}/lessons`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${access}`,
        },
        body: JSON.stringify(body),
    });

    const json = (await res.json()) as BackendEnvelope<{
        lesson: LessonCreateResponse;
    }>;

    if (!res.ok || !json.success) {
        throw createError({
            statusCode: res.status || 502,
            statusMessage:
                typeof json.error === 'string'
                    ? json.error
                    : 'Nie udało się utworzyć lekcji',
        });
    }

    const lesson = json.data?.lesson;

    if (!lesson || typeof lesson !== 'object') {
        throw createError({
            statusCode: 502,
            statusMessage: 'Nieprawidłowa odpowiedź serwera',
        });
    }

    return {
        success: true,
        data: { lesson },
    };
}
