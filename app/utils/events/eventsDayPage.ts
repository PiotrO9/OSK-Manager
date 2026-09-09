import type { EventStatusCode } from '~/types/events/instructorEvent';
import type { ScheduleLessonItem } from '~/types/schedule/schedule';
import {
    INSTRUCTOR_EVENT_STATUS_LABELS,
    INSTRUCTOR_EVENT_STATUS_OPTIONS,
} from '~/utils/events/instructorEventStatusDisplay';

export type EventsDayStatusFilterOption = 'ALL' | EventStatusCode;

export const EVENTS_DAY_STATUS_FILTER_OPTIONS: readonly EventsDayStatusFilterOption[] =
    ['ALL', ...INSTRUCTOR_EVENT_STATUS_OPTIONS];

export function statusFilterLabel(opt: EventsDayStatusFilterOption): string {
    if (opt === 'ALL') {
        return 'Wszystkie';
    }

    return INSTRUCTOR_EVENT_STATUS_LABELS[opt];
}

export function statusFilterLabelForOption(opt: string): string {
    return statusFilterLabel(opt as EventsDayStatusFilterOption);
}

export function eventIsoToHm(iso: string): string {
    const d = new Date(iso);

    if (Number.isNaN(d.getTime())) {
        return iso;
    }

    return new Intl.DateTimeFormat('pl-PL', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    }).format(d);
}

export function displayEventsDayInstructorName(
    item: ScheduleLessonItem,
): string {
    const ins = item.instructor;

    if (!ins) {
        return '-';
    }

    return `${ins.firstName} ${ins.lastName}`.trim() || '-';
}

export function displayParticipantCount(item: ScheduleLessonItem): string {
    if (typeof item.participantCount === 'number') {
        const cap =
            typeof item.capacity === 'number' ? `/${item.capacity}` : '';

        return `${item.participantCount}${cap}`;
    }

    if (typeof item.capacity === 'number') {
        return `0/${item.capacity}`;
    }

    return '-';
}

export function displayEventPrimary(
    item: ScheduleLessonItem,
    isManager: boolean,
): string {
    const time = eventIsoToHm(item.startTime);
    const type = eventTypeLabel(item.type);

    if (!isManager) {
        return `${time} · ${type}`;
    }

    const instructor = displayEventsDayInstructorName(item);

    return instructor === '-'
        ? `${time} · ${type}`
        : `${time} · ${type} · ${instructor}`;
}

export function displayEventMeta(item: ScheduleLessonItem): string {
    const parts = [
        `${eventIsoToHm(item.startTime)}-${eventIsoToHm(item.endTime)}`,
        `${displayParticipantCount(item)} kursantów`,
    ];

    if (item.vehicle?.name || item.vehicle?.registrationNumber) {
        parts.push(
            [item.vehicle.name, item.vehicle.registrationNumber]
                .filter(Boolean)
                .join(' · '),
        );
    }

    return parts.join(' · ');
}

export function eventTypeBadgeClasses(type: string): string {
    const t = String(type).trim().toUpperCase();

    if (t === 'THEORY') {
        return 'border-warning-500/40 bg-warning-500/15 text-warning-800';
    }

    if (t === 'DRIVE' || t === 'PRACTICE') {
        return 'border-primary-500/40 bg-primary-500/15 text-primary-800';
    }

    return '';
}

export function eventTypeLabel(type: string): string {
    const t = String(type).trim().toUpperCase();

    if (t === 'THEORY') {
        return 'Teoria';
    }

    if (t === 'DRIVE' || t === 'PRACTICE') {
        return 'Jazda praktyczna';
    }

    return type;
}
