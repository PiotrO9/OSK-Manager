import { describe, expect, it } from 'vitest';

import {
    normalizeInstructorOwnLessonRatingsPayload,
    normalizePaginatedLessonRatingsPayload,
} from './lessonRating';

function ratingPayload() {
    return {
        id: 'rating-1',
        lessonId: 'lesson-1',
        rating: 4,
        comment: 'Spokojne i konkretne wskazówki.',
        createdAt: '2026-09-28T12:00:00.000Z',
        lesson: {
            id: 'lesson-1',
            startTime: '2026-09-27T08:00:00.000Z',
            endTime: '2026-09-27T09:00:00.000Z',
            sequenceNumber: 6,
            completedMinutesAfterLesson: 390,
            course: {
                id: 'course-1',
                name: 'Kurs prawa jazdy B',
                category: 'B',
                totalHours: 30,
                courseType: { code: 'B', name: 'Kategoria B' },
            },
            vehicle: {
                id: 'vehicle-1',
                name: 'Toyota Yaris',
                registrationNumber: 'WA 12345',
                brand: 'Toyota',
                model: 'Yaris',
            },
        },
        instructor: {
            id: 'instructor-1',
            userId: 'user-1',
            firstName: 'Anna',
            lastName: 'Nowak',
        },
        student: {
            id: 'student-1',
            userId: 'user-2',
            firstName: 'Jan',
            lastName: 'Kowalski',
        },
    };
}

describe('normalizeInstructorOwnLessonRatingsPayload', () => {
    it('keeps authoritative summary and pagination while removing student identity', () => {
        const payload = normalizeInstructorOwnLessonRatingsPayload({
            ratings: [ratingPayload()],
            summary: {
                averageRating: 4.25,
                totalCount: 24,
            },
            pagination: {
                page: 2,
                limit: 20,
                totalPages: 2,
            },
        });

        expect(payload.summary).toEqual({
            averageRating: 4.25,
            totalCount: 24,
        });
        expect(payload.pagination).toEqual({
            page: 2,
            limit: 20,
            totalPages: 2,
        });
        expect(payload.ratings).toHaveLength(1);
        expect(payload.ratings[0]).not.toHaveProperty('student');
    });

    it('returns safe defaults for an unreadable response', () => {
        expect(normalizeInstructorOwnLessonRatingsPayload(null)).toEqual({
            ratings: [],
            summary: { averageRating: null, totalCount: 0 },
            pagination: { page: 1, limit: 20, totalPages: 1 },
        });
    });
});

describe('normalizePaginatedLessonRatingsPayload', () => {
    it('keeps manager-visible identities and authoritative pagination', () => {
        const payload = normalizePaginatedLessonRatingsPayload({
            ratings: [ratingPayload()],
            summary: { averageRating: 4.25, totalCount: 24 },
            pagination: { page: 2, limit: 20, totalPages: 2 },
        });

        expect(payload.pagination).toEqual({
            page: 2,
            limit: 20,
            totalPages: 2,
        });
        expect(payload.ratings[0]?.student?.firstName).toBe('Jan');
        expect(payload.ratings[0]?.lesson).toMatchObject({
            sequenceNumber: 6,
            completedMinutesAfterLesson: 390,
            course: {
                id: 'course-1',
                category: 'B',
                totalHours: 30,
            },
            vehicle: {
                registrationNumber: 'WA 12345',
            },
        });
    });
});
