import { createError, type H3Event } from 'h3';
import {
    upstreamRequest,
    type UpstreamRequestOptions,
} from '~~/server/utils/upstream/upstreamRequest';
import type { BffLessonPatchBody } from './parseLessonPatchBody';
import type { BffOwnLessonCreateBody } from './parseOwnLessonBody';

const INVALID_JSON = 'Nieprawidłowa odpowiedź serwera (niepoprawny JSON).';
const HTML_ERROR =
    'Serwer zwrócił odpowiedź HTML lub pustą zamiast JSON — sprawdź upstream API.';

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

async function lessonDataRequest<T>(
    event: H3Event,
    upstreamBase: string,
    options: UpstreamRequestOptions,
): Promise<T | undefined> {
    const { data } = await upstreamRequest<T>(event, upstreamBase, {
        invalidJsonError: INVALID_JSON,
        htmlError: HTML_ERROR,
        ...options,
    });

    return data;
}

function assertLesson<T extends object>(data: { lesson?: T } | undefined): T {
    const lesson = data?.lesson;

    if (!lesson || typeof lesson !== 'object') {
        throw createError({
            statusCode: 502,
            statusMessage: 'Nieprawidłowa odpowiedź serwera',
        });
    }

    return lesson;
}

export async function bffLessonsPost(
    event: H3Event,
    upstreamBase: string,
    body: Record<string, unknown>,
): Promise<{ success: true; data: { lesson: LessonCreateResponse } }> {
    const data = await lessonDataRequest<{ lesson: LessonCreateResponse }>(
        event,
        upstreamBase,
        {
            path: '/lessons',
            method: 'POST',
            body,
            fallbackError: 'Nie udało się utworzyć lekcji',
        },
    );

    return {
        success: true,
        data: { lesson: assertLesson(data) },
    };
}

export async function bffOwnLessonPost(
    event: H3Event,
    upstreamBase: string,
    body: BffOwnLessonCreateBody,
): Promise<{ success: true; data: { lesson: LessonCreateResponse } }> {
    const data = await lessonDataRequest<{ lesson: LessonCreateResponse }>(
        event,
        upstreamBase,
        {
            path: '/lessons/me',
            method: 'POST',
            body,
            fallbackError: 'Nie udało się zarezerwować jazdy',
            notFoundHtmlError:
                'Nie znaleziono endpointu POST /lessons/me na serwerze.',
        },
    );

    return {
        success: true,
        data: { lesson: assertLesson(data) },
    };
}

export async function bffOwnLessonCancel(
    event: H3Event,
    upstreamBase: string,
    lessonId: string,
): Promise<{ success: true; data: { lesson: LessonCreateResponse } }> {
    const data = await lessonDataRequest<{ lesson: LessonCreateResponse }>(
        event,
        upstreamBase,
        {
            path: `/lessons/${encodeURIComponent(lessonId)}/cancel`,
            method: 'PATCH',
            fallbackError: 'Nie udało się anulować rezerwacji',
            notFoundHtmlError:
                'Nie znaleziono endpointu PATCH /lessons/:lessonId/cancel na serwerze.',
        },
    );

    return {
        success: true,
        data: { lesson: assertLesson(data) },
    };
}

export async function bffLessonsGet(
    event: H3Event,
    upstreamBase: string,
    lessonId: string,
): Promise<{ success: true; data: { lesson: LessonDetailResponse } }> {
    const data = await lessonDataRequest<{ lesson: LessonDetailResponse }>(
        event,
        upstreamBase,
        {
            path: `/lessons/${encodeURIComponent(lessonId)}`,
            method: 'GET',
            fallbackError: 'Nie udało się pobrać lekcji',
            notFoundHtmlError:
                'Nie znaleziono zasobu lub brak endpointu GET /lessons/:id na serwerze (odpowiedź HTML zamiast JSON).',
        },
    );

    return {
        success: true,
        data: { lesson: assertLesson(data) },
    };
}

export async function bffLessonsPatch(
    event: H3Event,
    upstreamBase: string,
    lessonId: string,
    body: BffLessonPatchBody,
): Promise<{ success: true; data: { lesson: LessonDetailResponse } }> {
    const data = await lessonDataRequest<{ lesson: LessonDetailResponse }>(
        event,
        upstreamBase,
        {
            path: `/lessons/${encodeURIComponent(lessonId)}`,
            method: 'PATCH',
            body: body ?? {},
            fallbackError: 'Nie udało się zaktualizować lekcji',
            notFoundHtmlError:
                'Nie znaleziono zasobu lub brak endpointu PATCH /lessons/:id na serwerze (odpowiedź HTML zamiast JSON).',
        },
    );

    return {
        success: true,
        data: { lesson: assertLesson(data) },
    };
}

export async function bffLessonRatingPost(
    event: H3Event,
    upstreamBase: string,
    lessonId: string,
    body: Record<string, unknown>,
): Promise<{ success: true; data: { rating: LessonRatingResponse } }> {
    const data = await lessonDataRequest<{ rating: LessonRatingResponse }>(
        event,
        upstreamBase,
        {
            path: `/lessons/${encodeURIComponent(lessonId)}/rating`,
            method: 'POST',
            body,
            fallbackError: 'Nie udało się dodać opinii',
            notFoundHtmlError:
                'Nie znaleziono endpointu POST /lessons/:lessonId/rating na serwerze.',
        },
    );
    const rating = data?.rating;

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
    const data = await lessonDataRequest<{
        rating: LessonRatingResponse | null;
    }>(event, upstreamBase, {
        path: `/lessons/${encodeURIComponent(lessonId)}/rating`,
        method: 'GET',
        fallbackError: 'Nie udało się pobrać opinii',
        notFoundHtmlError:
            'Nie znaleziono endpointu GET /lessons/:lessonId/rating na serwerze.',
    });
    const rating = data?.rating ?? null;

    if (rating !== null && typeof rating !== 'object') {
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
