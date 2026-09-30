import { afterEach, describe, expect, it, vi } from 'vitest';

import {
    mockLessonRatingsListPayload,
    mockOwnLessonRatingsPayload,
} from './lessonRatingsBff';

describe('mockLessonRatingsListPayload', () => {
    it('paginates the manager list without changing the filtered summary', () => {
        const payload = mockLessonRatingsListPayload('school-1', undefined, {
            page: 2,
            limit: 2,
        });

        expect(payload.ratings).toHaveLength(1);
        expect(payload.summary.totalCount).toBe(3);
        expect(payload.pagination).toEqual({
            page: 2,
            limit: 2,
            totalPages: 2,
        });
    });
});

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
