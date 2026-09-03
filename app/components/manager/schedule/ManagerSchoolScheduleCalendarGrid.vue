<script setup lang="ts">
import type { ScheduleLessonItem } from '~/types/schedule/schedule';
import type { ManagerSchoolScheduleWeekDay } from '~/utils/schedule/managerSchoolScheduleCalendarWeek';

defineProps<{
    baseHour: number;
    displayError: string | null;
    displayLoading: boolean;
    emptyDayMessage: string;
    eventEditEnabled: boolean;
    gridHeightPx: number;
    hourLabels: number[];
    lessonBlockHeightPx: (
        lesson: ScheduleLessonItem,
        dateStr: string,
    ) => number;
    lessonBlockInteractiveClasses: (lesson: ScheduleLessonItem) => string;
    lessonBlockTopPx: (lesson: ScheduleLessonItem, dateStr: string) => number;
    blockAccessibilityLabel: (lesson: ScheduleLessonItem) => string;
    blockIsClickable: (lesson: ScheduleLessonItem) => boolean;
    lessonsForDate: (dateStr: string) => ScheduleLessonItem[];
    practicePrimaryLine: 'student' | 'instructor';
    scheduleCountBadgeLabel: string;
    scheduleItemsCount: number;
    weekDays: ManagerSchoolScheduleWeekDay[];
    weekRangeLabel: string;
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
            <span>Oś godzin: {{ baseHour }}:00–19:00</span>
            <span
                v-if="eventEditEnabled"
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
            <UiBadge v-if="displayLoading" variant="secondary">
                Ładowanie…
            </UiBadge>
            <UiBadge v-else-if="!displayError" variant="outline">
                {{ scheduleCountBadgeLabel }}: {{ scheduleItemsCount }}
            </UiBadge>
        </div>

        <div class="relative min-w-[720px]">
            <div
                v-if="displayLoading"
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
                :aria-label="`Harmonogram lekcji, ${weekRangeLabel}`"
            >
                <ManagerScheduleHourGutter
                    :hour-labels="hourLabels"
                    :grid-height-px="gridHeightPx"
                />

                <div class="grid min-w-0 flex-1 grid-cols-7">
                    <ManagerSchoolScheduleCalendarDayColumn
                        v-for="day in weekDays"
                        :key="day.dateStr"
                        :block-accessibility-label="blockAccessibilityLabel"
                        :block-is-clickable="blockIsClickable"
                        :day="day"
                        :display-error="displayError"
                        :display-loading="displayLoading"
                        :empty-day-message="emptyDayMessage"
                        :grid-height-px="gridHeightPx"
                        :lesson-block-height-px="lessonBlockHeightPx"
                        :lesson-block-interactive-classes="
                            lessonBlockInteractiveClasses
                        "
                        :lesson-block-top-px="lessonBlockTopPx"
                        :lessons="lessonsForDate(day.dateStr)"
                        :practice-primary-line="practicePrimaryLine"
                        @block-select="emit('blockSelect', $event)"
                        @block-keydown="emitBlockKeydown"
                    />
                </div>
            </div>
        </div>
    </div>
</template>
