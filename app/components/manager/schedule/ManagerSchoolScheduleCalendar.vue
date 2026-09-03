<script setup lang="ts">
import type { ScheduleLessonItem } from '~/types/schedule/schedule';
import type {
    ManagerSchoolScheduleCalendarBlockActions,
    ManagerSchoolScheduleCalendarGridLayout,
    ManagerSchoolScheduleCalendarGridState,
} from '~/types/schedule/managerSchoolScheduleCalendarComponents';
import { useManagerSchoolScheduleCalendar } from '~/composables/schedule/useManagerSchoolScheduleCalendar';

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

const calendarGridState = computed<ManagerSchoolScheduleCalendarGridState>(
    () => ({
        baseHour: BASE_HOUR,
        displayError: displayError.value,
        displayLoading: displayLoading.value,
        emptyDayMessage: props.emptyDayMessage,
        eventEditEnabled: props.eventEditEnabled,
        practicePrimaryLine: props.practicePrimaryLine,
        scheduleCountBadgeLabel: props.scheduleCountBadgeLabel,
        scheduleItemsCount: displayItems.value.length,
        weekDays: weekDays.value,
        weekRangeLabel: weekRangeLabel.value,
    }),
);

const calendarGridLayout = computed<ManagerSchoolScheduleCalendarGridLayout>(
    () => ({
        gridHeightPx: GRID_HEIGHT_PX,
        hourLabels: hourLabels.value,
        lessonBlockHeightPx,
        lessonBlockTopPx,
        lessonsForDate,
    }),
);

const calendarBlockActions =
    computed<ManagerSchoolScheduleCalendarBlockActions>(() => ({
        blockAccessibilityLabel,
        blockIsClickable,
        lessonBlockInteractiveClasses,
    }));

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

            <ManagerSchoolScheduleCalendarGrid
                :state="calendarGridState"
                :layout="calendarGridLayout"
                :block-actions="calendarBlockActions"
                @block-select="handleScheduleBlockClick"
                @block-keydown="handleScheduleBlockKeydown"
            />
        </UiCardContent>
    </UiCard>
</template>
