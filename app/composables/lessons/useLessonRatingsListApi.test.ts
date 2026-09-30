import { beforeEach, describe, expect, it, vi } from 'vitest';

const requestBffData = vi.fn();

describe('useLessonRatingsListApi', () => {
    beforeEach(() => {
        vi.resetModules();
        vi.clearAllMocks();
        vi.stubGlobal('requestBffData', requestBffData);
        requestBffData.mockResolvedValue({
            ratings: [],
            summary: { averageRating: null, totalCount: 0 },
            pagination: { page: 2, limit: 20, totalPages: 2 },
        });
    });

    it('forwards instructor period and pagination to the BFF', async () => {
        const { useLessonRatingsListApi } =
            await import('./useLessonRatingsListApi');
        const api = useLessonRatingsListApi();

        await api.fetchOwnInstructorRatings({
            period: 'last30days',
            page: 2,
            limit: 20,
        });

        expect(requestBffData).toHaveBeenCalledWith(
            'GET',
            '/api/ratings/me?period=last30days&page=2&limit=20',
            expect.objectContaining({
                fallbackMessage: 'Nie udało się pobrać Twoich ocen.',
                normalize: expect.any(Function),
            }),
        );
    });

    it('forwards manager filters and pagination to the BFF', async () => {
        const { useLessonRatingsListApi } =
            await import('./useLessonRatingsListApi');
        const api = useLessonRatingsListApi();

        await api.fetchManagerRatings({
            schoolId: 'school-1',
            instructorId: 'instructor-1',
            period: 'last7days',
            page: 2,
            limit: 20,
        });

        expect(requestBffData).toHaveBeenCalledWith(
            'GET',
            '/api/ratings?schoolId=school-1&period=last7days&instructorId=instructor-1&page=2&limit=20',
            expect.objectContaining({
                normalize: expect.any(Function),
            }),
        );
    });
});
