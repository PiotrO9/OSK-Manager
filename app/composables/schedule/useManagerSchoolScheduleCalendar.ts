import type { ScheduleLessonItem } from '~/types/schedule/schedule';
import { useManagerSchoolScheduleCalendarData } from '~/composables/schedule/useManagerSchoolScheduleCalendarData';
import { useManagerSchoolScheduleWeekPicker } from '~/composables/schedule/useManagerSchoolScheduleWeekPicker';
import {
    BASE_HOUR,
    GRID_HEIGHT_PX,
} from '~/utils/schedule/managerScheduleCalendarUtils';
import {
    buildScheduleItemsByDate,
    calculateSameStartTileHeightPx,
    calculateScheduleBlockTopPx,
    countScheduleInstructors,
    formatEarliestScheduleStartLabel,
} from '~/utils/schedule/managerSchoolScheduleCalendarLayout';
import {
    buildManagerSchoolScheduleWeekDays,
    formatManagerSchoolScheduleCompactWeekRangeLabel,
    formatManagerSchoolScheduleWeekRangeLabel,
} from '~/utils/schedule/managerSchoolScheduleCalendarWeek';
import { buildScheduleManagerItemEditRoute } from '~/utils/schedule/scheduleManagerEditNavigation';
import {
    getManagerSchoolScheduleBlockAccessibilityLabel,
    getManagerSchoolScheduleBlockInteractiveClasses,
    isManagerSchoolScheduleBlockClickable,
    isStudentRatingSelectableScheduleLesson,
} from '~/utils/schedule/managerSchoolScheduleCalendarInteractions';
import {
    WEEK_PICKER_CALENDAR_MAX,
    WEEK_PICKER_CALENDAR_MIN,
} from '~/utils/date/weeklyCalendarDates';

export interface ManagerSchoolScheduleCalendarProps {
    schoolId: string;
    eventEditEnabled?: boolean;
    parentSchedule?: boolean;
    parentItems?: ScheduleLessonItem[];
    parentLoading?: boolean;
    parentError?: string | null;
    weekStart?: Date;
    scheduleCountBadgeLabel?: string;
    emptyDayMessage?: string;
    practicePrimaryLine?: 'student' | 'instructor';
    studentRatingSelectionEnabled?: boolean;
}

type ManagerSchoolScheduleCalendarResolvedProps = Required<
    Omit<ManagerSchoolScheduleCalendarProps, 'weekStart'>
> & {
    weekStart?: Date;
};

interface ManagerSchoolScheduleCalendarEmit {
    'update:weekStart': [value: Date];
    'lesson-selected': [lesson: ScheduleLessonItem];
}

export function useManagerSchoolScheduleCalendar(
    props: Readonly<ManagerSchoolScheduleCalendarResolvedProps>,
    emit: <K extends keyof ManagerSchoolScheduleCalendarEmit>(
        event: K,
        ...args: ManagerSchoolScheduleCalendarEmit[K]
    ) => void,
) {
    const {
        activeWeekStart,
        calendarSelectedModel,
        handleCalendarUpdate,
        handleKeyDownWeekNav,
        handleNextWeek,
        handlePrevWeek,
        isCalendarOpen,
        localWeekStart,
    } = useManagerSchoolScheduleWeekPicker({
        isParentSchedule: () => props.parentSchedule,
        parentWeekStart: () => props.weekStart,
        updateParentWeekStart: (value) => emit('update:weekStart', value),
    });
    const { errorMessage, internalItems, isLoading, loadWeek } =
        useManagerSchoolScheduleCalendarData({
            schoolId: () => props.schoolId,
            weekStart: localWeekStart,
            disabled: () => props.parentSchedule,
        });

    const displayItems = computed((): ScheduleLessonItem[] =>
        props.parentSchedule ? props.parentItems : internalItems.value,
    );

    const displayLoading = computed(() =>
        props.parentSchedule ? props.parentLoading : isLoading.value,
    );

    const displayError = computed(() =>
        props.parentSchedule ? props.parentError : errorMessage.value,
    );

    const hourLabels = computed(() =>
        Array.from({ length: 12 }, (_, i) => BASE_HOUR + i),
    );

    const weekDays = computed(() =>
        buildManagerSchoolScheduleWeekDays(activeWeekStart.value),
    );

    const weekRangeLabel = computed(() =>
        formatManagerSchoolScheduleWeekRangeLabel(activeWeekStart.value),
    );

    const compactWeekRangeLabel = computed(() =>
        formatManagerSchoolScheduleCompactWeekRangeLabel(activeWeekStart.value),
    );

    const itemsByDate = computed(() =>
        buildScheduleItemsByDate(displayItems.value),
    );

    const scheduleInstructorCount = computed(() =>
        countScheduleInstructors(displayItems.value),
    );

    const earliestStartLabel = computed(() =>
        formatEarliestScheduleStartLabel(displayItems.value),
    );

    function lessonsForDate(dateStr: string): ScheduleLessonItem[] {
        return itemsByDate.value.get(dateStr) ?? [];
    }

    function lessonBlockTopPx(
        lesson: ScheduleLessonItem,
        dateStr: string,
    ): number {
        return calculateScheduleBlockTopPx(lesson, lessonsForDate(dateStr));
    }

    function lessonBlockHeightPx(
        lesson: ScheduleLessonItem,
        dateStr: string,
    ): number {
        return calculateSameStartTileHeightPx(lesson, lessonsForDate(dateStr));
    }

    function isStudentRatingSelectableLesson(
        lesson: ScheduleLessonItem,
    ): boolean {
        return isStudentRatingSelectableScheduleLesson(
            lesson,
            props.studentRatingSelectionEnabled,
        );
    }

    function blockIsClickable(lesson: ScheduleLessonItem): boolean {
        return isManagerSchoolScheduleBlockClickable(lesson, {
            eventEditEnabled: props.eventEditEnabled,
            studentRatingSelectionEnabled: props.studentRatingSelectionEnabled,
        });
    }

    function blockAccessibilityLabel(lesson: ScheduleLessonItem): string {
        return getManagerSchoolScheduleBlockAccessibilityLabel(lesson, {
            eventEditEnabled: props.eventEditEnabled,
            studentRatingSelectionEnabled: props.studentRatingSelectionEnabled,
            practicePrimaryLine: props.practicePrimaryLine,
        });
    }

    function lessonBlockInteractiveClasses(lesson: ScheduleLessonItem): string {
        return getManagerSchoolScheduleBlockInteractiveClasses(lesson, {
            eventEditEnabled: props.eventEditEnabled,
            studentRatingSelectionEnabled: props.studentRatingSelectionEnabled,
        });
    }

    function handleScheduleBlockClick(lesson: ScheduleLessonItem): void {
        if (!blockIsClickable(lesson)) {
            return;
        }

        if (isStudentRatingSelectableLesson(lesson)) {
            emit('lesson-selected', lesson);

            return;
        }

        const target = buildScheduleManagerItemEditRoute(
            lesson,
            props.schoolId,
        );

        if (!target) {
            return;
        }

        void navigateTo(target);
    }

    function handleScheduleBlockKeydown(
        e: KeyboardEvent,
        lesson: ScheduleLessonItem,
    ): void {
        if (!blockIsClickable(lesson)) {
            return;
        }

        if (e.key !== 'Enter' && e.key !== ' ') {
            return;
        }

        e.preventDefault();
        handleScheduleBlockClick(lesson);
    }

    return {
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
    };
}
