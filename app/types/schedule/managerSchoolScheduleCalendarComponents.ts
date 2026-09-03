import type { ScheduleLessonItem } from '~/types/schedule/schedule';
import type { ManagerSchoolScheduleWeekDay } from '~/utils/schedule/managerSchoolScheduleCalendarWeek';

export interface ManagerSchoolScheduleCalendarGridState {
    baseHour: number;
    displayError: string | null;
    displayLoading: boolean;
    emptyDayMessage: string;
    eventEditEnabled: boolean;
    practicePrimaryLine: 'student' | 'instructor';
    scheduleCountBadgeLabel: string;
    scheduleItemsCount: number;
    weekDays: ManagerSchoolScheduleWeekDay[];
    weekRangeLabel: string;
}

export interface ManagerSchoolScheduleCalendarGridLayout {
    gridHeightPx: number;
    hourLabels: number[];
    lessonBlockHeightPx: (
        lesson: ScheduleLessonItem,
        dateStr: string,
    ) => number;
    lessonBlockTopPx: (lesson: ScheduleLessonItem, dateStr: string) => number;
    lessonsForDate: (dateStr: string) => ScheduleLessonItem[];
}

export interface ManagerSchoolScheduleCalendarBlockActions {
    blockAccessibilityLabel: (lesson: ScheduleLessonItem) => string;
    blockIsClickable: (lesson: ScheduleLessonItem) => boolean;
    lessonBlockInteractiveClasses: (lesson: ScheduleLessonItem) => string;
}
