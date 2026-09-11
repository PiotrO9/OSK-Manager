import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ref } from 'vue';

const fetchInstructorRatings = vi.fn();

function installNuxtRatingSummaryGlobals(): void {
    vi.stubGlobal('ref', ref);
    vi.stubGlobal('useLessonRatingsListApi', () => ({
        fetchInstructorRatings,
    }));
}

describe('useManagerInstructorDetailsRatingSummary', () => {
    beforeEach(() => {
        vi.resetModules();
        vi.unstubAllGlobals();
        vi.clearAllMocks();
        installNuxtRatingSummaryGlobals();
    });

    it('skips API calls and resets summary without instructor id', async () => {
        const { useManagerInstructorDetailsRatingSummary } =
            await import('./useManagerInstructorDetailsRatingSummary');
        const data = useManagerInstructorDetailsRatingSummary();

        data.ratingSummary.value = { averageRating: 4.8, totalCount: 12 };
        await data.loadRatingSummary('   ', 'school-1');

        expect(fetchInstructorRatings).not.toHaveBeenCalled();
        expect(data.ratingSummary.value).toEqual({
            averageRating: null,
            totalCount: 0,
        });
        expect(data.isRatingSummaryLoading.value).toBe(false);
    });

    it('skips API calls and resets summary without school id', async () => {
        const { useManagerInstructorDetailsRatingSummary } =
            await import('./useManagerInstructorDetailsRatingSummary');
        const data = useManagerInstructorDetailsRatingSummary();

        data.ratingSummary.value = { averageRating: 4.8, totalCount: 12 };
        await data.loadRatingSummary('instructor-1', '');

        expect(fetchInstructorRatings).not.toHaveBeenCalled();
        expect(data.ratingSummary.value).toEqual({
            averageRating: null,
            totalCount: 0,
        });
    });

    it('loads all-time instructor rating summary for the current school', async () => {
        fetchInstructorRatings.mockResolvedValue({
            ratings: [],
            summary: { averageRating: 4.5, totalCount: 10 },
        });

        const { useManagerInstructorDetailsRatingSummary } =
            await import('./useManagerInstructorDetailsRatingSummary');
        const data = useManagerInstructorDetailsRatingSummary();

        await data.loadRatingSummary(' instructor-1 ', ' school-1 ');

        expect(fetchInstructorRatings).toHaveBeenCalledWith('instructor-1', {
            schoolId: 'school-1',
            period: 'all',
            limit: 1,
        });
        expect(data.ratingSummary.value).toEqual({
            averageRating: 4.5,
            totalCount: 10,
        });
        expect(data.isRatingSummaryLoading.value).toBe(false);
    });

    it('resets summary and clears loading state on API failure', async () => {
        fetchInstructorRatings.mockRejectedValue(new Error('API down'));

        const { useManagerInstructorDetailsRatingSummary } =
            await import('./useManagerInstructorDetailsRatingSummary');
        const data = useManagerInstructorDetailsRatingSummary();

        data.ratingSummary.value = { averageRating: 4.8, totalCount: 12 };
        await data.loadRatingSummary('instructor-1', 'school-1');

        expect(data.ratingSummary.value).toEqual({
            averageRating: null,
            totalCount: 0,
        });
        expect(data.isRatingSummaryLoading.value).toBe(false);
    });
});
