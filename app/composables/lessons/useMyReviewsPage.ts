import type {
    LessonRatingListItem,
    LessonRatingsSummary,
} from '~/types/lessons/lessonRating';
import { getApiFetchErrorMessage } from '~/utils/api/apiFetchErrorMessage';
import type { MyReviewsPeriod } from '~/utils/lessons/myReviews';

const MY_REVIEWS_PAGE_SIZE = 20;

export function useMyReviewsPage() {
    const { fetchOwnInstructorRatings } = useLessonRatingsListApi();

    const ratings = ref<LessonRatingListItem[]>([]);
    const summary = ref<LessonRatingsSummary>({
        averageRating: null,
        totalCount: 0,
    });
    const period = shallowRef<MyReviewsPeriod>('all');
    const currentPage = shallowRef(1);
    const totalPages = shallowRef(1);
    const isLoading = shallowRef(false);
    const errorMessage = shallowRef<string | null>(null);
    let latestRequestId = 0;

    async function loadRatings(): Promise<void> {
        const requestId = ++latestRequestId;

        isLoading.value = true;
        errorMessage.value = null;

        try {
            const payload = await fetchOwnInstructorRatings({
                period: period.value,
                page: currentPage.value,
                limit: MY_REVIEWS_PAGE_SIZE,
            });

            if (requestId !== latestRequestId) return;

            if (
                payload.pagination.page > payload.pagination.totalPages &&
                payload.summary.totalCount > 0
            ) {
                currentPage.value = payload.pagination.totalPages;
                await loadRatings();

                return;
            }

            ratings.value = payload.ratings;
            summary.value = payload.summary;
            currentPage.value = payload.pagination.page;
            totalPages.value = payload.pagination.totalPages;
        } catch (err) {
            if (requestId !== latestRequestId) return;

            ratings.value = [];
            summary.value = { averageRating: null, totalCount: 0 };
            totalPages.value = 1;
            errorMessage.value = getApiFetchErrorMessage(
                err,
                'Nie udało się pobrać Twoich opinii.',
            );
        } finally {
            if (requestId === latestRequestId) {
                isLoading.value = false;
            }
        }
    }

    async function handlePeriodChange(nextPeriod: MyReviewsPeriod) {
        if (nextPeriod === period.value && currentPage.value === 1) return;

        period.value = nextPeriod;
        currentPage.value = 1;
        await loadRatings();
    }

    async function handlePageChange(nextPage: number) {
        if (
            nextPage === currentPage.value ||
            nextPage < 1 ||
            nextPage > totalPages.value
        ) {
            return;
        }

        currentPage.value = nextPage;
        await loadRatings();
    }

    onMounted(() => {
        void loadRatings();
    });

    return {
        ratings: readonly(ratings),
        summary: readonly(summary),
        period: readonly(period),
        currentPage: readonly(currentPage),
        totalPages: readonly(totalPages),
        isLoading: readonly(isLoading),
        errorMessage: readonly(errorMessage),
        loadRatings,
        handlePeriodChange,
        handlePageChange,
    };
}
