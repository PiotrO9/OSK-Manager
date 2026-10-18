import type { LessonRatingsSummary } from '~/types/lessons/lessonRating';
import { getManagerInstructorRouteString } from '~/utils/instructors/managerInstructorDetailsPage';

const emptyRatingSummary: LessonRatingsSummary = {
    averageRating: null,
    totalCount: 0,
};

export function useManagerInstructorDetailsRatingSummary() {
    const { fetchInstructorRatings } = useLessonRatingsListApi();

    const ratingSummary = ref<LessonRatingsSummary>({
        ...emptyRatingSummary,
    });
    const isRatingSummaryLoading = ref(false);
    let sequence = 0;

    async function loadRatingSummary(rawId: unknown): Promise<void> {
        const request = ++sequence;
        const id = getManagerInstructorRouteString(rawId);

        isRatingSummaryLoading.value = false;

        ratingSummary.value = { ...emptyRatingSummary };

        if (!id) {
            return;
        }

        isRatingSummaryLoading.value = true;

        try {
            const payload = await fetchInstructorRatings(id, {
                period: 'all',
                limit: 1,
            });

            if (request === sequence) ratingSummary.value = payload.summary;
        } catch {
            if (request !== sequence) return;

            ratingSummary.value = { ...emptyRatingSummary };
        } finally {
            if (request === sequence) isRatingSummaryLoading.value = false;
        }
    }

    return {
        ratingSummary,
        isRatingSummaryLoading,
        loadRatingSummary,
    };
}
