import { getApiFetchErrorMessage } from '~/utils/api/apiFetchErrorMessage';
import {
    getMonday,
    weekRangeFromMonday,
} from '~/utils/date/weeklyCalendarDates';
import type { ScheduleLessonItem } from '~/types/schedule/schedule';
import { useMyLessonsCancellation } from './useMyLessonsCancellation';
import { useMyLessonsRatings } from './useMyLessonsRatings';
import { useMyLessonsEventStatus } from './useMyLessonsEventStatus';

export type MyLessonsScheduleView = 'calendar' | 'list';

export function useMyLessonsPage() {
    const { session } = useAuthSession();
    const { fetchMySchedule } = useScheduleApi();

    const weekStart = ref<Date>(getMonday(new Date()));
    const items = ref<ScheduleLessonItem[]>([]);
    const isLoading = ref(false);
    const errorMessage = ref<string | null>(null);
    const scheduleView = ref<MyLessonsScheduleView>('calendar');
    const { savingEventId, updateEventStatus } = useMyLessonsEventStatus(items);

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

    let loadSequence = 0;

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
        const requestSequence = ++loadSequence;

        errorMessage.value = null;
        isLoading.value = true;

        const { dateFrom, dateTo } = range.value;

        try {
            const data = await fetchMySchedule(dateFrom, dateTo);

            if (requestSequence !== loadSequence) {
                return;
            }

            items.value = data;
        } catch (err: unknown) {
            if (requestSequence !== loadSequence) {
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
            if (requestSequence === loadSequence) {
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

    function handleToday(): void {
        weekStart.value = getMonday(new Date());
    }

    function handleEventStatusChange(payload: {
        id: string;
        status: string;
    }): void {
        if (!isStudent.value) {
            void updateEventStatus(payload.id, payload.status);
        }
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
        handleToday,
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
        savingEventId,
        handleEventStatusChange,
        selectedRatingLessonId,
        weekStart,
    };
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
