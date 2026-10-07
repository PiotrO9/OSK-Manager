import type { H3Event } from 'h3';
import { filterMockRatingsByDate } from './mockRatingDateFilters';
import { upstreamRequest } from '~~/server/utils/upstream/upstreamRequest';

function copyRatingQuery(rawQuery: Record<string, unknown>): URLSearchParams {
    const qs = new URLSearchParams();

    for (const key of [
        'schoolId',
        'instructorId',
        'period',
        'dateFrom',
        'dateTo',
        'page',
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
    const rawQuery = getQuery(event);
    const qs = new URLSearchParams();

    for (const key of ['period', 'page', 'limit'] as const) {
        const raw = rawQuery[key];
        const value = Array.isArray(raw) ? raw[0] : raw;

        if (value !== undefined && value !== null && String(value).trim()) {
            qs.set(key, String(value).trim());
        }
    }

    const { data } = await upstreamRequest<unknown>(event, upstreamBase, {
        path: '/ratings/me',
        query: qs,
        fallbackError: 'Nie udalo sie pobrac Twoich opinii.',
    });

    return { success: true, data };
}

function makeMockRating(
    id: string,
    instructorId: string,
    index: number,
    now: Date,
) {
    const fixtureDate = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
    );

    fixtureDate.setUTCDate(fixtureDate.getUTCDate() - [1, 6, 7][index]!);
    const isoDay = fixtureDate.toISOString().slice(0, 10);

    return {
        id,
        lessonId: crypto.randomUUID(),
        rating: 5 - (index % 3),
        comment:
            index % 2 === 0
                ? 'Spokojne prowadzenie i konkretne wskazowki.'
                : null,
        createdAt: `${isoDay}T12:00:00.000Z`,
        lesson: {
            id: crypto.randomUUID(),
            startTime: `${isoDay}T08:00:00.000Z`,
            endTime: `${isoDay}T09:00:00.000Z`,
            sequenceNumber: index + 4,
            course: {
                id: `${id}-course`,
                name: 'Kurs prawa jazdy kat. B',
                category: 'B',
                totalHours: 30,
                courseType: { code: 'B', name: 'Kategoria B' },
            },
            vehicle: {
                id: `${id}-vehicle`,
                name: 'Toyota Yaris',
                registrationNumber: 'WA 12345',
                brand: 'Toyota',
                model: 'Yaris',
            },
        },
        instructor: {
            id: instructorId,
            userId: crypto.randomUUID(),
            firstName: 'Anna',
            lastName: 'Nowak',
            avatarUrl: null,
        },
        student: {
            id: crypto.randomUUID(),
            userId: crypto.randomUUID(),
            firstName: index % 2 === 0 ? 'Jan' : 'Marta',
            lastName: index % 2 === 0 ? 'Kowalski' : 'Zielinska',
            avatarUrl: null,
        },
    };
}

export function mockLessonRatingsListPayload(
    schoolId: string,
    instructorId?: string,
    options: {
        page?: number;
        limit?: number;
        period?: string;
        dateFrom?: string;
        dateTo?: string;
    } = {},
) {
    const baseInstructorId = instructorId?.trim() || crypto.randomUUID();
    const now = new Date();
    const ratings = [
        makeMockRating(`${schoolId}-rating-1`, baseInstructorId, 0, now),
        makeMockRating(`${schoolId}-rating-2`, baseInstructorId, 1, now),
        makeMockRating(`${schoolId}-rating-3`, baseInstructorId, 2, now),
    ];
    const filteredRatings = filterMockRatingsByDate(ratings, options, now);
    const total = filteredRatings.length;
    const page = Math.max(1, options.page ?? 1);
    const limit = Math.max(1, options.limit ?? 50);
    const start = (page - 1) * limit;
    const average =
        total > 0
            ? Math.round(
                  (filteredRatings.reduce((sum, item) => sum + item.rating, 0) /
                      total) *
                      100,
              ) / 100
            : null;

    return {
        ratings: filteredRatings.slice(start, start + limit),
        summary: {
            averageRating: average,
            totalCount: total,
        },
        pagination: {
            page,
            limit,
            totalPages: Math.max(1, Math.ceil(total / limit)),
        },
    };
}

export function mockOwnLessonRatingsPayload(
    options: {
        page?: number;
        limit?: number;
        period?: string;
    } = {},
) {
    const now = new Date();
    const payload = mockLessonRatingsListPayload('own', crypto.randomUUID());
    const page = Math.max(1, options.page ?? 1);
    const limit = Math.max(1, options.limit ?? 20);
    const start = (page - 1) * limit;
    const ownRatings = payload.ratings.map((rating, index) => {
        const daysAgo = index === 2 ? 12 : index + 1;
        const lessonDate = new Date(now);

        lessonDate.setUTCHours(8, 0, 0, 0);
        lessonDate.setUTCDate(lessonDate.getUTCDate() - daysAgo);

        const createdAt = new Date(lessonDate);
        const lessonEnd = new Date(lessonDate);

        createdAt.setUTCHours(12, 0, 0, 0);
        lessonEnd.setUTCHours(9, 0, 0, 0);

        return {
            ...rating,
            createdAt: createdAt.toISOString(),
            lesson: {
                ...rating.lesson,
                startTime: lessonDate.toISOString(),
                endTime: lessonEnd.toISOString(),
            },
        };
    });
    const filteredRatings = filterMockRatingsByDate(ownRatings, options, now);
    const totalCount = filteredRatings.length;
    const averageRating =
        totalCount > 0
            ? filteredRatings.reduce((sum, item) => sum + item.rating, 0) /
              totalCount
            : null;

    return {
        ratings: filteredRatings
            .slice(start, start + limit)
            .map(({ student: _student, ...rating }) => rating),
        summary: { averageRating, totalCount },
        pagination: {
            page,
            limit,
            totalPages: Math.max(1, Math.ceil(totalCount / limit)),
        },
    };
}
