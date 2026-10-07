import { afterEach, describe, expect, it, vi } from 'vitest';

import {
    mockLessonRatingsListPayload,
    mockOwnLessonRatingsPayload,
} from './lessonRatingsBff';

describe('mockLessonRatingsListPayload', () => {
    afterEach(() => {
        vi.useRealTimers();
    });

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

    it('filters manager ratings by period and inclusive date range before pagination', () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2026-06-23T12:00:00.000Z'));

        const all = mockLessonRatingsListPayload('school-1', undefined, {
            period: 'all',
        });
        const week = mockLessonRatingsListPayload('school-1', undefined, {
            period: 'last7days',
        });
        const range = mockLessonRatingsListPayload('school-1', undefined, {
            period: 'last7days',
            dateFrom: '2026-06-16',
            dateTo: '2026-06-17',
            page: 2,
            limit: 1,
        });

        expect(all.summary.totalCount).toBe(3);
        expect(week.ratings.map((rating) => rating.id)).toEqual([
            'school-1-rating-1',
            'school-1-rating-2',
        ]);
        expect(range.ratings.map((rating) => rating.id)).toEqual([
            'school-1-rating-3',
        ]);
        expect(range.summary).toEqual({ averageRating: 3.5, totalCount: 2 });
        expect(range.pagination).toEqual({
            page: 2,
            limit: 1,
            totalPages: 2,
        });

        const empty = mockLessonRatingsListPayload('school-1', undefined, {
            dateFrom: '2026-06-15',
            dateTo: '2026-06-15',
        });

        expect(empty.ratings).toEqual([]);
        expect(empty.summary).toEqual({ averageRating: null, totalCount: 0 });
        expect(empty.pagination.totalPages).toBe(1);

        const beyondLastPage = mockLessonRatingsListPayload(
            'school-1',
            undefined,
            {
                dateFrom: '2026-06-16',
                dateTo: '2026-06-17',
                page: 3,
                limit: 1,
            },
        );

        expect(beyondLastPage.ratings).toEqual([]);
        expect(beyondLastPage.summary.totalCount).toBe(2);
        expect(beyondLastPage.pagination.totalPages).toBe(2);
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
