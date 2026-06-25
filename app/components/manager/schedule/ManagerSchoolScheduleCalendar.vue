<script setup lang="ts">
import type { ScheduleLessonItem } from '~/types/schedule';
import { useManagerSchoolScheduleCalendar } from '~/composables/useManagerSchoolScheduleCalendar';

const props = withDefaults(
    defineProps<{
        schoolId: string;
        /** Klik w blok czasu lub jazd? praktyczn? -> edycja wydarzenia / lekcji */
        eventEditEnabled?: boolean;
        /**
         * Tryb osadzenia: dane i loading z rodzica (np. /my-lessons), bez GET harmonogramu szko?y.
         */
        parentSchedule?: boolean;
        parentItems?: ScheduleLessonItem[];
        parentLoading?: boolean;
        parentError?: string | null;
        /** Synchronizacja tygodnia z rodzicem (`v-model:week-start`). */
        weekStart?: Date;
        /** Etykieta licznika w pasku (np. "Wydarze?" / "Lekcji"). */
        scheduleCountBadgeLabel?: string;
        /** Komunikat w pustym dniu siatki. */
        emptyDayMessage?: string;
        /**
         * Dla jazdy praktycznej: pierwsza linia karty - kursant (domy?lnie) lub instruktor (np. widok kursanta).
         */
        practicePrimaryLine?: 'student' | 'instructor';
        studentRatingSelectionEnabled?: boolean;
    }>(),
    {
        eventEditEnabled: false,
        parentSchedule: false,
        parentItems: () => [],
        parentLoading: false,
        parentError: null,
        weekStart: undefined,
        scheduleCountBadgeLabel: 'Lekcji',
        emptyDayMessage: 'Brak lekcji',
        practicePrimaryLine: 'student',
        studentRatingSelectionEnabled: false,
    },
);

const emit = defineEmits<{
    'update:weekStart': [value: Date];
    'lesson-selected': [lesson: ScheduleLessonItem];
}>();

const {
    BASE_HOUR,
    GRID_HEIGHT_PX,
    WEEK_PICKER_CALENDAR_MAX,
    WEEK_PICKER_CALENDAR_MIN,
    blockAccessibilityLabel,
    blockIsClickable,
    calendarSelectedModel,
    compactWeekRangeLabel,
    displayError,
    displayItems,
    displayLoading,
    earliestStartLabel,
    handleCalendarUpdate,
    handleKeyDownWeekNav,
    handleNextWeek,
    handlePrevWeek,
    handleScheduleBlockClick,
    handleScheduleBlockKeydown,
    hourLabels,
    isCalendarOpen,
    lessonBlockHeightPx,
    lessonBlockInteractiveClasses,
    lessonBlockTopPx,
    lessonsForDate,
    loadWeek,
    scheduleInstructorCount,
    weekDays,
    weekRangeLabel,
} = useManagerSchoolScheduleCalendar(props, emit);

defineExpose({
    reloadWeek: loadWeek,
});
</script>

<template>
    <UiCard class="overflow-hidden rounded-2xl shadow-sm">
        <UiCardContent class="space-y-4 p-4">
            <ManagerScheduleWeekToolbar
                v-model:calendar-open="isCalendarOpen"
                :is-loading="displayLoading"
                :compact-week-range-label="compactWeekRangeLabel"
                :calendar-selected-model="calendarSelectedModel"
                :min-value="WEEK_PICKER_CALENDAR_MIN"
                :max-value="WEEK_PICKER_CALENDAR_MAX"
                @previous="handlePrevWeek"
                @next="handleNextWeek"
                @previous-keydown="handleKeyDownWeekNav($event, 'prev')"
                @next-keydown="handleKeyDownWeekNav($event, 'next')"
                @calendar-update="handleCalendarUpdate"
            />

            <p
                v-if="displayError"
                class="text-destructive text-sm"
                role="alert"
                aria-live="polite"
            >
                {{ displayError }}
            </p>

            <ManagerScheduleMetaBar
                :is-loading="displayLoading"
                :base-hour="BASE_HOUR"
                :schedule-count-badge-label="scheduleCountBadgeLabel"
                :display-items-count="displayItems.length"
                :schedule-instructor-count="scheduleInstructorCount"
                :earliest-start-label="earliestStartLabel"
            />

            <div
                class="border-border relative overflow-x-auto rounded-2xl border"
            >
                <div class="sr-only" role="status">
                    <span>Oś godzin: {{ BASE_HOUR }}:00–19:00</span>
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
                    <UiBadge v-if="displayLoading" variant="secondary"
                        >Ładowanie…</UiBadge
                    >
                    <UiBadge v-else-if="!displayError" variant="outline">
                        {{ scheduleCountBadgeLabel }}: {{ displayItems.length }}
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
                            :grid-height-px="GRID_HEIGHT_PX"
                        />

                        <div class="grid min-w-0 flex-1 grid-cols-7">
                            <div
                                v-for="day in weekDays"
                                :key="day.dateStr"
                                class="border-border flex min-w-0 flex-col border-r last:border-r-0"
                            >
                                <div
                                    class="border-border flex h-12 shrink-0 flex-col items-center justify-center border-b px-1 text-center"
                                    :class="
                                        day.isToday
                                            ? 'bg-primary/10 font-semibold'
                                            : ''
                                    "
                                >
                                    <span
                                        class="text-foreground text-xs font-medium capitalize"
                                    >
                                        {{ day.header }}
                                    </span>
                                    <UiBadge
                                        v-if="day.isToday"
                                        variant="secondary"
                                        class="mt-1"
                                    >
                                        dziś
                                    </UiBadge>
                                </div>

                                <div
                                    class="border-border relative border-b"
                                    :style="{ height: `${GRID_HEIGHT_PX}px` }"
                                >
                                    <div
                                        class="pointer-events-none absolute inset-0 flex flex-col"
                                        aria-hidden="true"
                                    >
                                        <div
                                            v-for="n in 12"
                                            :key="n"
                                            class="border-border/50 h-[60px] border-b border-dashed"
                                        />
                                    </div>

                                    <template
                                        v-for="lesson in lessonsForDate(
                                            day.dateStr,
                                        )"
                                        :key="lesson.id"
                                    >
                                        <ManagerScheduleLessonBlock
                                            :lesson="lesson"
                                            :top-px="
                                                lessonBlockTopPx(
                                                    lesson,
                                                    day.dateStr,
                                                )
                                            "
                                            :height-px="
                                                lessonBlockHeightPx(
                                                    lesson,
                                                    day.dateStr,
                                                )
                                            "
                                            :accessibility-label="
                                                blockAccessibilityLabel(lesson)
                                            "
                                            :interactive-classes="
                                                lessonBlockInteractiveClasses(
                                                    lesson,
                                                )
                                            "
                                            :is-clickable="
                                                blockIsClickable(lesson)
                                            "
                                            :practice-primary-line="
                                                practicePrimaryLine
                                            "
                                            @select="handleScheduleBlockClick"
                                            @keydown="
                                                handleScheduleBlockKeydown
                                            "
                                        />
                                    </template>

                                    <div
                                        v-if="
                                            lessonsForDate(day.dateStr)
                                                .length === 0 &&
                                            !displayLoading &&
                                            !displayError
                                        "
                                        class="text-muted-foreground absolute inset-0 flex items-center justify-center p-2 text-center text-xs"
                                    >
                                        {{ emptyDayMessage }}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </UiCardContent>
    </UiCard>
</template>
