import type { ScheduleLessonItem } from '~/types/schedule';
import { isScheduleInstructorEvent } from '~/utils/scheduleInstructorEvent';

/**
 * Jazda praktyczna z kursantem w GET /schedule (`kind=lesson`, typ PRACTICE),
 * w przeciwieństwie do bloku `instructor_event` (bez rezerwacji kursanta).
 */
export function isScheduleBookedPracticalLesson(
    item: ScheduleLessonItem,
): boolean {
    if (item.type.trim().toUpperCase() !== 'PRACTICE') {
        return false;
    }

    const k = item.kind?.trim().toLowerCase();

    if (k === 'instructor_event') {
        return false;
    }

    if (k === 'lesson') {
        return true;
    }

    if (isScheduleInstructorEvent(item)) {
        return false;
    }

    return Boolean(item.student);
}
