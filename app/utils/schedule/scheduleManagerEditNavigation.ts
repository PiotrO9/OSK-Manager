import { appPaths } from '~~/shared/routing/appPaths';
import type { ScheduleLessonItem } from '~/types/schedule/schedule';
import { isScheduleInstructorEvent } from '~/utils/schedule/scheduleInstructorEvent';
import { isScheduleBookedPracticalLesson } from '~/utils/schedule/scheduleBookedPracticalLesson';
import { isManagerLessonEditable } from '~/utils/lessons/managerLessonEditability';

export function isScheduleManagerItemEditable(
    eventEditEnabled: boolean,
    item: ScheduleLessonItem,
): boolean {
    if (!eventEditEnabled) {
        return false;
    }

    return (
        isScheduleInstructorEvent(item) ||
        (isScheduleBookedPracticalLesson(item) &&
            isManagerLessonEditable(item.status, item.endTime))
    );
}

export function buildScheduleManagerItemEditRoute(
    item: ScheduleLessonItem,
): { path: string } | null {
    if (
        isScheduleBookedPracticalLesson(item) &&
        isManagerLessonEditable(item.status, item.endTime)
    ) {
        return {
            path: appPaths.managerLessonEdit(item.id),
        };
    }

    if (isScheduleInstructorEvent(item)) {
        return {
            path: appPaths.managerEventEdit(item.id),
        };
    }

    return null;
}
