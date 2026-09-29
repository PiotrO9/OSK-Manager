import { afterEach, describe, expect, it, vi } from 'vitest';

import { mockOwnLessonRatingsPayload } from './lessonRatingsBff';

describe('mockOwnLessonRatingsPayload', () => {
    afterEach(() => {
        vi.useRealTimers();
    });

    it('applies period, pagination and instructor privacy', () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2026-09-29T12:00:00.000Z'));

        const all = mockOwnLessonRatingsPayload({
            period: 'all',
            page: 1,
            limit: 2,
        });
        const recentWeek = mockOwnLessonRatingsPayload({
            period: 'last7days',
            page: 1,
            limit: 20,
        });
        const recentMonth = mockOwnLessonRatingsPayload({
            period: 'last30days',
            page: 1,
            limit: 20,
        });

        expect(all.summary).toEqual({ averageRating: 4, totalCount: 3 });
        expect(all.pagination).toEqual({
            page: 1,
            limit: 2,
            totalPages: 2,
        });
        expect(all.ratings).toHaveLength(2);
        expect(all.ratings[0]).not.toHaveProperty('student');
        expect(recentWeek.summary).toEqual({
            averageRating: 4.5,
            totalCount: 2,
        });
        expect(recentWeek.ratings).toHaveLength(2);
        expect(recentMonth.summary).toEqual({
            averageRating: 4,
            totalCount: 3,
        });
        expect(recentMonth.ratings).toHaveLength(3);
    });
});
