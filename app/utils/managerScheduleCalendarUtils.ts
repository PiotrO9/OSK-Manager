import type { ScheduleLessonItem } from '~/types/schedule';
import { labelForInstructorEventStatusRaw } from '~/utils/instructorEventStatusDisplay';
import { isScheduleInstructorEvent } from '~/utils/scheduleInstructorEvent';
import { formatDateOnly } from '~/utils/weeklyCalendarDates';

/** O? czasu: 7:00-19:00 (12 h x 60 px). */
export const BASE_HOUR = 7;
export const GRID_HEIGHT_PX = 720;
export const PX_PER_MINUTE = 1;
/** Odst?p przed granic? nast?pnego bloku w siatce. */
export const SLOT_END_GUTTER_PX = 1;
/** Odst?p mi?dzy kafelkami, gdy w jednym przedziale startu jest kilka lekcji. */
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
        return 'border-sky-400 bg-sky-50 text-sky-950 shadow-sky-900/10 dark:border-sky-500/70 dark:bg-sky-950/50 dark:text-sky-50';
    }

    if (t === 'THEORY') {
        return 'border-indigo-300 bg-indigo-50 text-indigo-950 shadow-indigo-900/10 dark:border-indigo-400/60 dark:bg-indigo-950/50 dark:text-indigo-50';
    }

    return 'border-amber-300 bg-amber-50 text-amber-950 dark:border-amber-500/70 dark:bg-amber-950/50 dark:text-amber-100';
}

export function displayStudent(item: ScheduleLessonItem): string {
    const s = item.student;

    if (!s) {
        return '?';
    }

    const name = `${s.firstName} ${s.lastName}`.trim();

    return name.length > 0 ? name : '?';
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

            return n.length > 0 ? n : '?';
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
        return `${pc} uczestnik?w`;
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
        return `Prowadz?cy: ${ins}`;
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
    const time = `${isoToHm(item.startTime)}?${isoToHm(item.endTime)}`;

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
