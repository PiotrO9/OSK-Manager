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
    notFoundHint: string,
): BackendEnvelope<T> {
    const trimmed = text.trim();

    if (trimmed.startsWith('<') || trimmed === '') {
        const code = res.status >= 400 && res.status < 600 ? res.status : 502;
        const msg =
            res.status === 404
                ? notFoundHint
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

export type LessonDetailResponse = LessonCreateResponse;

export interface LessonRatingResponse {
    id: string;
    lessonId: string;
    instructorId: string;
    rating: number;
    comment: string | null;
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

export async function bffOwnLessonPost(
    event: H3Event,
    upstreamBase: string,
    body: Record<string, unknown>,
): Promise<{ success: true; data: { lesson: LessonCreateResponse } }> {
    const access = getCookie(event, 'access_token');

    if (!access) {
        throw createError({ statusCode: 401, message: 'Brak tokena dostepu' });
    }

    const res = await fetch(`${upstreamBase}/lessons/me`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${access}`,
        },
        body: JSON.stringify(body),
    });

    const text = await res.text();
    const json = parseBackendEnvelopeFromResponseText<{
        lesson: LessonCreateResponse;
    }>(
        res,
        text,
        'Nieprawidlowa odpowiedz serwera (niepoprawny JSON).',
        'Nie znaleziono endpointu POST /lessons/me na serwerze.',
    );

    if (!res.ok || !json.success) {
        throw createError({
            statusCode: res.status || 502,
            statusMessage:
                typeof json.error === 'string'
                    ? json.error
                    : 'Nie udalo sie zarezerwowac jazdy',
        });
    }

    const lesson = json.data?.lesson;

    if (!lesson || typeof lesson !== 'object') {
        throw createError({
            statusCode: 502,
            statusMessage: 'Nieprawidlowa odpowiedz serwera',
        });
    }

    return {
        success: true,
        data: { lesson },
    };
}

export async function bffLessonsGet(
    event: H3Event,
    upstreamBase: string,
    lessonId: string,
): Promise<{ success: true; data: { lesson: LessonDetailResponse } }> {
    const access = getCookie(event, 'access_token');

    if (!access) {
        throw createError({ statusCode: 401, message: 'Brak tokena dostępu' });
    }

    const res = await fetch(
        `${upstreamBase}/lessons/${encodeURIComponent(lessonId)}`,
        {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${access}`,
            },
        },
    );

    const text = await res.text();
    const json = parseBackendEnvelopeFromResponseText<{
        lesson: LessonDetailResponse;
    }>(
        res,
        text,
        'Nieprawidłowa odpowiedź serwera (niepoprawny JSON).',
        'Nie znaleziono zasobu lub brak endpointu GET /lessons/:id na serwerze (odpowiedź HTML zamiast JSON).',
    );

    if (!res.ok || !json.success) {
        throw createError({
            statusCode: res.status || 502,
            statusMessage:
                typeof json.error === 'string'
                    ? json.error
                    : 'Nie udało się pobrać lekcji',
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

export async function bffLessonsPatch(
    event: H3Event,
    upstreamBase: string,
    lessonId: string,
    body: Record<string, unknown>,
): Promise<{ success: true; data: { lesson: LessonDetailResponse } }> {
    const access = getCookie(event, 'access_token');

    if (!access) {
        throw createError({ statusCode: 401, message: 'Brak tokena dostępu' });
    }

    const res = await fetch(
        `${upstreamBase}/lessons/${encodeURIComponent(lessonId)}`,
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
        lesson: LessonDetailResponse;
    }>(
        res,
        text,
        'Nieprawidłowa odpowiedź serwera (niepoprawny JSON).',
        'Nie znaleziono zasobu lub brak endpointu PATCH /lessons/:id na serwerze (odpowiedź HTML zamiast JSON).',
    );

    if (!res.ok || !json.success) {
        throw createError({
            statusCode: res.status || 502,
            statusMessage:
                typeof json.error === 'string'
                    ? json.error
                    : 'Nie udało się zaktualizować lekcji',
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

export async function bffLessonRatingPost(
    event: H3Event,
    upstreamBase: string,
    lessonId: string,
    body: Record<string, unknown>,
): Promise<{ success: true; data: { rating: LessonRatingResponse } }> {
    const access = getCookie(event, 'access_token');

    if (!access) {
        throw createError({ statusCode: 401, message: 'Brak tokena dostępu' });
    }

    const res = await fetch(
        `${upstreamBase}/lessons/${encodeURIComponent(lessonId)}/rating`,
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
    const json = parseBackendEnvelopeFromResponseText<{
        rating: LessonRatingResponse;
    }>(
        res,
        text,
        'Nieprawidłowa odpowiedź serwera (niepoprawny JSON).',
        'Nie znaleziono endpointu POST /lessons/:lessonId/rating na serwerze.',
    );

    if (!res.ok || !json.success) {
        throw createError({
            statusCode: res.status || 502,
            statusMessage:
                typeof json.error === 'string'
                    ? json.error
                    : 'Nie udało się dodać opinii',
        });
    }

    const rating = json.data?.rating;

    if (!rating || typeof rating !== 'object') {
        throw createError({
            statusCode: 502,
            statusMessage: 'Nieprawidłowa odpowiedź serwera',
        });
    }

    return {
        success: true,
        data: { rating },
    };
}

export async function bffLessonRatingGet(
    event: H3Event,
    upstreamBase: string,
    lessonId: string,
): Promise<{
    success: true;
    data: { rating: LessonRatingResponse | null };
}> {
    const access = getCookie(event, 'access_token');

    if (!access) {
        throw createError({ statusCode: 401, message: 'Brak tokena dostÄ™pu' });
    }

    const res = await fetch(
        `${upstreamBase}/lessons/${encodeURIComponent(lessonId)}/rating`,
        {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${access}`,
            },
        },
    );

    const text = await res.text();
    const json = parseBackendEnvelopeFromResponseText<{
        rating: LessonRatingResponse | null;
    }>(
        res,
        text,
        'NieprawidĹ‚owa odpowiedĹş serwera (niepoprawny JSON).',
        'Nie znaleziono endpointu GET /lessons/:lessonId/rating na serwerze.',
    );

    if (!res.ok || !json.success) {
        throw createError({
            statusCode: res.status || 502,
            statusMessage:
                typeof json.error === 'string'
                    ? json.error
                    : 'Nie udaĹ‚o siÄ™ pobraÄ‡ opinii',
        });
    }

    const rating = json.data?.rating ?? null;

    if (rating !== null && typeof rating !== 'object') {
        throw createError({
            statusCode: 502,
            statusMessage: 'NieprawidĹ‚owa odpowiedĹş serwera',
        });
    }

    return {
        success: true,
        data: { rating },
    };
}
