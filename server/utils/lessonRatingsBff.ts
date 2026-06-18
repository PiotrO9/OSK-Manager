import type { H3Event } from 'h3';

interface BackendEnvelope<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
}

function getAccessToken(event: H3Event): string {
    const access = getCookie(event, 'access_token');

    if (!access) {
        throw createError({ statusCode: 401, message: 'Brak tokena dostepu' });
    }

    return access;
}

async function parseBackendEnvelope<T>(
    res: Response,
    fallbackMessage: string,
): Promise<BackendEnvelope<T>> {
    const text = await res.text();

    if (!text.trim()) {
        throw createError({
            statusCode: res.status || 502,
            statusMessage: fallbackMessage,
        });
    }

    try {
        return JSON.parse(text) as BackendEnvelope<T>;
    } catch {
        throw createError({
            statusCode: 502,
            statusMessage: 'Nieprawidlowa odpowiedz serwera.',
        });
    }
}

function copyRatingQuery(rawQuery: Record<string, unknown>): URLSearchParams {
    const qs = new URLSearchParams();

    for (const key of [
        'schoolId',
        'instructorId',
        'period',
        'dateFrom',
        'dateTo',
        'limit',
    ] as const) {
        const raw = rawQuery[key];
        const value = Array.isArray(raw) ? raw[0] : raw;

        if (value === undefined || value === null) {
            continue;
        }

        const text = String(value).trim();

        if (text.length > 0) {
            qs.set(key, text);
        }
    }

    return qs;
}

export async function bffUpstreamLessonRatingsList(
    event: H3Event,
    upstreamBase: string,
): Promise<{ success: true; data: unknown }> {
    const qs = copyRatingQuery(getQuery(event));
    const res = await fetch(`${upstreamBase}/ratings?${qs.toString()}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getAccessToken(event)}`,
        },
    });
    const json = await parseBackendEnvelope<unknown>(
        res,
        'Nie udalo sie pobrac opinii.',
    );

    if (!res.ok || !json.success) {
        throw createError({
            statusCode: res.status || 502,
            statusMessage:
                typeof json.error === 'string'
                    ? json.error
                    : 'Nie udalo sie pobrac opinii.',
        });
    }

    return { success: true, data: json.data };
}

export async function bffUpstreamInstructorLessonRatingsList(
    event: H3Event,
    upstreamBase: string,
    instructorId: string,
): Promise<{ success: true; data: unknown }> {
    const qs = copyRatingQuery(getQuery(event));

    qs.delete('instructorId');
    const suffix = qs.toString();
    const res = await fetch(
        `${upstreamBase}/instructors/${encodeURIComponent(instructorId)}/ratings${
            suffix ? `?${suffix}` : ''
        }`,
        {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${getAccessToken(event)}`,
            },
        },
    );
    const json = await parseBackendEnvelope<unknown>(
        res,
        'Nie udalo sie pobrac opinii instruktora.',
    );

    if (!res.ok || !json.success) {
        throw createError({
            statusCode: res.status || 502,
            statusMessage:
                typeof json.error === 'string'
                    ? json.error
                    : 'Nie udalo sie pobrac opinii instruktora.',
        });
    }

    return { success: true, data: json.data };
}

export async function bffUpstreamOwnLessonRatingsList(
    event: H3Event,
    upstreamBase: string,
): Promise<{ success: true; data: unknown }> {
    const res = await fetch(`${upstreamBase}/ratings/me`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getAccessToken(event)}`,
        },
    });
    const json = await parseBackendEnvelope<unknown>(
        res,
        'Nie udalo sie pobrac Twoich opinii.',
    );

    if (!res.ok || !json.success) {
        throw createError({
            statusCode: res.status || 502,
            statusMessage:
                typeof json.error === 'string'
                    ? json.error
                    : 'Nie udalo sie pobrac Twoich opinii.',
        });
    }

    return { success: true, data: json.data };
}

function makeMockRating(id: string, instructorId: string, index: number) {
    const day = 17 - index;
    const isoDay = String(day).padStart(2, '0');

    return {
        id,
        lessonId: crypto.randomUUID(),
        rating: 5 - (index % 3),
        comment:
            index % 2 === 0
                ? 'Spokojne prowadzenie i konkretne wskazowki.'
                : null,
        createdAt: `2026-06-${isoDay}T12:00:00.000Z`,
        lesson: {
            id: crypto.randomUUID(),
            startTime: `2026-06-${isoDay}T08:00:00.000Z`,
            endTime: `2026-06-${isoDay}T09:00:00.000Z`,
        },
        instructor: {
            id: instructorId,
            userId: crypto.randomUUID(),
            firstName: 'Anna',
            lastName: 'Nowak',
        },
        student: {
            id: crypto.randomUUID(),
            userId: crypto.randomUUID(),
            firstName: index % 2 === 0 ? 'Jan' : 'Marta',
            lastName: index % 2 === 0 ? 'Kowalski' : 'Zielinska',
        },
    };
}

export function mockLessonRatingsListPayload(
    schoolId: string,
    instructorId?: string,
) {
    const baseInstructorId = instructorId?.trim() || crypto.randomUUID();
    const ratings = [
        makeMockRating(`${schoolId}-rating-1`, baseInstructorId, 0),
        makeMockRating(`${schoolId}-rating-2`, baseInstructorId, 1),
        makeMockRating(`${schoolId}-rating-3`, baseInstructorId, 2),
    ];
    const total = ratings.length;
    const average =
        total > 0
            ? Math.round(
                  (ratings.reduce((sum, item) => sum + item.rating, 0) /
                      total) *
                      100,
              ) / 100
            : null;

    return {
        ratings,
        summary: {
            averageRating: average,
            totalCount: total,
        },
    };
}

export function mockOwnLessonRatingsPayload() {
    const payload = mockLessonRatingsListPayload('own', crypto.randomUUID());

    return {
        ratings: payload.ratings.map(
            ({ student: _student, ...rating }) => rating,
        ),
    };
}
