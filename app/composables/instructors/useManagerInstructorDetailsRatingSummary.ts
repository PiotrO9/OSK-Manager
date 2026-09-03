import type { LessonRatingsSummary } from '~/types/lessons/lessonRating';
import { getManagerInstructorRouteString } from '~/utils/instructors/managerInstructorDetailsPage';

const emptyRatingSummary: LessonRatingsSummary = {
    averageRating: null,
    totalCount: 0,
};

export function useManagerInstructorDetailsRatingSummary() {
    const route = useRoute();
    const { fetchInstructorRatings } = useLessonRatingsListApi();

    const ratingSummary = ref<LessonRatingsSummary>({
        ...emptyRatingSummary,
    });
    const isRatingSummaryLoading = ref(false);

    async function loadRatingSummary(rawId: unknown): Promise<void> {
        const id = getManagerInstructorRouteString(rawId);
        const schoolId = getManagerInstructorRouteString(route.query.schoolId);

        ratingSummary.value = { ...emptyRatingSummary };

        if (!id || !schoolId) {
            return;
        }

        isRatingSummaryLoading.value = true;

        try {
            const payload = await fetchInstructorRatings(id, {
                schoolId,
                period: 'all',
                limit: 1,
            });

            ratingSummary.value = payload.summary;
        } catch {
            ratingSummary.value = { ...emptyRatingSummary };
        } finally {
            isRatingSummaryLoading.value = false;
        }
    }

    return {
        ratingSummary,
        isRatingSummaryLoading,
        loadRatingSummary,
    };
}
