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
        eventActionMode?: 'navigate' | 'select';
        showInstructorSubtitle?: boolean;
        showInstructorCount?: boolean;
        scopeBadgeLabel?: string;
        compactChrome?: boolean;
        showScheduleCountBadge?: boolean;
        /** Zwija lekcje zaczynające się o tej samej porze w jeden blok. */
        groupSameStart?: boolean;
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
        eventActionMode: 'navigate',
        showInstructorSubtitle: true,
        showInstructorCount: true,
        scopeBadgeLabel: 'Wszyscy instruktorzy',
        compactChrome: false,
        showScheduleCountBadge: true,
        groupSameStart: false,
    },
);

const emit = defineEmits<{
    'update:weekStart': [value: Date];
    'lesson-selected': [lesson: ScheduleLessonItem];
    'block-selected': [lesson: ScheduleLessonItem];
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
        showInstructorSubtitle: props.showInstructorSubtitle,
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
    <UiCard
        :class="
            compactChrome
                ? 'overflow-visible rounded-none border-0 bg-transparent py-0 shadow-none'
                : 'overflow-hidden rounded-2xl shadow-sm'
        "
    >
        <UiCardContent
            :class="compactChrome ? 'space-y-3 p-0' : 'space-y-4 p-4'"
        >
            <WeekCalendarToolbar
                v-model:calendar-open="isCalendarOpen"
                :is-loading="displayLoading"
                :compact-week-range-label="compactWeekRangeLabel"
                :calendar-selected-model="calendarSelectedModel"
                :compact="compactChrome"
                :min-value="WEEK_PICKER_CALENDAR_MIN"
                :max-value="WEEK_PICKER_CALENDAR_MAX"
                aria-label="Nawigacja tygodnia harmonogramu lekcji"
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
                v-if="!compactChrome && showScheduleCountBadge"
                :schedule-count-badge-label="scheduleCountBadgeLabel"
                :display-items-count="displayItems.length"
            />

            <ManagerSchoolScheduleCalendarGrid
                :compact="compactChrome"
                :group-same-start="groupSameStart"
                :state="calendarGridState"
                :layout="calendarGridLayout"
                :block-actions="calendarBlockActions"
                @block-select="handleScheduleBlockClick"
                @block-keydown="handleScheduleBlockKeydown"
            />
        </UiCardContent>
    </UiCard>
</template>
