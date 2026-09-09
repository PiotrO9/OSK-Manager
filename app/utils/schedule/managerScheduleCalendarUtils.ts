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
    const d = new Date(iso);

    if (Number.isNaN(d.getTime())) {
        return '00:00';
    }

    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export function isoToDateStr(iso: string): string {
    const d = new Date(iso);

    if (Number.isNaN(d.getTime())) {
        return '';
    }

    return formatDateOnly(d);
}

export function slotTopPx(startTimeHm: string): number {
    const parts = startTimeHm.trim().split(':').map(Number);

    if (parts.length < 2) {
        return 0;
    }

    const h = parts[0];
    const m = parts[1];

    if (
        h === undefined ||
        m === undefined ||
        !Number.isFinite(h) ||
        !Number.isFinite(m)
    ) {
        return 0;
    }

    const startMin = h * 60 + m;
    const baseMin = BASE_HOUR * 60;

    return (startMin - baseMin) * PX_PER_MINUTE;
}

export function isTheoryLessonType(type: string): boolean {
    return type.trim().toUpperCase() === 'THEORY';
}

export function lessonBlockClasses(type: string): string {
    const t = type.trim().toUpperCase();

    if (t === 'PRACTICE') {
        return 'border-primary-300 bg-primary-50 text-primary-950 shadow-primary-900/10 dark:border-primary-500/70 dark:bg-primary-50 dark:text-primary-950';
    }

    if (t === 'THEORY') {
        return 'border-warning-300 bg-warning-50 text-warning-950 shadow-warning-900/10 dark:border-warning-500/70 dark:bg-warning-50 dark:text-warning-950';
    }

    return 'border-secondary-300 bg-secondary-50 text-secondary-950 dark:border-secondary-400 dark:bg-secondary-50 dark:text-secondary-950';
}

export function displayStudent(item: ScheduleLessonItem): string {
    const s = item.student;

    if (!s) {
        return '-';
    }

    const name = `${s.firstName} ${s.lastName}`.trim();

    return name.length > 0 ? name : '-';
}

export function displayVehicle(item: ScheduleLessonItem): string {
    const v = item.vehicle;

    if (!v) {
        return '';
    }

    const n = v.name.trim();
    const r = v.registrationNumber.trim();

    if (n && r) {
        return `${n} (${r})`;
    }

    return n || r || '';
}

export function displayInstructorName(item: ScheduleLessonItem): string {
    const i = item.instructor;

    if (!i) {
        return '';
    }

    const name = `${i.firstName} ${i.lastName}`.trim();

    return name.length > 0 ? name : '';
}

export function displayTheoryPrimaryLine(item: ScheduleLessonItem): string {
    const list = item.students;

    if (list && list.length > 0) {
        const shown = list.slice(0, 2).map((s) => {
            const n = `${s.firstName} ${s.lastName}`.trim();

            return n.length > 0 ? n : '-';
        });
        const rest = list.length - shown.length;

        if (rest > 0) {
            return `${shown.join(', ')} +${rest}`;
        }

        return shown.join(', ');
    }

    const pc = item.participantCount;
    const cap = item.capacity;

    if (pc != null && cap != null && cap > 0) {
        return `${pc}/${cap} miejsc`;
    }

    if (pc != null && pc > 0) {
        return `${pc} uczestników`;
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
        const ins = displayInstructorName(item);

        if (ins.length > 0) {
            return ins;
        }
    }

    return displayStudent(item);
}

export function displayInstructorSubtitle(item: ScheduleLessonItem): string {
    const ins = displayInstructorName(item);

    if (ins) {
        return `Prowadzący: ${ins}`;
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
        const sub = displayInstructorSubtitle(item);
        const parts = ['Blok czasu', `status ${statusLabel}`, time, primary];

        if (sub) {
            parts.push(sub);
        }

        return parts.join(', ');
    }

    if (isTheoryLessonType(item.type)) {
        const primary = displayTheoryPrimaryLine(item);
        const sub = displayInstructorSubtitle(item);
        const parts = [`Lekcja teoretyczna`, time, primary];

        if (sub) {
            parts.push(sub);
        }

        return parts.join(', ');
    }

    const v = displayVehicle(item);
    const ins = displayInstructorName(item);
    const parts = [
        `Lekcja praktyczna`,
        time,
        `kursant ${displayStudent(item)}`,
    ];

    if (v) {
        parts.push(v);
    }

    if (ins) {
        parts.push(`instruktor ${ins}`);
    }

    return parts.join(', ');
}
