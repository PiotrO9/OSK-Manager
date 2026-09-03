import { getApiFetchErrorMessage } from '~/utils/api/apiFetchErrorMessage';
import {
    getMonday,
    weekRangeFromMonday,
} from '~/utils/date/weeklyCalendarDates';
import type { SummaryStripItem } from '~/components/app/ui/types';
import type { ScheduleLessonItem } from '~/types/schedule/schedule';
import { useMyLessonsCancellation } from './useMyLessonsCancellation';
import { useMyLessonsRatings } from './useMyLessonsRatings';

export type MyLessonsScheduleView = 'calendar' | 'list';

export function useMyLessonsPage() {
    const { session } = useAuthSession();
    const { fetchMySchedule } = useScheduleApi();

    const weekStart = ref<Date>(getMonday(new Date()));
    const items = ref<ScheduleLessonItem[]>([]);
    const isLoading = ref(false);
    const errorMessage = ref<string | null>(null);
    const scheduleView = ref<MyLessonsScheduleView>('list');

    const range = computed(() => weekRangeFromMonday(weekStart.value));

    const isStudent = computed(
        () => session.value?.role?.trim().toUpperCase() === 'STUDENT',
    );

    const pageDescription = computed(() =>
        isStudent.value
            ? 'Najbliższe jazdy, teoria i historia spotkań.'
            : 'Zaplanowane lekcje w wybranym tygodniu.',
    );

    const dateRangeLabel = computed(
        () =>
            `${formatCompactDate(range.value.dateFrom)} - ${formatCompactDate(range.value.dateTo)}`,
    );

    const todayItems = computed(() => {
        const todayKey = dateKeyFromDate(new Date());

        return items.value.filter(
            (item) => dateKeyFromIso(item.startTime) === todayKey,
        );
    });

    const attentionItems = computed(() =>
        items.value.filter((item) => {
            const status = item.status.trim().toUpperCase();

            if (
                status === 'CANCELLED' ||
                status === 'CANCELED' ||
                status === 'NO_SHOW'
            ) {
                return true;
            }

            return (
                item.kind === 'lesson' &&
                item.type.trim().toUpperCase() === 'PRACTICE' &&
                status === 'SCHEDULED' &&
                !item.vehicle
            );
        }),
    );

    const completedPracticeWithoutRating = computed(() =>
        isStudent.value
            ? items.value.filter(
                  (item) =>
                      item.kind === 'lesson' &&
                      item.type.trim().toUpperCase() === 'PRACTICE' &&
                      item.status.trim().toUpperCase() === 'COMPLETED' &&
                      !item.rating,
              )
            : [],
    );

    const summaryItems = computed<SummaryStripItem[]>(() => {
        const attentionCount = isStudent.value
            ? completedPracticeWithoutRating.value.length
            : attentionItems.value.length;

        return [
            {
                label: 'Pozycji w tygodniu',
                value: String(items.value.length),
                description: 'Lekcje i wydarzenia w zakresie',
                tone: 'info',
            },
            {
                label: 'Dzisiaj',
                value: String(todayItems.value.length),
                description: 'Zaplanowane na dzis',
                tone: 'neutral',
            },
            {
                label: isStudent.value ? 'Do oceny' : 'Wymagają uwagi',
                value: String(attentionCount),
                description: isStudent.value
                    ? 'Zakończone jazdy bez opinii'
                    : 'Anulowane lub bez pojazdu',
                tone: attentionCount > 0 ? 'warning' : 'success',
            },
        ];
    });

    let loadSeq = 0;

    const {
        handleRatingLessonSelected,
        handleRatingSubmit,
        isRatingRefreshing,
        isRatingSubmitting,
        ratingErrorMessage,
        selectedRatingLessonId,
    } = useMyLessonsRatings({
        isStudent,
        items,
    });

    const {
        cancellingLessonId,
        clearPendingCancelLesson,
        handleCancelDialogOpenChange,
        handleCancelLessonRequested,
        handleConfirmCancelLesson,
        isCancelDialogOpen,
        isCancelling,
        pendingCancelLessonLabel,
    } = useMyLessonsCancellation({
        isStudent,
        loadWeek,
    });

    async function loadWeek(): Promise<void> {
        const seq = ++loadSeq;

        errorMessage.value = null;
        isLoading.value = true;

        const { dateFrom, dateTo } = range.value;

        try {
            const data = await fetchMySchedule(dateFrom, dateTo);

            if (seq !== loadSeq) {
                return;
            }

            items.value = data;
        } catch (err: unknown) {
            if (seq !== loadSeq) {
                return;
            }

            items.value = [];
            errorMessage.value = getApiFetchErrorMessage(
                err,
                isStudent.value
                    ? 'Nie udało się wczytać terminarza.'
                    : 'Nie udało się wczytać lekcji.',
            );
        } finally {
            if (seq === loadSeq) {
                isLoading.value = false;
            }
        }
    }

    function handlePrevWeek(): void {
        const d = new Date(weekStart.value);

        d.setDate(d.getDate() - 7);
        weekStart.value = getMonday(d);
    }

    function handleNextWeek(): void {
        const d = new Date(weekStart.value);

        d.setDate(d.getDate() + 7);
        weekStart.value = getMonday(d);
    }

    watch(
        range,
        () => {
            void loadWeek();
        },
        { immediate: true },
    );

    watch(
        () => [session.value?.role, session.value?.userId] as const,
        () => {
            void loadWeek();
        },
    );

    return {
        cancellingLessonId,
        clearPendingCancelLesson,
        dateRangeLabel,
        errorMessage,
        handleCancelDialogOpenChange,
        handleCancelLessonRequested,
        handleConfirmCancelLesson,
        handleNextWeek,
        handlePrevWeek,
        handleRatingLessonSelected,
        handleRatingSubmit,
        isCancelDialogOpen,
        isCancelling,
        isLoading,
        isRatingRefreshing,
        isRatingSubmitting,
        isStudent,
        items,
        pageDescription,
        pendingCancelLessonLabel,
        ratingErrorMessage,
        scheduleView,
        selectedRatingLessonId,
        summaryItems,
        weekStart,
    };
}

function dateKeyFromDate(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function dateKeyFromIso(iso: string): string {
    const d = new Date(iso);

    if (Number.isNaN(d.getTime())) {
        return iso.slice(0, 10);
    }

    return dateKeyFromDate(d);
}

export function formatWeekLabel(d: Date): string {
    return new Intl.DateTimeFormat('pl-PL', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(d);
}

function formatCompactDate(iso: string): string {
    const d = new Date(`${iso}T00:00:00`);

    if (Number.isNaN(d.getTime())) {
        return iso;
    }

    return new Intl.DateTimeFormat('pl-PL', {
        day: 'numeric',
        month: 'long',
    }).format(d);
}
