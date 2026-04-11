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
    description: () => 'Terminarz zaplanowanych lekcji.',
});

const { fetchMySchedule } = useScheduleApi();

const weekStart = ref<Date>(getMonday(new Date()));
const items = ref<ScheduleLessonItem[]>([]);
const isLoading = ref(false);
const errorMessage = ref<string | null>(null);

const range = computed(() => weekRangeFromMonday(weekStart.value));

let loadSeq = 0;

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
            'Nie udało się wczytać lekcji.',
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
                Zaplanowane lekcje w wybranym tygodniu (wg ustawień konta).
            </p>
        </div>

        <div
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

        <p v-if="isLoading" class="text-muted-foreground text-sm" role="status">
            Wczytywanie…
        </p>
        <p
            v-else-if="errorMessage"
            class="text-destructive text-sm"
            role="alert"
        >
            {{ errorMessage }}
        </p>
        <ManagerScheduleLessonTable v-else :items="items" />
    </div>
</template>
