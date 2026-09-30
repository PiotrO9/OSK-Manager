import { beforeEach, describe, expect, it, vi } from 'vitest';
import { reactive, readonly, ref, shallowReadonly, shallowRef } from 'vue';

const fetchSchools = vi.fn();
const fetchInstructors = vi.fn();
const fetchManagerRatings = vi.fn();
const replace = vi.fn();
const route = reactive({
    path: '/manager/reviews',
    query: {} as Record<string, string | undefined>,
});

const schools = [
    { id: 'school-1', name: 'OSK Pierwsza', isDefault: true },
    { id: 'school-2', name: 'OSK Druga', isDefault: false },
];
const instructors = [
    {
        id: 'instructor-1',
        userId: 'user-1',
        firstName: 'Anna',
        lastName: 'Nowak',
    },
];
const ratingsPayload = {
    ratings: [{ id: 'rating-1' }],
    summary: { averageRating: 4.5, totalCount: 21 },
    pagination: { page: 1, limit: 20, totalPages: 2 },
};

function installGlobals() {
    vi.stubGlobal('ref', ref);
    vi.stubGlobal('shallowRef', shallowRef);
    vi.stubGlobal('readonly', readonly);
    vi.stubGlobal('shallowReadonly', shallowReadonly);
    vi.stubGlobal('onMounted', vi.fn());
    vi.stubGlobal('useRoute', () => route);
    vi.stubGlobal('useRouter', () => ({ replace }));
    vi.stubGlobal('useDrivingSchoolsApi', () => ({ fetchList: fetchSchools }));
    vi.stubGlobal('useInstructorsApi', () => ({ fetchList: fetchInstructors }));
    vi.stubGlobal('useLessonRatingsListApi', () => ({ fetchManagerRatings }));
    vi.stubGlobal('getApiFetchErrorMessage', (error: unknown) =>
        error instanceof Error ? error.message : 'Błąd',
    );
}

describe('useManagerReviewsPage', () => {
    beforeEach(() => {
        vi.resetModules();
        vi.unstubAllGlobals();
        vi.clearAllMocks();
        route.query = {
            schoolId: 'school-2',
            instructorId: 'instructor-1',
            period: 'last30days',
            page: '2',
        };
        fetchSchools.mockResolvedValue(schools);
        fetchInstructors.mockResolvedValue(instructors);
        fetchManagerRatings.mockResolvedValue(ratingsPayload);
        replace.mockResolvedValue(undefined);
        installGlobals();
    });

    it('ignores URL filters, uses defaults and removes legacy query parameters', async () => {
        const { useManagerReviewsPage } =
            await import('./useManagerReviewsPage');
        const page = useManagerReviewsPage();

        await page.initialize();

        expect(fetchInstructors).toHaveBeenCalledWith('school-1');
        expect(fetchManagerRatings).toHaveBeenCalledWith({
            schoolId: 'school-1',
            period: 'last7days',
            page: 1,
            limit: 20,
        });
        expect(page.activeSchoolId.value).toBe('school-1');
        expect(page.activeInstructorId.value).toBe('');
        expect(page.currentPage.value).toBe(1);
        expect(replace).toHaveBeenCalledOnce();
        expect(replace).toHaveBeenCalledWith({
            path: '/manager/reviews',
            query: {},
        });
    });

    it('resets instructor and page when the school changes', async () => {
        const { useManagerReviewsPage } =
            await import('./useManagerReviewsPage');
        const page = useManagerReviewsPage();

        await page.initialize();
        replace.mockClear();
        fetchManagerRatings.mockClear();
        fetchManagerRatings.mockResolvedValueOnce(ratingsPayload);
        await page.handleSchoolChange('school-2');

        expect(page.activeInstructorId.value).toBe('');
        expect(page.currentPage.value).toBe(1);
        expect(fetchManagerRatings).toHaveBeenLastCalledWith({
            schoolId: 'school-2',
            period: 'last7days',
            page: 1,
            limit: 20,
        });
        expect(replace).not.toHaveBeenCalled();
    });

    it('ignores a stale ratings response after filters change', async () => {
        const { useManagerReviewsPage } =
            await import('./useManagerReviewsPage');
        const page = useManagerReviewsPage();

        await page.initialize();
        let resolveOld!: (value: typeof ratingsPayload) => void;

        fetchManagerRatings.mockImplementationOnce(
            () =>
                new Promise((resolve) => {
                    resolveOld = resolve;
                }),
        );
        const oldRequest = page.loadRatings();

        fetchManagerRatings.mockResolvedValueOnce({
            ...ratingsPayload,
            ratings: [{ id: 'new-rating' }],
        });
        await page.handlePeriodChange('last30days');
        resolveOld({
            ...ratingsPayload,
            ratings: [{ id: 'old-rating' }],
        });
        await oldRequest;

        expect(page.ratings.value).toEqual([{ id: 'new-rating' }]);
    });

    it('clears the instructor and period filters while keeping the school', async () => {
        const { useManagerReviewsPage } =
            await import('./useManagerReviewsPage');
        const page = useManagerReviewsPage();

        await page.initialize();
        replace.mockClear();
        fetchManagerRatings.mockClear();
        fetchManagerRatings.mockResolvedValueOnce(ratingsPayload);
        await page.handleClearFilters();

        expect(page.activeSchoolId.value).toBe('school-1');
        expect(page.activeInstructorId.value).toBe('');
        expect(page.period.value).toBe('all');
        expect(page.currentPage.value).toBe(1);
        expect(fetchManagerRatings).toHaveBeenLastCalledWith({
            schoolId: 'school-1',
            period: 'all',
            page: 1,
            limit: 20,
        });
        expect(replace).not.toHaveBeenCalled();
    });

    it('keeps the URL unchanged when filters and pages change', async () => {
        const { useManagerReviewsPage } =
            await import('./useManagerReviewsPage');
        const page = useManagerReviewsPage();

        route.query = {};
        await page.initialize();
        replace.mockClear();

        await page.handleInstructorChange('instructor-1');
        await page.handlePeriodChange('last30days');
        await page.handlePageChange(2);

        expect(replace).not.toHaveBeenCalled();
        expect(route.query).toEqual({});
    });
});
