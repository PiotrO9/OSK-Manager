import type { ScheduleLessonItem } from '~/types/schedule/schedule';
import { ariaSummaryForLesson } from '~/utils/schedule/managerScheduleCalendarUtils';
import { isScheduleBookedPracticalLesson } from '~/utils/schedule/scheduleBookedPracticalLesson';
import { isScheduleInstructorEvent } from '~/utils/schedule/scheduleInstructorEvent';
import { isScheduleManagerItemEditable } from '~/utils/schedule/scheduleManagerEditNavigation';

export const SCHEDULE_BLOCK_INTERACTIVE_CLASSES =
    'cursor-pointer hover:brightness-[0.97] focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:outline-none dark:hover:brightness-[1.08]';

export interface ManagerSchoolScheduleBlockInteractionOptions {
    eventActionMode?: 'navigate' | 'select';
    eventEditEnabled: boolean | undefined;
    studentRatingSelectionEnabled: boolean | undefined;
    practicePrimaryLine: 'student' | 'instructor';
}

export function isStudentRatingSelectableScheduleLesson(
    lesson: ScheduleLessonItem,
    studentRatingSelectionEnabled: boolean | undefined,
): boolean {
    return (
        Boolean(studentRatingSelectionEnabled) &&
        lesson.kind === 'lesson' &&
        lesson.type.trim().toUpperCase() === 'PRACTICE' &&
        lesson.status.trim().toUpperCase() === 'COMPLETED'
    );
}

export function isManagerSchoolScheduleBlockClickable(
    lesson: ScheduleLessonItem,
    options: Pick<
        ManagerSchoolScheduleBlockInteractionOptions,
        'eventActionMode' | 'eventEditEnabled' | 'studentRatingSelectionEnabled'
    >,
): boolean {
    return (
        (options.eventActionMode === 'select' &&
            Boolean(options.eventEditEnabled) &&
            isScheduleBookedPracticalLesson(lesson)) ||
        isScheduleManagerItemEditable(
            Boolean(options.eventEditEnabled),
            lesson,
        ) ||
        isStudentRatingSelectableScheduleLesson(
            lesson,
            options.studentRatingSelectionEnabled,
        )
    );
}

export function getManagerSchoolScheduleBlockAccessibilityLabel(
    lesson: ScheduleLessonItem,
    options: ManagerSchoolScheduleBlockInteractionOptions,
): string {
    const base = ariaSummaryForLesson(lesson, options.practicePrimaryLine);

    if (
        isStudentRatingSelectableScheduleLesson(
            lesson,
            options.studentRatingSelectionEnabled,
        )
    ) {
        return `${base}. Naciśnij Enter lub Spację, aby otworzyć opinię.`;
    }

    if (!options.eventEditEnabled) {
        return base;
    }

    if (isScheduleInstructorEvent(lesson)) {
        if (options.eventActionMode === 'select') {
            return `${base}. Naciśnij Enter lub Spację, aby wybrać blok czasu.`;
        }

        return `${base}. Naciśnij Enter lub Spację, aby edytować blok czasu.`;
    }

    if (
        isScheduleBookedPracticalLesson(lesson) &&
        (options.eventActionMode === 'select' ||
            isScheduleManagerItemEditable(true, lesson))
    ) {
        if (options.eventActionMode === 'select') {
            return `${base}. Naciśnij Enter lub Spację, aby wybrać jazdę praktyczną.`;
        }

        return `${base}. Naciśnij Enter lub Spację, aby edytować jazdę praktyczną.`;
    }

    return base;
}

export function getManagerSchoolScheduleBlockInteractiveClasses(
    lesson: ScheduleLessonItem,
    options: Pick<
        ManagerSchoolScheduleBlockInteractionOptions,
        'eventActionMode' | 'eventEditEnabled' | 'studentRatingSelectionEnabled'
    >,
): string {
    if (!isManagerSchoolScheduleBlockClickable(lesson, options)) {
        return '';
    }

    return SCHEDULE_BLOCK_INTERACTIVE_CLASSES;
}
