import type { H3Event } from 'h3';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { bffMockLessonRatingsList } from './ratingsMockBff';

const getQueryMock = vi.hoisted(() => vi.fn());

vi.mock('h3', async (importOriginal) => ({
    ...(await importOriginal<typeof import('h3')>()),
    getQuery: getQueryMock,
}));

describe('bffMockLessonRatingsList', () => {
    afterEach(() => {
        vi.useRealTimers();
        vi.clearAllMocks();
    });

    it('applies array query values and keeps summary before pagination', () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2026-06-23T12:00:00.000Z'));
        getQueryMock.mockReturnValue({
            period: ['last7days'],
            dateFrom: ['2026-06-16'],
            dateTo: ['2026-06-17'],
            page: ['2'],
            limit: ['1'],
        });

        const result = bffMockLessonRatingsList({} as H3Event, {
            schoolId: 'school-1',
            instructorId: 'instructor-1',
        });
        const data = result.data as ReturnType<
            typeof import('./lessonRatingsBff').mockLessonRatingsListPayload
        >;

        expect(data.ratings.map((rating) => rating.id)).toEqual([
            'school-1-rating-3',
        ]);
        expect(data.ratings[0]?.instructor.id).toBe('instructor-1');
        expect(data.summary).toEqual({ averageRating: 3.5, totalCount: 2 });
        expect(data.pagination).toEqual({
            page: 2,
            limit: 1,
            totalPages: 2,
        });
    });
});
