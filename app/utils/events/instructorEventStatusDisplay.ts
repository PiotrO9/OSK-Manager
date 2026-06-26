import type { EventStatusCode } from '~/types/events/instructorEvent';

const EVENT_STATUS_OPTIONS: readonly EventStatusCode[] = [
    'PLANNED',
    'DONE',
    'NO_SHOW',
    'CANCELLED',
] as const;

export const INSTRUCTOR_EVENT_STATUS_OPTIONS = EVENT_STATUS_OPTIONS;

export const INSTRUCTOR_EVENT_STATUS_LABELS: Record<EventStatusCode, string> = {
    PLANNED: 'Zaplanowane',
    DONE: 'Zrealizowane',
    NO_SHOW: 'Nie stawił się',
    CANCELLED: 'Anulowane',
};

export function normalizeInstructorEventStatus(
    raw: string | null | undefined,
): EventStatusCode {
    const t = String(raw ?? '')
        .trim()
        .toUpperCase();

    if (EVENT_STATUS_OPTIONS.includes(t as EventStatusCode)) {
        return t as EventStatusCode;
    }

    return 'PLANNED';
}

export function instructorEventStatusBadgeVariant(
    code: EventStatusCode,
): 'default' | 'secondary' | 'destructive' | 'outline' {
    if (code === 'PLANNED') {
        return 'secondary';
    }

    if (code === 'DONE') {
        return 'default';
    }

    if (code === 'NO_SHOW') {
        return 'outline';
    }

    return 'destructive';
}

export function labelForInstructorEventStatusRaw(
    raw: string | null | undefined,
): string {
    const code = normalizeInstructorEventStatus(raw);

    return INSTRUCTOR_EVENT_STATUS_LABELS[code];
}
