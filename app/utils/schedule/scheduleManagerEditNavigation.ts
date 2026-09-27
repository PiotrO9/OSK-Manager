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
    schoolId: string,
): { path: string; query?: { schoolId: string } } | null {
    const sid = schoolId.trim();
    const query = sid.length > 0 ? { schoolId: sid } : undefined;

    if (
        isScheduleBookedPracticalLesson(item) &&
        isManagerLessonEditable(item.status, item.endTime)
    ) {
        return {
            path: `/manager/lessons/${encodeURIComponent(item.id)}/edit`,
        };
    }

    if (isScheduleInstructorEvent(item)) {
        return {
            path: `/manager/events/${encodeURIComponent(item.id)}/edit`,
            ...(query ? { query } : {}),
        };
    }

    return null;
}
