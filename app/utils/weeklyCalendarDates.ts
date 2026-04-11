import { CalendarDate } from '@internationalized/date';

export function formatDateOnly(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');

    return `${y}-${m}-${day}`;
}

export function getMonday(d: Date): Date {
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;

    return new Date(d.getFullYear(), d.getMonth(), d.getDate() + diff);
}

export function dateToCalendarDate(d: Date): CalendarDate {
    return new CalendarDate(d.getFullYear(), d.getMonth() + 1, d.getDate());
}

export function weekRangeFromMonday(monday: Date): {
    dateFrom: string;
    dateTo: string;
} {
    const start = new Date(
        monday.getFullYear(),
        monday.getMonth(),
        monday.getDate(),
    );
    const end = new Date(
        monday.getFullYear(),
        monday.getMonth(),
        monday.getDate() + 6,
    );

    return {
        dateFrom: formatDateOnly(start),
        dateTo: formatDateOnly(end),
    };
}

/**
 * Składa ISO 8601 w UTC dla slotu (backend oczekuje pełnego datetime).
 * `time` w formacie HH:mm (np. "09:00").
 */
export function buildSlotIsoUTC(date: string, time: string): string {
    const t = time.trim();

    return `${date.trim()}T${t}:00.000Z`;
}
