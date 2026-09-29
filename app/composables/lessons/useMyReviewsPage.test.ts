import { beforeEach, describe, expect, it, vi } from 'vitest';
import { nextTick, reactive, readonly, ref, shallowRef, watch } from 'vue';

const fetchOwnInstructorRatings = vi.fn();
const replace = vi.fn();
const route = reactive({ query: {} as Record<string, string | undefined> });

const firstPagePayload = {
    ratings: [
        {
            id: 'rating-1',
            lessonId: 'lesson-1',
            rating: 5,
            comment: 'Bardzo dobra jazda.',
            createdAt: '2026-09-28T12:00:00.000Z',
            lesson: {
                id: 'lesson-1',
                startTime: '2026-09-28T08:00:00.000Z',
                endTime: '2026-09-28T09:00:00.000Z',
            },
            instructor: {
                id: 'instructor-1',
                userId: 'user-1',
                firstName: 'Anna',
                lastName: 'Nowak',
                avatarUrl: null,
            },
        },
    ],
    summary: { averageRating: 4.75, totalCount: 21 },
    pagination: { page: 1, limit: 20, totalPages: 2 },
};

function installGlobals() {
    vi.stubGlobal('ref', ref);
    vi.stubGlobal('shallowRef', shallowRef);
    vi.stubGlobal('readonly', readonly);
    vi.stubGlobal('watch', watch);
    vi.stubGlobal('onMounted', (callback: () => void) => callback());
    vi.stubGlobal('useRoute', () => route);
    vi.stubGlobal('useRouter', () => ({ replace }));
    vi.stubGlobal('useLessonRatingsListApi', () => ({
        fetchOwnInstructorRatings,
    }));
}

describe('useMyReviewsPage', () => {
    beforeEach(() => {
        vi.resetModules();
        vi.unstubAllGlobals();
        vi.clearAllMocks();
        route.query = {};
        fetchOwnInstructorRatings.mockResolvedValue(firstPagePayload);
        replace.mockImplementation(
            async ({
                query,
            }: {
                query: Record<string, string | undefined>;
            }) => {
                route.query = query;
                await nextTick();
            },
        );
        installGlobals();
    });

    it('loads authoritative summary and pagination', async () => {
        const { useMyReviewsPage } = await import('./useMyReviewsPage');
        const page = useMyReviewsPage();

        await vi.waitFor(() => expect(page.ratings.value).toHaveLength(1));

        expect(fetchOwnInstructorRatings).toHaveBeenCalledWith({
            period: 'all',
            page: 1,
            limit: 20,
        });
        expect(page.summary.value).toEqual(firstPagePayload.summary);
        expect(page.totalPages.value).toBe(2);
    });

    it('keeps week and month filters local and reloads page one', async () => {
        const { useMyReviewsPage } = await import('./useMyReviewsPage');
        const page = useMyReviewsPage();

        await vi.waitFor(() => expect(page.ratings.value).toHaveLength(1));
        await page.handlePeriodChange('last7days');

        await vi.waitFor(() =>
            expect(fetchOwnInstructorRatings).toHaveBeenLastCalledWith({
                period: 'last7days',
                page: 1,
                limit: 20,
            }),
        );
        await page.handlePeriodChange('last30days');

        await vi.waitFor(() =>
            expect(fetchOwnInstructorRatings).toHaveBeenLastCalledWith({
                period: 'last30days',
                page: 1,
                limit: 20,
            }),
        );
        expect(page.period.value).toBe('last30days');
        expect(route.query).toEqual({});
        expect(replace).not.toHaveBeenCalled();
    });

    it('shows a retryable error and recovers on the next load', async () => {
        fetchOwnInstructorRatings
            .mockRejectedValueOnce(new Error('API unavailable'))
            .mockResolvedValueOnce(firstPagePayload);

        const { useMyReviewsPage } = await import('./useMyReviewsPage');
        const page = useMyReviewsPage();

        await vi.waitFor(() =>
            expect(page.errorMessage.value).toBe('API unavailable'),
        );
        expect(page.ratings.value).toEqual([]);

        await page.loadRatings();

        expect(page.errorMessage.value).toBeNull();
        expect(page.ratings.value).toHaveLength(1);
    });
});
