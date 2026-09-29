import type { CurrentUserCourseItem } from '~/types/courses/course';
import type { LessonRatingListItem } from '~/types/lessons/lessonRating';
import type { StudentPaymentsSummary } from '~/types/payments/payment';
import type { ScheduleLessonItem } from '~/types/schedule/schedule';
import { getMyCoursesFeaturedCourse } from '~/composables/courses/useMyCoursesPresentation';
import { getApiFetchErrorMessage } from '~/utils/api/apiFetchErrorMessage';

type DashboardRole = 'STUDENT' | 'INSTRUCTOR';

function formatDateKey(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        '0',
    )}-${String(date.getDate()).padStart(2, '0')}`;
}

function emptyPaymentsSummary(): StudentPaymentsSummary {
    return {
        paidAmount: '0.00',
        unpaidAmount: '0.00',
        overdueAmount: '0.00',
        overdueCount: 0,
        nextDueDate: null,
        currency: 'PLN',
    };
}

export function useRoleDashboardPage(role: () => DashboardRole) {
    const { fetchMySchedule } = useScheduleApi();
    const { fetchMyCourses } = useCoursesApi();
    const { fetchMyPayments } = usePaymentsApi();
    const { fetchOwnInstructorRatings } = useLessonRatingsListApi();
    const scheduleItems = ref<ScheduleLessonItem[]>([]);
    const courses = ref<CurrentUserCourseItem[]>([]);
    const paymentSummary = ref<StudentPaymentsSummary>(emptyPaymentsSummary());
    const ratings = ref<LessonRatingListItem[]>([]);
    const isLoading = shallowRef(true);
    const errorMessage = shallowRef<string | null>(null);
    let loadSequence = 0;

    const upcomingItems = computed(() => {
        const now = Date.now();

        return scheduleItems.value
            .filter((item) => {
                const status = item.status.trim().toUpperCase();
                const start = new Date(item.startTime).getTime();

                return (
                    Number.isFinite(start) &&
                    start >= now &&
                    status !== 'CANCELLED' &&
                    status !== 'CANCELED'
                );
            })
            .sort((a, b) => a.startTime.localeCompare(b.startTime));
    });
    const nextItem = computed(() => upcomingItems.value[0] ?? null);
    const todayItems = computed(() => {
        const today = formatDateKey(new Date());

        return scheduleItems.value.filter(
            (item) => formatDateKey(new Date(item.startTime)) === today,
        );
    });
    const featuredCourse = computed(() =>
        getMyCoursesFeaturedCourse(courses.value),
    );
    const averageRating = computed(() => {
        if (ratings.value.length === 0) return null;

        return (
            ratings.value.reduce((sum, item) => sum + item.rating, 0) /
            ratings.value.length
        );
    });

    async function load(): Promise<void> {
        const sequence = ++loadSequence;
        const currentRole = role();
        const dateFrom = formatDateKey(new Date());
        const end = new Date();

        end.setDate(end.getDate() + 13);
        isLoading.value = true;
        errorMessage.value = null;

        const failures: string[] = [];
        const schedulePromise = fetchMySchedule(dateFrom, formatDateKey(end))
            .then((items) => {
                if (sequence === loadSequence) scheduleItems.value = items;
            })
            .catch((error: unknown) => {
                failures.push(
                    getApiFetchErrorMessage(
                        error,
                        'Nie udało się pobrać najbliższych zajęć.',
                    ),
                );
            });
        const rolePromises: Promise<void>[] = [];

        if (currentRole === 'STUDENT') {
            rolePromises.push(
                fetchMyCourses()
                    .then((items) => {
                        if (sequence === loadSequence) courses.value = items;
                    })
                    .catch((error: unknown) => {
                        failures.push(
                            getApiFetchErrorMessage(
                                error,
                                'Nie udało się pobrać postępu kursu.',
                            ),
                        );
                    }),
                fetchMyPayments()
                    .then((payload) => {
                        if (sequence === loadSequence) {
                            paymentSummary.value = payload.summary;
                        }
                    })
                    .catch((error: unknown) => {
                        failures.push(
                            getApiFetchErrorMessage(
                                error,
                                'Nie udało się pobrać rozliczeń.',
                            ),
                        );
                    }),
            );
        } else {
            rolePromises.push(
                fetchOwnInstructorRatings()
                    .then((payload) => {
                        if (sequence === loadSequence) {
                            ratings.value = payload.ratings;
                        }
                    })
                    .catch((error: unknown) => {
                        failures.push(
                            getApiFetchErrorMessage(
                                error,
                                'Nie udało się pobrać opinii.',
                            ),
                        );
                    }),
            );
        }

        await Promise.all([schedulePromise, ...rolePromises]);

        if (sequence !== loadSequence) return;

        errorMessage.value = failures[0] ?? null;
        isLoading.value = false;
    }

    onMounted(() => {
        void load();
    });

    return {
        averageRating,
        errorMessage: readonly(errorMessage),
        featuredCourse,
        isLoading: readonly(isLoading),
        load,
        nextItem,
        paymentSummary: computed(() => paymentSummary.value),
        ratings: readonly(ratings),
        scheduleItems: readonly(scheduleItems),
        todayItems,
        upcomingItems,
    };
}
