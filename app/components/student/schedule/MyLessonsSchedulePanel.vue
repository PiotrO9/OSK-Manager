<script setup lang="ts">
import type { MyLessonsScheduleView } from '~/composables/lessons/useMyLessonsPage';
import type { ScheduleLessonItem } from '~/types/schedule/schedule';
import { formatManagerSchoolScheduleCompactWeekRangeLabel } from '~/utils/schedule/managerSchoolScheduleCalendarWeek';

defineProps<{
    cancellingLessonId: string | null;
    errorMessage: string | null;
    isLoading: boolean;
    isStudent: boolean;
    items: ScheduleLessonItem[];
    savingEventId?: string | null;
}>();
defineEmits<{
    lessonSelected: [lesson: ScheduleLessonItem];
    nextWeek: [];
    previousWeek: [];
    today: [];
    requestCancelLesson: [lesson: ScheduleLessonItem];
    eventStatusChange: [payload: { id: string; status: string }];
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
        aria-label="Harmonogram moich lekcji"
    >
        <div class="border-border flex justify-end border-b p-3">
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
            class="border-border grid items-center gap-2 border-b px-4 py-3 sm:grid-cols-[1fr_auto_1fr]"
            role="toolbar"
            aria-label="Nawigacja tygodnia harmonogramu"
        >
            <WeekCalendarRangeNavigation
                :is-loading="isLoading"
                :compact-week-range-label="
                    formatManagerSchoolScheduleCompactWeekRangeLabel(weekStart)
                "
                compact
                @previous="$emit('previousWeek')"
                @next="$emit('nextWeek')"
            />
            <UiButton
                type="button"
                variant="ghost"
                size="sm"
                class="justify-self-end sm:col-start-3"
                :disabled="isLoading"
                @click="$emit('today')"
            >
                Dzisiaj
            </UiButton>
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
                    group-same-start
                    :show-schedule-count-badge="false"
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

                <InstructorScheduleGroupedList
                    v-else
                    :items="items"
                    :is-loading="isLoading"
                    :error-message="errorMessage"
                    :saving-event-id="savingEventId"
                    @event-status-change="$emit('eventStatusChange', $event)"
                />
            </div>
        </div>
    </section>
</template>
