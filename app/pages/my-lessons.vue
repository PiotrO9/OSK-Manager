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
const { fetchStudentEvents } = useStudentEventsApi();

const weekStart = ref<Date>(getMonday(new Date()));
const items = ref<ScheduleLessonItem[]>([]);
const isLoading = ref(false);
const errorMessage = ref<string | null>(null);

const range = computed(() => weekRangeFromMonday(weekStart.value));

const isStudent = computed(
    () => session.value?.role?.trim().toUpperCase() === 'STUDENT',
);

const scheduleView = ref<'calendar' | 'list'>('calendar');

let loadSeq = 0;

async function loadWeek(): Promise<void> {
    const seq = ++loadSeq;

    errorMessage.value = null;
    isLoading.value = true;

    const { dateFrom, dateTo } = range.value;

    try {
        let data: ScheduleLessonItem[];

        if (isStudent.value) {
            const uid = session.value?.userId?.trim() ?? '';

            if (!uid) {
                if (seq !== loadSeq) {
                    return;
                }

                items.value = [];
                errorMessage.value = 'Brak identyfikatora użytkownika.';

                return;
            }

            data = await fetchStudentEvents(uid, { dateFrom, dateTo });
        } else {
            data = await fetchMySchedule(dateFrom, dateTo);
        }

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
                ? 'Nie udało się wczytać wydarzeń.'
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

function formatWeekLabel(d: Date): string {
    return new Intl.DateTimeFormat('pl-PL', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(d);
}
</script>

<template>
    <div class="space-y-6">
        <div class="space-y-1">
            <h1 class="text-foreground text-2xl font-semibold tracking-tight">
                Moje lekcje
            </h1>
            <p class="text-muted-foreground text-sm">
                <template v-if="isStudent">
                    Twoje wydarzenia w wybranym tygodniu.
                </template>
                <template v-else>
                    Zaplanowane lekcje w wybranym tygodniu (wg ustawień konta).
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
                ← Poprzedni
            </UiButton>
            <UiButton
                type="button"
                variant="outline"
                size="sm"
                aria-label="Następny tydzień"
                @click="handleNextWeek"
            >
                Następny →
            </UiButton>
            <span
                class="text-muted-foreground text-sm"
                :aria-label="`Wybrany tydzień od ${formatWeekLabel(weekStart)}`"
            >
                Tydzień od {{ formatWeekLabel(weekStart) }}
            </span>
        </div>

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
                :schedule-count-badge-label="isStudent ? 'Wydarzeń' : 'Lekcji'"
                :empty-day-message="isStudent ? 'Brak wydarzeń' : 'Brak lekcji'"
                :practice-primary-line="isStudent ? 'instructor' : 'student'"
            />
        </div>

        <div
            v-else
            id="my-schedule-list-panel"
            role="tabpanel"
            aria-labelledby="my-schedule-list-tab"
        >
            <p
                v-if="isLoading"
                class="text-muted-foreground text-sm"
                role="status"
            >
                Wczytywanie…
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
                :empty-message="
                    isStudent ? 'Brak wydarzeń w tym tygodniu.' : undefined
                "
            />
        </div>
    </div>
</template>
