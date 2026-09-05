import type { StatusTone } from '~/components/app/ui/types';
import type {
    ScheduleLessonItem,
    SchedulePersonRef,
} from '~/types/schedule/schedule';

export interface StudentScheduleDayGroup {
    date: string;
    label: string;
    items: ScheduleLessonItem[];
}

export function getStudentScheduleDateKeyFromIso(iso: string): string {
    const d = new Date(iso);

    if (Number.isNaN(d.getTime())) {
        return iso.slice(0, 10);
    }

    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function formatStudentScheduleDateLabel(dateKey: string): string {
    const d = new Date(`${dateKey}T00:00:00`);

    if (Number.isNaN(d.getTime())) {
        return dateKey;
    }

    return new Intl.DateTimeFormat('pl-PL', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
    }).format(d);
}

export function formatStudentScheduleTime(iso: string): string {
    const d = new Date(iso);

    if (Number.isNaN(d.getTime())) {
        return iso;
    }

    return new Intl.DateTimeFormat('pl-PL', {
        hour: '2-digit',
        minute: '2-digit',
    }).format(d);
}

export function displayStudentScheduleTimeRange(
    item: ScheduleLessonItem,
): string {
    return `${formatStudentScheduleTime(item.startTime)} - ${formatStudentScheduleTime(item.endTime)}`;
}

export function isStudentScheduleTheoryItem(item: ScheduleLessonItem): boolean {
    return item.type.trim().toUpperCase() === 'THEORY';
}

export function isStudentSchedulePracticeItem(
    item: ScheduleLessonItem,
): boolean {
    return item.type.trim().toUpperCase() === 'PRACTICE';
}

export function getStudentScheduleEventTypeLabel(
    item: ScheduleLessonItem,
): string {
    if (isStudentScheduleTheoryItem(item)) {
        return 'Teoria';
    }

    if (isStudentSchedulePracticeItem(item)) {
        return 'Jazda praktyczna';
    }

    return item.type;
}

export function getStudentScheduleStatusLabel(raw: string): string {
    const normalized = raw.trim().toUpperCase();

    if (normalized === 'SCHEDULED' || normalized === 'PLANNED') {
        return 'Plan';
    }

    if (normalized === 'COMPLETED' || normalized === 'DONE') {
        return 'Zakończone';
    }

    if (normalized === 'CANCELLED' || normalized === 'CANCELED') {
        return 'Anulowane';
    }

    if (normalized === 'NO_SHOW') {
        return 'Nieobecnosc';
    }

    return raw;
}

export function getStudentScheduleStatusTone(raw: string): StatusTone {
    const normalized = raw.trim().toUpperCase();

    if (normalized === 'SCHEDULED' || normalized === 'PLANNED') {
        return 'info';
    }

    if (normalized === 'COMPLETED' || normalized === 'DONE') {
        return 'success';
    }

    if (normalized === 'CANCELLED' || normalized === 'CANCELED') {
        return 'danger';
    }

    if (normalized === 'NO_SHOW') {
        return 'warning';
    }

    return 'neutral';
}

export function displayStudentSchedulePerson(
    person: SchedulePersonRef | undefined,
): string {
    if (!person) {
        return '';
    }

    return `${person.firstName} ${person.lastName}`.trim();
}

export function getStudentScheduleItemTitle(item: ScheduleLessonItem): string {
    const person = displayStudentSchedulePerson(item.instructor);

    if (person) {
        return `${getStudentScheduleEventTypeLabel(item)} - ${person}`;
    }

    return getStudentScheduleEventTypeLabel(item);
}

export function getStudentScheduleItemDescription(
    item: ScheduleLessonItem,
): string {
    const parts: string[] = [];

    if (item.vehicle && isStudentSchedulePracticeItem(item)) {
        const name = item.vehicle.name.trim();
        const reg = item.vehicle.registrationNumber.trim();
        const vehicle = name && reg ? `${name} (${reg})` : name || reg;

        if (vehicle) {
            parts.push(vehicle);
        }
    } else if (
        isStudentScheduleTheoryItem(item) &&
        item.participantCount != null
    ) {
        parts.push(`${item.participantCount} uczestnikow`);
    } else {
        parts.push('Sala lub pojazd przypisany');
    }

    return parts.join(' - ');
}

export function isStudentScheduleCancellableLesson(params: {
    item: ScheduleLessonItem;
    studentLessonCancelEnabled: boolean;
}): boolean {
    return (
        params.studentLessonCancelEnabled &&
        params.item.kind === 'lesson' &&
        isStudentSchedulePracticeItem(params.item) &&
        params.item.status.trim().toUpperCase() === 'SCHEDULED'
    );
}

export function buildStudentScheduleDayGroups(
    items: readonly ScheduleLessonItem[],
): StudentScheduleDayGroup[] {
    const map = new Map<string, ScheduleLessonItem[]>();

    for (const item of items) {
        const dateKey = getStudentScheduleDateKeyFromIso(item.startTime);
        const groupItems = map.get(dateKey) ?? [];

        groupItems.push(item);
        map.set(dateKey, groupItems);
    }

    return [...map.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, groupItems]) => ({
            date,
            label: formatStudentScheduleDateLabel(date),
            items: [...groupItems].sort((a, b) =>
                a.startTime.localeCompare(b.startTime),
            ),
        }));
}
