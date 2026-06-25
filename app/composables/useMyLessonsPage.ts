import { getApiFetchErrorMessage } from '~/utils/apiFetchErrorMessage';
import { getMonday, weekRangeFromMonday } from '~/utils/weeklyCalendarDates';
import type { SummaryStripItem } from '~/components/app/ui/types';
import type { ScheduleLessonItem } from '~/types/schedule';

export type MyLessonsScheduleView = 'calendar' | 'list';

export function useMyLessonsPage() {
    const { session } = useAuthSession();
    const { fetchMySchedule } = useScheduleApi();
    const { createLessonRating, fetchLessonRating } = useLessonRatingsApi();
    const { cancelOwnLesson, isCancelling } = useStudentLessonCancellationApi();
    const { addToast } = useAppToast();

    const weekStart = ref<Date>(getMonday(new Date()));
    const items = ref<ScheduleLessonItem[]>([]);
    const isLoading = ref(false);
    const errorMessage = ref<string | null>(null);
    const selectedRatingLessonId = ref<string | null>(null);
    const isRatingRefreshing = ref(false);
    const isRatingSubmitting = ref(false);
    const ratingErrorMessage = ref<string | null>(null);
    const pendingCancelLesson = ref<ScheduleLessonItem | null>(null);
    const scheduleView = ref<MyLessonsScheduleView>('list');

    const range = computed(() => weekRangeFromMonday(weekStart.value));

    const isStudent = computed(
        () => session.value?.role?.trim().toUpperCase() === 'STUDENT',
    );

    const cancellingLessonId = computed(() =>
        isCancelling.value ? (pendingCancelLesson.value?.id ?? null) : null,
    );

    const pageDescription = computed(() =>
        isStudent.value
            ? 'NajbliĹĽsze jazdy, teoria i historia spotkaĹ„.'
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
                label: isStudent.value ? 'Do oceny' : 'WymagajÄ… uwagi',
                value: String(attentionCount),
                description: isStudent.value
                    ? 'ZakoĹ„czone jazdy bez opinii'
                    : 'Anulowane lub bez pojazdu',
                tone: attentionCount > 0 ? 'warning' : 'success',
            },
        ];
    });

    const isCancelDialogOpen = computed({
        get: () => pendingCancelLesson.value !== null,
        set: (open: boolean) => {
            if (!open && !isCancelling.value) {
                pendingCancelLesson.value = null;
            }
        },
    });

    const pendingCancelLessonLabel = computed(() =>
        pendingCancelLesson.value
            ? formatLessonTimeRange(pendingCancelLesson.value)
            : '',
    );

    let loadSeq = 0;
    let ratingFetchSeq = 0;

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
                    ? 'Nie udaĹ‚o siÄ™ wczytaÄ‡ terminarza.'
                    : 'Nie udaĹ‚o siÄ™ wczytaÄ‡ lekcji.',
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

    async function handleRatingLessonSelected(
        lesson: ScheduleLessonItem,
    ): Promise<void> {
        selectedRatingLessonId.value = lesson.id;
        ratingErrorMessage.value = null;

        const seq = ++ratingFetchSeq;

        if (!isStudent.value || !isCompletedPracticeLesson(lesson)) {
            isRatingRefreshing.value = false;

            return;
        }

        isRatingRefreshing.value = true;

        try {
            const rating = await fetchLessonRating(lesson.id);

            if (seq !== ratingFetchSeq) {
                return;
            }

            items.value = items.value.map((item) =>
                item.id === lesson.id ? { ...item, rating } : item,
            );
        } catch (err: unknown) {
            if (seq !== ratingFetchSeq) {
                return;
            }

            ratingErrorMessage.value = getApiFetchErrorMessage(
                err,
                'Nie udaĹ‚o siÄ™ odĹ›wieĹĽyÄ‡ opinii.',
            );
        } finally {
            if (seq === ratingFetchSeq) {
                isRatingRefreshing.value = false;
            }
        }
    }

    async function handleRatingSubmit(payload: {
        lesson: ScheduleLessonItem;
        rating: number;
        comment: string | null;
    }): Promise<void> {
        if (isRatingSubmitting.value) {
            return;
        }

        isRatingSubmitting.value = true;
        ratingErrorMessage.value = null;

        try {
            const rating = await createLessonRating(payload.lesson.id, {
                rating: payload.rating,
                comment: payload.comment,
            });

            items.value = items.value.map((item) =>
                item.id === payload.lesson.id ? { ...item, rating } : item,
            );
            selectedRatingLessonId.value = payload.lesson.id;

            addToast({
                title: 'Opinia zostala dodana',
                variant: 'success',
            });
        } catch (err: unknown) {
            const message = getApiFetchErrorMessage(
                err,
                'Nie udaĹ‚o siÄ™ dodaÄ‡ opinii.',
            );

            ratingErrorMessage.value = message;
            addToast({
                title: 'Nie udaĹ‚o siÄ™ dodaÄ‡ opinii',
                description: message,
                variant: 'error',
            });
        } finally {
            isRatingSubmitting.value = false;
        }
    }

    function handleCancelLessonRequested(lesson: ScheduleLessonItem): void {
        if (!isStudent.value || !isScheduledPracticeLesson(lesson)) {
            return;
        }

        pendingCancelLesson.value = lesson;
    }

    function handleCancelDialogOpenChange(open: boolean): void {
        isCancelDialogOpen.value = open;
    }

    async function handleConfirmCancelLesson(): Promise<void> {
        const lesson = pendingCancelLesson.value;

        if (!lesson || isCancelling.value) {
            return;
        }

        try {
            await cancelOwnLesson(lesson.id);
            pendingCancelLesson.value = null;

            addToast({
                title: 'Rezerwacja zostala anulowana',
                variant: 'success',
            });

            await loadWeek();
        } catch (err: unknown) {
            const message = getApiFetchErrorMessage(
                err,
                'Nie udaĹ‚o siÄ™ anulowaÄ‡ rezerwacji.',
            );

            addToast({
                title: 'Nie udaĹ‚o siÄ™ anulowaÄ‡ rezerwacji',
                description: message,
                variant: 'error',
            });
        }
    }

    function clearPendingCancelLesson(): void {
        pendingCancelLesson.value = null;
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

function isCompletedPracticeLesson(lesson: ScheduleLessonItem): boolean {
    return (
        lesson.kind === 'lesson' &&
        lesson.type.trim().toUpperCase() === 'PRACTICE' &&
        lesson.status.trim().toUpperCase() === 'COMPLETED'
    );
}

function isScheduledPracticeLesson(lesson: ScheduleLessonItem): boolean {
    return (
        lesson.kind === 'lesson' &&
        lesson.type.trim().toUpperCase() === 'PRACTICE' &&
        lesson.status.trim().toUpperCase() === 'SCHEDULED'
    );
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

function formatIsoLocal(iso: string): string {
    const d = new Date(iso);

    if (Number.isNaN(d.getTime())) {
        return iso;
    }

    return new Intl.DateTimeFormat('pl-PL', {
        dateStyle: 'short',
        timeStyle: 'short',
    }).format(d);
}

function formatLessonTimeRange(lesson: ScheduleLessonItem): string {
    return `${formatIsoLocal(lesson.startTime)} - ${formatIsoLocal(lesson.endTime)}`;
}
