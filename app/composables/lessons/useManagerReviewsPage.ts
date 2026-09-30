import type { DrivingSchool } from '~/types/schools/drivingSchool';
import type { InstructorListItem } from '~/types/instructors/instructor';
import type {
    LessonRatingListItem,
    LessonRatingsSummary,
} from '~/types/lessons/lessonRating';
import { getApiFetchErrorMessage } from '~/utils/api/apiFetchErrorMessage';
import type { ManagerReviewsPeriod } from '~/utils/lessons/managerReviews';

const MANAGER_REVIEWS_PAGE_SIZE = 20;

export function useManagerReviewsPage() {
    const route = useRoute();
    const router = useRouter();
    const { fetchList: fetchSchools } = useDrivingSchoolsApi();
    const { fetchList: fetchInstructors } = useInstructorsApi();
    const { fetchManagerRatings } = useLessonRatingsListApi();

    const schools = ref<DrivingSchool[]>([]);
    const instructors = ref<InstructorListItem[]>([]);
    const ratings = ref<LessonRatingListItem[]>([]);
    const summary = ref<LessonRatingsSummary>({
        averageRating: null,
        totalCount: 0,
    });
    const activeSchoolId = shallowRef('');
    const activeInstructorId = shallowRef('');
    const period = shallowRef<ManagerReviewsPeriod>('last7days');
    const currentPage = shallowRef(1);
    const totalPages = shallowRef(1);
    const isSchoolsLoading = shallowRef(true);
    const isInstructorsLoading = shallowRef(false);
    const isRatingsLoading = shallowRef(false);
    const schoolsErrorMessage = shallowRef<string | null>(null);
    const instructorsErrorMessage = shallowRef<string | null>(null);
    const ratingsErrorMessage = shallowRef<string | null>(null);
    let latestInstructorsRequestId = 0;
    let latestRatingsRequestId = 0;

    function resolveInitialSchoolId(): string {
        return (
            schools.value.find((school) => school.isDefault)?.id ??
            schools.value[0]?.id ??
            ''
        );
    }

    async function removeLegacyFilterQuery(): Promise<void> {
        const filterKeys = ['schoolId', 'instructorId', 'period', 'page'];
        const hasLegacyFilters = filterKeys.some((key) => key in route.query);

        if (!hasLegacyFilters) return;

        const query = Object.fromEntries(
            Object.entries(route.query).filter(
                ([key]) => !filterKeys.includes(key),
            ),
        );

        await router.replace({ path: route.path, query });
    }

    async function loadSchools(): Promise<void> {
        isSchoolsLoading.value = true;
        schoolsErrorMessage.value = null;

        try {
            schools.value = await fetchSchools();
            activeSchoolId.value = resolveInitialSchoolId();
        } catch (error) {
            schools.value = [];
            activeSchoolId.value = '';
            schoolsErrorMessage.value = getApiFetchErrorMessage(
                error,
                'Nie udało się pobrać listy OSK.',
            );
        } finally {
            isSchoolsLoading.value = false;
        }
    }

    async function loadInstructors(): Promise<void> {
        const schoolId = activeSchoolId.value;
        const requestId = ++latestInstructorsRequestId;

        instructorsErrorMessage.value = null;

        if (!schoolId) {
            instructors.value = [];
            activeInstructorId.value = '';
            isInstructorsLoading.value = false;

            return;
        }

        isInstructorsLoading.value = true;

        try {
            const payload = await fetchInstructors(schoolId);

            if (requestId !== latestInstructorsRequestId) return;

            instructors.value = payload;

            if (
                !payload.some(
                    (instructor) => instructor.id === activeInstructorId.value,
                )
            ) {
                activeInstructorId.value = '';
            }
        } catch (error) {
            if (requestId !== latestInstructorsRequestId) return;

            instructors.value = [];
            activeInstructorId.value = '';
            instructorsErrorMessage.value = getApiFetchErrorMessage(
                error,
                'Nie udało się pobrać instruktorów tej OSK.',
            );
        } finally {
            if (requestId === latestInstructorsRequestId) {
                isInstructorsLoading.value = false;
            }
        }
    }

    async function loadRatings(): Promise<void> {
        const schoolId = activeSchoolId.value;
        const requestId = ++latestRatingsRequestId;

        ratingsErrorMessage.value = null;

        if (!schoolId) {
            ratings.value = [];
            summary.value = { averageRating: null, totalCount: 0 };
            currentPage.value = 1;
            totalPages.value = 1;
            isRatingsLoading.value = false;

            return;
        }

        isRatingsLoading.value = true;

        try {
            const payload = await fetchManagerRatings({
                schoolId,
                ...(activeInstructorId.value
                    ? { instructorId: activeInstructorId.value }
                    : {}),
                period: period.value,
                page: currentPage.value,
                limit: MANAGER_REVIEWS_PAGE_SIZE,
            });

            if (requestId !== latestRatingsRequestId) return;

            if (
                payload.summary.totalCount > 0 &&
                payload.pagination.page > payload.pagination.totalPages
            ) {
                currentPage.value = payload.pagination.totalPages;
                await loadRatings();

                return;
            }

            ratings.value = payload.ratings;
            summary.value = payload.summary;
            currentPage.value = payload.pagination.page;
            totalPages.value = payload.pagination.totalPages;
        } catch (error) {
            if (requestId !== latestRatingsRequestId) return;

            ratings.value = [];
            summary.value = { averageRating: null, totalCount: 0 };
            totalPages.value = 1;
            ratingsErrorMessage.value = getApiFetchErrorMessage(
                error,
                'Nie udało się pobrać opinii.',
            );
        } finally {
            if (requestId === latestRatingsRequestId) {
                isRatingsLoading.value = false;
            }
        }
    }

    async function initialize(): Promise<void> {
        await removeLegacyFilterQuery();
        await loadSchools();

        if (!activeSchoolId.value) return;

        await loadInstructors();
        await loadRatings();
    }

    async function handleSchoolChange(schoolId: string): Promise<void> {
        if (schoolId === activeSchoolId.value) return;

        activeSchoolId.value = schoolId;
        activeInstructorId.value = '';
        currentPage.value = 1;
        await Promise.all([loadInstructors(), loadRatings()]);
    }

    async function handleInstructorChange(instructorId: string): Promise<void> {
        if (instructorId === activeInstructorId.value) return;

        activeInstructorId.value = instructorId;
        currentPage.value = 1;
        await loadRatings();
    }

    async function handlePeriodChange(
        nextPeriod: ManagerReviewsPeriod,
    ): Promise<void> {
        if (nextPeriod === period.value && currentPage.value === 1) return;

        period.value = nextPeriod;
        currentPage.value = 1;
        await loadRatings();
    }

    async function handlePageChange(nextPage: number): Promise<void> {
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

    async function handleClearFilters(): Promise<void> {
        activeInstructorId.value = '';
        period.value = 'all';
        currentPage.value = 1;
        await loadRatings();
    }

    onMounted(() => {
        void initialize();
    });

    return {
        schools: shallowReadonly(schools),
        instructors: shallowReadonly(instructors),
        ratings: shallowReadonly(ratings),
        summary: shallowReadonly(summary),
        activeSchoolId: readonly(activeSchoolId),
        activeInstructorId: readonly(activeInstructorId),
        period: readonly(period),
        currentPage: readonly(currentPage),
        totalPages: readonly(totalPages),
        isSchoolsLoading: readonly(isSchoolsLoading),
        isInstructorsLoading: readonly(isInstructorsLoading),
        isRatingsLoading: readonly(isRatingsLoading),
        schoolsErrorMessage: readonly(schoolsErrorMessage),
        instructorsErrorMessage: readonly(instructorsErrorMessage),
        ratingsErrorMessage: readonly(ratingsErrorMessage),
        initialize,
        loadInstructors,
        loadRatings,
        handleSchoolChange,
        handleInstructorChange,
        handlePeriodChange,
        handlePageChange,
        handleClearFilters,
    };
}
