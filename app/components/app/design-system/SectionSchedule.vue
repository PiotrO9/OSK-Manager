<script setup lang="ts">
import type { ScheduleLessonItem } from '~/types/schedule/schedule';
import { buildDesignSystemScheduleItems } from '~/data/design-system/scheduleDemo';
import { getMonday } from '~/utils/date/weeklyCalendarDates';
import {
    displayPrimaryLine,
    isoToHm,
    isTheoryLessonType,
} from '~/utils/schedule/managerScheduleCalendarUtils';
import { isScheduleInstructorEvent } from '~/utils/schedule/scheduleInstructorEvent';

const weekStart = shallowRef(getMonday(new Date(2026, 8, 21)));
const scenario = shallowRef('data');
const selectedLesson = shallowRef<ScheduleLessonItem | null>(null);

const demoItems = computed(() =>
    buildDesignSystemScheduleItems(weekStart.value),
);
const displayedItems = computed(() =>
    scenario.value === 'data' ? demoItems.value : [],
);

watch(weekStart, () => {
    selectedLesson.value = null;
});

watch(scenario, () => {
    selectedLesson.value = null;
});

function selectLesson(lesson: ScheduleLessonItem): void {
    selectedLesson.value = lesson;
}
</script>

<template>
    <section class="space-y-4" aria-label="Wzorce harmonogramu">
        <div class="flex flex-wrap items-start justify-between gap-3">
            <div class="space-y-1">
                <p class="text-foreground text-sm font-semibold">
                    Tygodniowy harmonogram OSK
                </p>
                <p class="text-muted-foreground max-w-2xl text-sm">
                    Rzeczywisty komponent kalendarza na danych demonstracyjnych.
                    W poniedziałek o 09:00 trzy jazdy zaczynają się jednocześnie
                    — kliknij wspólny blok, aby zobaczyć szczegóły.
                </p>
            </div>
            <UiBadge variant="secondary">Przykład bez zapisu danych</UiBadge>
        </div>

        <DesignSystemScenarioControls
            v-model="scenario"
            label="Stan harmonogramu"
            :scenarios="['data', 'empty', 'loading', 'error']"
        />

        <ManagerSchoolScheduleCalendar
            v-model:week-start="weekStart"
            school-id="design-system-demo"
            parent-schedule
            :parent-items="displayedItems"
            :parent-loading="scenario === 'loading'"
            :parent-error="
                scenario === 'error'
                    ? 'Nie udało się pobrać harmonogramu.'
                    : null
            "
            event-edit-enabled
            event-action-mode="select"
            group-same-start
            @block-selected="selectLesson"
        />

        <div
            v-if="selectedLesson"
            class="border-border bg-muted/30 rounded-xl border px-4 py-3 text-sm"
            role="status"
        >
            <p class="text-foreground font-semibold">Wybrane zajęcia</p>
            <p class="text-muted-foreground mt-1">
                {{
                    isTheoryLessonType(selectedLesson.type)
                        ? 'Teoria'
                        : isScheduleInstructorEvent(selectedLesson)
                          ? 'Blok czasu'
                          : 'Jazda'
                }}
                · {{ isoToHm(selectedLesson.startTime) }}–{{
                    isoToHm(selectedLesson.endTime)
                }}
                · {{ displayPrimaryLine(selectedLesson, 'student') }}
            </p>
            <p class="text-muted-foreground mt-1 text-xs">
                W aplikacji wybór przenosi do edycji; tutaj pozostaje w
                demonstracji.
            </p>
        </div>
    </section>
</template>
