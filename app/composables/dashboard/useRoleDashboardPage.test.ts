import { beforeEach, describe, expect, it, vi } from 'vitest';
import { computed, readonly, ref, shallowRef } from 'vue';

const fetchMySchedule = vi.fn();
const fetchMyCourses = vi.fn();
const fetchMyPayments = vi.fn();
const fetchOwnInstructorRatings = vi.fn();

function installGlobals(): void {
    vi.stubGlobal('ref', ref);
    vi.stubGlobal('shallowRef', shallowRef);
    vi.stubGlobal('computed', computed);
    vi.stubGlobal('readonly', readonly);
    vi.stubGlobal('onMounted', () => {});
    vi.stubGlobal('useScheduleApi', () => ({ fetchMySchedule }));
    vi.stubGlobal('useCoursesApi', () => ({ fetchMyCourses }));
    vi.stubGlobal('usePaymentsApi', () => ({ fetchMyPayments }));
    vi.stubGlobal('useLessonRatingsListApi', () => ({
        fetchOwnInstructorRatings,
    }));
}

function ratingsPayload(averageRating: number | null, totalCount: number) {
    return {
        ratings: Array.from({ length: Math.min(totalCount, 20) }, (_, i) => ({
            id: `rating-${i}`,
            rating: 5,
        })),
        summary: { averageRating, totalCount },
        pagination: {
            page: 1,
            limit: 20,
            totalPages: Math.max(1, Math.ceil(totalCount / 20)),
        },
    };
}

describe('useRoleDashboardPage', () => {
    beforeEach(() => {
        vi.resetModules();
        vi.unstubAllGlobals();
        vi.resetAllMocks();
        installGlobals();
        fetchMySchedule.mockResolvedValue([]);
        fetchMyCourses.mockResolvedValue([]);
        fetchMyPayments.mockResolvedValue({ summary: {} });
    });

    it('shows the complete summary when the first page contains only 20 of 60 ratings', async () => {
        fetchOwnInstructorRatings.mockResolvedValue(ratingsPayload(3.2, 60));
        const { useRoleDashboardPage } = await import('./useRoleDashboardPage');
        const dashboard = useRoleDashboardPage(() => 'INSTRUCTOR');

        await dashboard.load();

        expect(fetchOwnInstructorRatings).toHaveBeenCalledTimes(1);
        expect(dashboard.averageRating.value).toBe(3.2);
        expect(dashboard.ratingsCount.value).toBe(60);
    });

    it('distinguishes an unloaded summary from a successful empty summary', async () => {
        fetchOwnInstructorRatings.mockResolvedValue(ratingsPayload(null, 0));
        const { useRoleDashboardPage } = await import('./useRoleDashboardPage');
        const dashboard = useRoleDashboardPage(() => 'INSTRUCTOR');

        expect(dashboard.isLoading.value).toBe(true);
        expect(dashboard.averageRating.value).toBeNull();
        expect(dashboard.ratingsCount.value).toBeNull();

        await dashboard.load();

        expect(dashboard.isLoading.value).toBe(false);
        expect(dashboard.averageRating.value).toBeNull();
        expect(dashboard.ratingsCount.value).toBe(0);
    });

    it('recovers after an initial error and keeps the last valid summary on refresh failure', async () => {
        fetchOwnInstructorRatings
            .mockRejectedValueOnce(new Error('API unavailable'))
            .mockResolvedValueOnce(ratingsPayload(4.25, 40))
            .mockRejectedValueOnce(new Error('API unavailable'));
        const { useRoleDashboardPage } = await import('./useRoleDashboardPage');
        const dashboard = useRoleDashboardPage(() => 'INSTRUCTOR');

        await dashboard.load();

        expect(dashboard.errorMessage.value).toBe('API unavailable');
        expect(dashboard.ratingsCount.value).toBeNull();

        await dashboard.load();

        expect(dashboard.errorMessage.value).toBeNull();
        expect(dashboard.averageRating.value).toBe(4.25);
        expect(dashboard.ratingsCount.value).toBe(40);

        await dashboard.load();

        expect(dashboard.errorMessage.value).toBe('API unavailable');
        expect(dashboard.averageRating.value).toBe(4.25);
        expect(dashboard.ratingsCount.value).toBe(40);
    });

    it('ignores a stale response after a newer load succeeds', async () => {
        let resolveFirst!: (value: ReturnType<typeof ratingsPayload>) => void;
        const firstResponse = new Promise<ReturnType<typeof ratingsPayload>>(
            (resolve) => {
                resolveFirst = resolve;
            },
        );

        fetchOwnInstructorRatings
            .mockReturnValueOnce(firstResponse)
            .mockResolvedValueOnce(ratingsPayload(3.2, 60));
        const { useRoleDashboardPage } = await import('./useRoleDashboardPage');
        const dashboard = useRoleDashboardPage(() => 'INSTRUCTOR');
        const firstLoad = dashboard.load();

        await dashboard.load();
        resolveFirst(ratingsPayload(5, 20));
        await firstLoad;

        expect(dashboard.averageRating.value).toBe(3.2);
        expect(dashboard.ratingsCount.value).toBe(60);
    });

    it('loads the student dashboard without requesting instructor ratings', async () => {
        const { useRoleDashboardPage } = await import('./useRoleDashboardPage');
        const dashboard = useRoleDashboardPage(() => 'STUDENT');

        await dashboard.load();

        expect(fetchOwnInstructorRatings).not.toHaveBeenCalled();
        expect(dashboard.errorMessage.value).toBeNull();
    });
});
