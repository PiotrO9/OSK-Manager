import type { ScheduleLessonItem } from '~/types/schedule/schedule';
import { labelForInstructorEventStatusRaw } from '~/utils/events/instructorEventStatusDisplay';
import { isScheduleInstructorEvent } from '~/utils/schedule/scheduleInstructorEvent';
import { formatDateOnly } from '~/utils/date/weeklyCalendarDates';

/** Oś czasu: 7:00-19:00 (12 h x 60 px). */
export const BASE_HOUR = 7;
export const GRID_HEIGHT_PX = 720;
export const PX_PER_MINUTE = 1;
/** Odstęp przed granicą następnego bloku w siatce. */
export const SLOT_END_GUTTER_PX = 1;
/** Odstęp między kafelkami, gdy w jednym przedziale startu jest kilka lekcji. */
export const SAME_START_TILE_GAP_PX = 2;

export function isoToHm(iso: string): string {
    const date = new Date(iso);

    if (Number.isNaN(date.getTime())) {
        return '00:00';
    }

    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

export function isoToDateStr(iso: string): string {
    const date = new Date(iso);

    if (Number.isNaN(date.getTime())) {
        return '';
    }

    return formatDateOnly(date);
}

export function slotTopPx(startTimeHm: string): number {
    const parts = startTimeHm.trim().split(':').map(Number);

    if (parts.length < 2) {
        return 0;
    }

    const hours = parts[0];
    const minutes = parts[1];

    if (
        hours === undefined ||
        minutes === undefined ||
        !Number.isFinite(hours) ||
        !Number.isFinite(minutes)
    ) {
        return 0;
    }

    const startMin = hours * 60 + minutes;
    const baseMin = BASE_HOUR * 60;

    return (startMin - baseMin) * PX_PER_MINUTE;
}

export function isTheoryLessonType(type: string): boolean {
    return type.trim().toUpperCase() === 'THEORY';
}

export function lessonBlockClasses(type: string): string {
    const normalizedType = type.trim().toUpperCase();

    if (normalizedType === 'PRACTICE') {
        return 'border-primary-300 bg-primary-50 text-primary-950 shadow-primary-900/10 dark:border-primary-500/70 dark:bg-primary-50 dark:text-primary-950';
    }

    if (normalizedType === 'THEORY') {
        return 'border-warning-300 bg-warning-50 text-warning-950 shadow-warning-900/10 dark:border-warning-500/70 dark:bg-warning-50 dark:text-warning-950';
    }

    return 'border-secondary-300 bg-secondary-50 text-secondary-950 dark:border-secondary-400 dark:bg-secondary-50 dark:text-secondary-950';
}

export function displayStudent(item: ScheduleLessonItem): string {
    const student = item.student;

    if (!student) {
        return '-';
    }

    const name = `${student.firstName} ${student.lastName}`.trim();

    return name.length > 0 ? name : '-';
}

export function displayVehicle(item: ScheduleLessonItem): string {
    const vehicle = item.vehicle;

    if (!vehicle) {
        return '';
    }

    const displayName = vehicle.name.trim();
    const registrationNumber = vehicle.registrationNumber.trim();

    const model =
        displayName.replace(/^pojazd\s+\d+\s*-\s*/i, '').trim() || displayName;

    if (model && registrationNumber) {
        return `${model} (${registrationNumber})`;
    }

    return model || registrationNumber;
}

export function displayInstructorName(item: ScheduleLessonItem): string {
    const instructor = item.instructor;

    if (!instructor) {
        return '';
    }

    const name = `${instructor.firstName} ${instructor.lastName}`.trim();

    return name.length > 0 ? name : '';
}

export function displayTheoryPrimaryLine(item: ScheduleLessonItem): string {
    const list = item.students;

    if (list && list.length > 0) {
        const shown = list.slice(0, 2).map((student) => {
            const displayName =
                `${student.firstName} ${student.lastName}`.trim();

            return displayName.length > 0 ? displayName : '-';
        });
        const rest = list.length - shown.length;

        if (rest > 0) {
            return `${shown.join(', ')} +${rest}`;
        }

        return shown.join(', ');
    }

    const participantCount = item.participantCount;
    const capacity = item.capacity;

    if (participantCount != null && capacity != null && capacity > 0) {
        return `${participantCount}/${capacity} miejsc`;
    }

    if (participantCount != null && participantCount > 0) {
        return `${participantCount} uczestników`;
    }

    return displayStudent(item);
}

export function displayPrimaryLine(
    item: ScheduleLessonItem,
    practicePrimaryLine: 'student' | 'instructor',
): string {
    if (isTheoryLessonType(item.type)) {
        return displayTheoryPrimaryLine(item);
    }

    if (practicePrimaryLine === 'instructor') {
        const instructorName = displayInstructorName(item);

        if (instructorName.length > 0) {
            return instructorName;
        }
    }

    return displayStudent(item);
}

export function displayInstructorSubtitle(item: ScheduleLessonItem): string {
    const instructorName = displayInstructorName(item);

    if (instructorName) {
        return `Prowadzący: ${instructorName}`;
    }

    return '';
}

export function lessonDurationMinutes(lesson: ScheduleLessonItem): number {
    const start = new Date(lesson.startTime).getTime();
    const end = new Date(lesson.endTime).getTime();

    if (Number.isNaN(start) || Number.isNaN(end) || end <= start) {
        return 60;
    }

    return Math.max(1, Math.round((end - start) / 60000));
}

export function ariaSummaryForLesson(
    item: ScheduleLessonItem,
    practicePrimaryLine: 'student' | 'instructor',
): string {
    const time = `${isoToHm(item.startTime)}-${isoToHm(item.endTime)}`;

    if (isScheduleInstructorEvent(item)) {
        const statusLabel = labelForInstructorEventStatusRaw(item.status);
        const primary = displayPrimaryLine(item, practicePrimaryLine);
        const subtitle = displayInstructorSubtitle(item);
        const parts = ['Blok czasu', `status ${statusLabel}`, time, primary];

        if (subtitle) {
            parts.push(subtitle);
        }

        return parts.join(', ');
    }

    if (isTheoryLessonType(item.type)) {
        const primary = displayTheoryPrimaryLine(item);
        const subtitle = displayInstructorSubtitle(item);
        const parts = [`Lekcja teoretyczna`, time, primary];

        if (subtitle) {
            parts.push(subtitle);
        }

        return parts.join(', ');
    }

    const vehicle = displayVehicle(item);
    const instructorName = displayInstructorName(item);
    const parts = [
        `Lekcja praktyczna`,
        time,
        `kursant ${displayStudent(item)}`,
    ];

    if (vehicle) {
        parts.push(vehicle);
    }

    if (instructorName) {
        parts.push(`instruktor ${instructorName}`);
    }

    return parts.join(', ');
}
