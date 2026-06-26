<script setup lang="ts">
import {
    formatWeekLabel,
    type MyLessonsScheduleView,
} from '~/composables/lessons/useMyLessonsPage';
import type { ScheduleLessonItem } from '~/types/schedule/schedule';

defineProps<{
    cancellingLessonId: string | null;
    errorMessage: string | null;
    isLoading: boolean;
    isStudent: boolean;
    items: ScheduleLessonItem[];
    pageDescription: string;
}>();
defineEmits<{
    lessonSelected: [lesson: ScheduleLessonItem];
    nextWeek: [];
    previousWeek: [];
    requestCancelLesson: [lesson: ScheduleLessonItem];
}>();
const scheduleView = defineModel<MyLessonsScheduleView>('scheduleView', {
    required: true,
});
const weekStart = defineModel<Date>('weekStart', {
    required: true,
});
</script>

<template>
    <section
        class="border-border bg-background overflow-hidden rounded-xl border shadow-xs"
        aria-labelledby="my-lessons-panel-title"
    >
        <div
            class="border-border flex flex-col gap-4 border-b p-4 sm:flex-row sm:items-start sm:justify-between"
        >
            <div class="min-w-0">
                <h2
                    id="my-lessons-panel-title"
                    class="text-foreground text-lg font-bold"
                >
                    Moje lekcje
                </h2>
                <p class="text-muted-foreground mt-1 text-sm">
                    {{ pageDescription }}
                </p>
            </div>

            <div
                class="flex shrink-0 flex-wrap items-center gap-2"
                role="tablist"
                aria-label="Widok terminarza"
            >
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
                <UiButton
                    id="my-schedule-calendar-tab"
                    type="button"
                    size="sm"
                    role="tab"
                    :variant="
                        scheduleView === 'calendar' ? 'default' : 'outline'
                    "
                    :aria-selected="scheduleView === 'calendar'"
                    aria-controls="my-schedule-calendar-panel"
                    @click="scheduleView = 'calendar'"
                >
                    Kalendarz
                </UiButton>
            </div>
        </div>

        <div
            v-show="scheduleView === 'list'"
            class="border-border flex flex-wrap items-center gap-2 border-b px-4 py-3"
            role="group"
            aria-label="Nawigacja tygodnia"
        >
            <UiButton
                type="button"
                variant="outline"
                size="sm"
                aria-label="Poprzedni tydzien"
                @click="$emit('previousWeek')"
            >
                Poprzedni
            </UiButton>
            <UiButton
                type="button"
                variant="outline"
                size="sm"
                aria-label="Nastepny tydzien"
                @click="$emit('nextWeek')"
            >
                Nastepny
            </UiButton>
            <span
                class="text-muted-foreground text-sm"
                :aria-label="`Wybrany tydzien od ${formatWeekLabel(weekStart)}`"
            >
                Tydzien od {{ formatWeekLabel(weekStart) }}
            </span>
        </div>

        <div class="p-4">
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
                    :schedule-count-badge-label="
                        isStudent ? 'Pozycji' : 'Lekcji'
                    "
                    :empty-day-message="
                        isStudent ? 'Brak pozycji' : 'Brak lekcji'
                    "
                    :practice-primary-line="
                        isStudent ? 'instructor' : 'student'
                    "
                    @lesson-selected="$emit('lessonSelected', $event)"
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
                    @request-cancel-lesson="
                        $emit('requestCancelLesson', $event)
                    "
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
                        @request-cancel-lesson="
                            $emit('requestCancelLesson', $event)
                        "
                    />
                </template>
            </div>
        </div>
    </section>
</template>
