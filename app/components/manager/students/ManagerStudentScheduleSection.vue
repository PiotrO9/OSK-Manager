<script setup lang="ts">
import { CalendarDays } from 'lucide-vue-next';
import type { ScheduleLessonItem } from '~/types/schedule';

defineProps<{
    dateFrom: string;
    dateTo: string;
    weekStart: Date;
    items: readonly ScheduleLessonItem[];
    isLoading: boolean;
    error: string | null;
}>();

const emit = defineEmits<{
    prevWeek: [];
    nextWeek: [];
}>();

function formatShortDate(value: string): string {
    const d = new Date(value);

    if (Number.isNaN(d.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat('pl-PL', {
        day: '2-digit',
        month: '2-digit',
    }).format(d);
}

function formatScheduleWeekLabel(d: Date): string {
    return new Intl.DateTimeFormat('pl-PL', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(d);
}
</script>

<template>
    <section
        aria-labelledby="student-schedule-heading"
        class="border-border bg-card min-w-0 rounded-2xl border p-5 shadow-sm xl:col-span-2"
    >
        <div
            class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"
        >
            <div class="space-y-1">
                <h2
                    id="student-schedule-heading"
                    class="text-foreground text-xl font-extrabold"
                >
                    Terminarz lekcji
                </h2>
                <p class="text-muted-foreground text-sm">
                    Lekcje przypisane do kursanta w wybranym tygodniu.
                </p>
            </div>
            <UiBadge variant="outline" class="w-fit rounded-full px-3 py-1">
                <CalendarDays class="mr-1.5 size-3.5" aria-hidden="true" />
                {{ formatShortDate(dateFrom) }}
                -
                {{ formatShortDate(dateTo) }}
            </UiBadge>
        </div>
        <div
            class="mb-4 flex flex-wrap items-center gap-2"
            role="group"
            aria-label="Nawigacja tygodnia terminarza"
        >
            <UiButton
                type="button"
                variant="outline"
                size="sm"
                class="rounded-xl"
                aria-label="Poprzedni tydzien"
                @click="emit('prevWeek')"
            >
                Poprzedni
            </UiButton>
            <UiButton
                type="button"
                variant="outline"
                size="sm"
                class="rounded-xl"
                aria-label="Nastepny tydzien"
                @click="emit('nextWeek')"
            >
                Nastepny
            </UiButton>
            <span class="text-muted-foreground text-sm">
                Tydzien od
                {{ formatScheduleWeekLabel(weekStart) }}
            </span>
        </div>
        <p v-if="isLoading" class="text-muted-foreground text-sm" role="status">
            Wczytywanie lekcji...
        </p>
        <p v-else-if="error" class="text-destructive text-sm" role="alert">
            {{ error }}
        </p>
        <ManagerScheduleLessonTable v-else :items="items" />
    </section>
</template>
