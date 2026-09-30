import { getQuery, type H3Event } from 'h3';
import {
    mockLessonRatingsListPayload,
    mockOwnLessonRatingsPayload,
} from './lessonRatingsBff';

function dataSuccess(data: unknown): { success: true; data: unknown } {
    return { success: true, data };
}

function readPositiveInt(raw: unknown, fallback: number): number {
    const value = Array.isArray(raw) ? raw[0] : raw;
    const parsed = Number.parseInt(String(value ?? ''), 10);

    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function bffMockLessonRatingsList(
    event: H3Event,
    params: {
        schoolId: string;
        instructorId?: string;
    },
): { success: true; data: unknown } {
    const query = getQuery(event);

    return dataSuccess(
        mockLessonRatingsListPayload(params.schoolId, params.instructorId, {
            page: readPositiveInt(query.page, 1),
            limit: readPositiveInt(query.limit, 50),
        }),
    );
}

export function bffMockOwnLessonRatingsList(event: H3Event): {
    success: true;
    data: unknown;
} {
    const query = getQuery(event);

    return dataSuccess(
        mockOwnLessonRatingsPayload({
            page: readPositiveInt(query.page, 1),
            limit: readPositiveInt(query.limit, 20),
            period: Array.isArray(query.period)
                ? String(query.period[0] ?? '')
                : String(query.period ?? ''),
        }),
    );
}
