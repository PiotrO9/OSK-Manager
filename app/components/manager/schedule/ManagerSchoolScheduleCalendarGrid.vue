<script setup lang="ts">
import type { ScheduleLessonItem } from '~/types/schedule/schedule';
import type {
    ManagerSchoolScheduleCalendarBlockActions,
    ManagerSchoolScheduleCalendarGridLayout,
    ManagerSchoolScheduleCalendarGridState,
} from '~/types/schedule/managerSchoolScheduleCalendarComponents';

defineProps<{
    blockActions: ManagerSchoolScheduleCalendarBlockActions;
    layout: ManagerSchoolScheduleCalendarGridLayout;
    state: ManagerSchoolScheduleCalendarGridState;
}>();

const emit = defineEmits<{
    blockKeydown: [event: KeyboardEvent, lesson: ScheduleLessonItem];
    blockSelect: [lesson: ScheduleLessonItem];
}>();

function emitBlockKeydown(
    event: KeyboardEvent,
    lesson: ScheduleLessonItem,
): void {
    emit('blockKeydown', event, lesson);
}
</script>

<template>
    <div class="border-border relative overflow-x-auto rounded-2xl border">
        <div class="sr-only" role="status">
            <span>Oś godzin: {{ state.baseHour }}:00–19:00</span>
            <span
                v-if="state.eventEditEnabled"
                class="text-foreground border-border border-l pl-2"
            >
                Blok czasu lub jazda praktyczna: kliknij lub Enter, aby
                edytować.
            </span>
            <span
                class="border-border flex flex-wrap items-center gap-2 border-l pl-2"
                aria-hidden="true"
            >
                <span class="inline-flex items-center gap-1">
                    <span
                        class="inline-block size-2.5 shrink-0 rounded-sm border border-emerald-600/80 bg-emerald-500/30"
                    />
                    <span>jazda</span>
                </span>
                <span class="inline-flex items-center gap-1">
                    <span
                        class="inline-block size-2.5 shrink-0 rounded-sm border border-violet-600/80 bg-violet-500/30"
                    />
                    <span>teoria</span>
                </span>
            </span>
            <UiBadge v-if="state.displayLoading" variant="secondary">
                Ładowanie…
            </UiBadge>
            <UiBadge v-else-if="!state.displayError" variant="outline">
                {{ state.scheduleCountBadgeLabel }}:
                {{ state.scheduleItemsCount }}
            </UiBadge>
        </div>

        <div class="relative min-w-[720px]">
            <div
                v-if="state.displayLoading"
                class="bg-background/80 absolute inset-0 z-10 flex items-center justify-center backdrop-blur-[1px]"
                role="status"
                aria-live="polite"
            >
                <div class="flex w-full max-w-md flex-col gap-2 p-4">
                    <UiSkeleton class="h-8 w-full" />
                    <UiSkeleton class="h-32 w-full" />
                    <UiSkeleton class="h-32 w-full" />
                </div>
            </div>

            <div
                class="flex"
                role="grid"
                :aria-label="`Harmonogram lekcji, ${state.weekRangeLabel}`"
            >
                <ManagerScheduleHourGutter
                    :hour-labels="layout.hourLabels"
                    :grid-height-px="layout.gridHeightPx"
                />

                <div class="grid min-w-0 flex-1 grid-cols-7">
                    <ManagerSchoolScheduleCalendarDayColumn
                        v-for="day in state.weekDays"
                        :key="day.dateStr"
                        :block-actions="blockActions"
                        :day="day"
                        :display-error="state.displayError"
                        :display-loading="state.displayLoading"
                        :empty-day-message="state.emptyDayMessage"
                        :grid-height-px="layout.gridHeightPx"
                        :lesson-block-height-px="layout.lessonBlockHeightPx"
                        :lesson-block-top-px="layout.lessonBlockTopPx"
                        :lessons="layout.lessonsForDate(day.dateStr)"
                        :practice-primary-line="state.practicePrimaryLine"
                        @block-select="emit('blockSelect', $event)"
                        @block-keydown="emitBlockKeydown"
                    />
                </div>
            </div>
        </div>
    </div>
</template>
