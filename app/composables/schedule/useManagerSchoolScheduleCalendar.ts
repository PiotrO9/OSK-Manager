import type { DateValue } from '@internationalized/date';
import type { ScheduleLessonItem } from '~/types/schedule/schedule';
import { useManagerSchoolScheduleCalendarData } from '~/composables/schedule/useManagerSchoolScheduleCalendarData';
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
    resolveManagerSchoolScheduleCalendarWeekStart,
    shiftManagerSchoolScheduleWeek,
} from '~/utils/schedule/managerSchoolScheduleCalendarWeek';
import { buildScheduleManagerItemEditRoute } from '~/utils/schedule/scheduleManagerEditNavigation';
import {
    getManagerSchoolScheduleBlockAccessibilityLabel,
    getManagerSchoolScheduleBlockInteractiveClasses,
    isManagerSchoolScheduleBlockClickable,
    isStudentRatingSelectableScheduleLesson,
} from '~/utils/schedule/managerSchoolScheduleCalendarInteractions';
import {
    getMonday,
    WEEK_PICKER_CALENDAR_MAX,
    WEEK_PICKER_CALENDAR_MIN,
    weekCalendarDatesFromMonday,
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
    const localWeekStart = ref<Date>(getMonday(new Date()));
    const isCalendarOpen = ref(false);
    const calendarSelected = shallowRef<DateValue[]>(
        weekCalendarDatesFromMonday(getMonday(new Date())),
    );
    const { errorMessage, internalItems, isLoading, loadWeek } =
        useManagerSchoolScheduleCalendarData({
            schoolId: () => props.schoolId,
            weekStart: localWeekStart,
            disabled: () => props.parentSchedule,
        });

    const calendarSelectedModel = computed<DateValue[]>(
        () => calendarSelected.value as unknown as DateValue[],
    );

    const activeWeekStart = computed(() => {
        if (props.parentSchedule && props.weekStart) {
            return getMonday(props.weekStart);
        }

        return localWeekStart.value;
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

    watch(
        activeWeekStart,
        (w) => {
            calendarSelected.value = weekCalendarDatesFromMonday(w);
        },
        { immediate: true },
    );

    function commitWeekMonday(monday: Date): void {
        const m = getMonday(monday);

        if (props.parentSchedule) {
            emit('update:weekStart', m);

            return;
        }

        localWeekStart.value = m;
    }

    function handlePrevWeek(): void {
        commitWeekMonday(
            shiftManagerSchoolScheduleWeek(activeWeekStart.value, 'prev'),
        );
    }

    function handleNextWeek(): void {
        commitWeekMonday(
            shiftManagerSchoolScheduleWeek(activeWeekStart.value, 'next'),
        );
    }

    function handleCalendarUpdate(
        value: DateValue | DateValue[] | undefined,
    ): void {
        const monday = resolveManagerSchoolScheduleCalendarWeekStart(value);

        if (!monday) {
            return;
        }

        commitWeekMonday(monday);
        isCalendarOpen.value = false;
    }

    function handleKeyDownWeekNav(
        event: KeyboardEvent,
        direction: 'prev' | 'next',
    ): void {
        if (event.key !== 'Enter' && event.key !== ' ') {
            return;
        }

        event.preventDefault();

        if (direction === 'prev') {
            handlePrevWeek();
        } else {
            handleNextWeek();
        }
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
