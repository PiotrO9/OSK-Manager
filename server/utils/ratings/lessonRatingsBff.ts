import type { H3Event } from 'h3';
import { upstreamRequest } from '~~/server/utils/upstream/upstreamRequest';

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
    const { data } = await upstreamRequest<unknown>(event, upstreamBase, {
        path: '/ratings',
        query: qs,
        fallbackError: 'Nie udalo sie pobrac opinii.',
    });

    return { success: true, data };
}

export async function bffUpstreamInstructorLessonRatingsList(
    event: H3Event,
    upstreamBase: string,
    instructorId: string,
): Promise<{ success: true; data: unknown }> {
    const qs = copyRatingQuery(getQuery(event));

    qs.delete('instructorId');
    const { data } = await upstreamRequest<unknown>(event, upstreamBase, {
        path: `/instructors/${encodeURIComponent(instructorId)}/ratings`,
        query: qs,
        fallbackError: 'Nie udalo sie pobrac opinii instruktora.',
    });

    return { success: true, data };
}

export async function bffUpstreamOwnLessonRatingsList(
    event: H3Event,
    upstreamBase: string,
): Promise<{ success: true; data: unknown }> {
    const { data } = await upstreamRequest<unknown>(event, upstreamBase, {
        path: '/ratings/me',
        fallbackError: 'Nie udalo sie pobrac Twoich opinii.',
    });

    return { success: true, data };
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
