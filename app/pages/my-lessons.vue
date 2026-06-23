<script setup lang="ts">
import { getMonday, weekRangeFromMonday } from '~/utils/weeklyCalendarDates';
import { getApiFetchErrorMessage } from '~/utils/apiFetchErrorMessage';
import type { ScheduleLessonItem } from '~/types/schedule';

definePageMeta({
    layout: 'app-shell',
    middleware: ['student-or-instructor'],
});

usePageMeta({
    title: () => 'Moje lekcje',
    description: () => 'Terminarz zaplanowanych lekcji i wydarzeń.',
});

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

const range = computed(() => weekRangeFromMonday(weekStart.value));

const isStudent = computed(
    () => session.value?.role?.trim().toUpperCase() === 'STUDENT',
);

const scheduleView = ref<'calendar' | 'list'>('calendar');
const cancellingLessonId = computed(() =>
    isCancelling.value ? (pendingCancelLesson.value?.id ?? null) : null,
);
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
                ? 'Nie udało się wczytać terminarza.'
                : 'Nie udało się wczytać lekcji.',
        );
    } finally {
        if (seq === loadSeq) {
            isLoading.value = false;
        }
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
            'Nie udało się odświeżyć opinii.',
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
            title: 'Opinia została dodana',
            variant: 'success',
        });
    } catch (err: unknown) {
        const message = getApiFetchErrorMessage(
            err,
            'Nie udało się dodać opinii.',
        );

        ratingErrorMessage.value = message;
        addToast({
            title: 'Nie udało się dodać opinii',
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
            'Nie udalo sie anulowac rezerwacji.',
        );

        addToast({
            title: 'Nie udalo sie anulowac rezerwacji',
            description: message,
            variant: 'error',
        });
    }
}

function formatWeekLabel(d: Date): string {
    return new Intl.DateTimeFormat('pl-PL', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
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
</script>

<template>
    <div class="flex flex-col gap-6">
        <div class="flex flex-col gap-1">
            <h1 class="text-foreground text-2xl font-semibold tracking-tight">
                Moje lekcje
            </h1>
            <p class="text-muted-foreground text-sm">
                <template v-if="isStudent">
                    Twoje lekcje i wydarzenia w wybranym tygodniu.
                </template>
                <template v-else>
                    Zaplanowane lekcje w wybranym tygodniu.
                </template>
            </p>
        </div>

        <div
            class="flex flex-wrap items-center gap-2"
            role="tablist"
            aria-label="Widok terminarza"
        >
            <UiButton
                id="my-schedule-calendar-tab"
                type="button"
                size="sm"
                role="tab"
                :variant="scheduleView === 'calendar' ? 'default' : 'outline'"
                :aria-selected="scheduleView === 'calendar'"
                aria-controls="my-schedule-calendar-panel"
                @click="scheduleView = 'calendar'"
            >
                Kalendarz
            </UiButton>
            <UiButton
                id="my-schedule-list-tab"
                type="button"
                size="sm"
                role="tab"
                :variant="scheduleView === 'list' ? 'default' : 'outline'"
                :aria-selected="scheduleView === 'list'"
                aria-controls="my-schedule-list-panel"
                @click="scheduleView = 'list'"
            >
                Lista
            </UiButton>
        </div>

        <div
            v-show="scheduleView === 'list'"
            class="flex flex-wrap items-center gap-2"
            role="group"
            aria-label="Nawigacja tygodnia"
        >
            <UiButton
                type="button"
                variant="outline"
                size="sm"
                aria-label="Poprzedni tydzień"
                @click="handlePrevWeek"
            >
                Poprzedni
            </UiButton>
            <UiButton
                type="button"
                variant="outline"
                size="sm"
                aria-label="Następny tydzień"
                @click="handleNextWeek"
            >
                Następny
            </UiButton>
            <span
                class="text-muted-foreground text-sm"
                :aria-label="`Wybrany tydzień od ${formatWeekLabel(weekStart)}`"
            >
                Tydzień od {{ formatWeekLabel(weekStart) }}
            </span>
        </div>

        <StudentLessonRatingsPanel
            v-if="isStudent"
            :items="items"
            :selected-lesson-id="selectedRatingLessonId"
            :is-refreshing="isRatingRefreshing"
            :is-submitting="isRatingSubmitting"
            :error-message="ratingErrorMessage"
            @select="handleRatingLessonSelected"
            @submit="handleRatingSubmit"
        />

        <div
            v-if="scheduleView === 'calendar'"
            id="my-schedule-calendar-panel"
            role="tabpanel"
            aria-labelledby="my-schedule-calendar-tab"
        >
            <ManagerSchoolScheduleCalendar
                v-model:week-start="weekStart"
                parent-schedule
                :school-id="''"
                :parent-items="items"
                :parent-loading="isLoading"
                :parent-error="errorMessage"
                :student-rating-selection-enabled="isStudent"
                :schedule-count-badge-label="isStudent ? 'Pozycji' : 'Lekcji'"
                :empty-day-message="isStudent ? 'Brak pozycji' : 'Brak lekcji'"
                :practice-primary-line="isStudent ? 'instructor' : 'student'"
                @lesson-selected="handleRatingLessonSelected"
            />
        </div>

        <div
            v-else
            id="my-schedule-list-panel"
            role="tabpanel"
            aria-labelledby="my-schedule-list-tab"
        >
            <StudentScheduleGroupedList
                v-if="isStudent"
                :items="items"
                :is-loading="isLoading"
                :error-message="errorMessage"
                :student-lesson-cancel-enabled="true"
                :cancelling-lesson-id="cancellingLessonId"
                @request-cancel-lesson="handleCancelLessonRequested"
            />

            <template v-else>
                <p
                    v-if="isLoading"
                    class="text-muted-foreground text-sm"
                    role="status"
                >
                    Wczytywanie...
                </p>
                <p
                    v-else-if="errorMessage"
                    class="text-destructive text-sm"
                    role="alert"
                >
                    {{ errorMessage }}
                </p>
                <ManagerScheduleLessonTable
                    v-else
                    :items="items"
                    :student-lesson-cancel-enabled="isStudent"
                    :cancelling-lesson-id="cancellingLessonId"
                    @request-cancel-lesson="handleCancelLessonRequested"
                />
            </template>
        </div>

        <UiDialog
            :open="isCancelDialogOpen"
            @update:open="handleCancelDialogOpenChange"
        >
            <UiDialogContent
                :show-close-button="false"
                aria-describedby="student-cancel-lesson-description"
            >
                <UiDialogHeader>
                    <UiDialogTitle>Anulowac rezerwacje?</UiDialogTitle>
                    <UiDialogDescription id="student-cancel-lesson-description">
                        Ta jazda zostanie oznaczona jako anulowana i zniknie z
                        Twojego aktywnego harmonogramu.
                        <span
                            v-if="pendingCancelLessonLabel"
                            class="text-foreground mt-2 block font-medium"
                        >
                            {{ pendingCancelLessonLabel }}
                        </span>
                    </UiDialogDescription>
                </UiDialogHeader>

                <UiDialogFooter>
                    <UiButton
                        type="button"
                        variant="outline"
                        :disabled="isCancelling"
                        @click="pendingCancelLesson = null"
                    >
                        Nie
                    </UiButton>
                    <UiButton
                        type="button"
                        variant="destructive"
                        :disabled="isCancelling"
                        :aria-busy="isCancelling"
                        @click="handleConfirmCancelLesson"
                    >
                        {{
                            isCancelling ? 'Anulowanie...' : 'Anuluj rezerwacje'
                        }}
                    </UiButton>
                </UiDialogFooter>
            </UiDialogContent>
        </UiDialog>
    </div>
</template>
