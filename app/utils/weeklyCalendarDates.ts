import type { DateValue } from '@internationalized/date';
import { CalendarDate, parseDate } from '@internationalized/date';
import { toDate } from 'reka-ui/date';

/** Granice `UiCalendar` przy wyborze tygodnia — jawny zakres, żeby nic nie narzucało min. jak „od zaznaczonego tygodnia”. */
export const WEEK_PICKER_CALENDAR_MIN = parseDate('1900-01-01');
export const WEEK_PICKER_CALENDAR_MAX = parseDate('2100-12-31');

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

/** Siedem dni od poniedziałku (włącznie) — do zaznaczenia pełnego tygodnia w kalendarzu. */
export function weekCalendarDatesFromMonday(monday: Date): CalendarDate[] {
    const out: CalendarDate[] = [];

    for (let i = 0; i < 7; i += 1) {
        const d = new Date(
            monday.getFullYear(),
            monday.getMonth(),
            monday.getDate() + i,
        );

        out.push(dateToCalendarDate(d));
    }

    return out;
}

/** `YYYY-MM-DD` z inputu / API → wartość kalendarza (reka-ui). Pusty lub niepoprawny → `undefined`. */
export function isoDateStringToCalendarDate(
    value: string,
): CalendarDate | undefined {
    const t = value.trim();

    if (t.length === 0) {
        return undefined;
    }

    try {
        return parseDate(t);
    } catch {
        return undefined;
    }
}

/** Wybór z `UiCalendar` → `YYYY-MM-DD` dla pól API / `v-model` string. */
export function dateValueToIsoDateString(value: DateValue): string {
    return formatDateOnly(toDate(value));
}

const DATETIME_LOCAL_RE = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/;

/**
 * ISO 8601 z API (UTC lub ze strefą) → string jak `datetime-local` w **lokalnej** strefie przeglądarki.
 * Nie wycinaj ręcznie `slice(0, 16)` z `...Z` — to myli godzinę UTC z lokalną.
 */
export function isoInstantToDatetimeLocalString(iso: string): string {
    const t = iso.trim();

    if (t.length === 0) {
        return '';
    }

    const d = new Date(t);

    if (Number.isNaN(d.getTime())) {
        return '';
    }

    const y = d.getFullYear();
    const mo = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');

    return `${y}-${mo}-${day}T${hh}:${mm}`;
}

/** Parsuje wartość jak `input[type=datetime-local]` — lokalna ściana czasu, bez strefy. */
export function parseDatetimeLocalParts(value: string): {
    date: CalendarDate;
    hour: number;
    minute: number;
} | null {
    const t = value.trim();
    const m = DATETIME_LOCAL_RE.exec(t);

    if (!m) {
        return null;
    }

    const y = Number(m[1]);
    const mo = Number(m[2]);
    const d = Number(m[3]);
    const hour = Number(m[4]);
    const minute = Number(m[5]);

    if (
        !Number.isFinite(y) ||
        !Number.isFinite(mo) ||
        !Number.isFinite(d) ||
        !Number.isFinite(hour) ||
        !Number.isFinite(minute)
    ) {
        return null;
    }

    if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
        return null;
    }

    try {
        return {
            date: new CalendarDate(y, mo, d),
            hour,
            minute,
        };
    } catch {
        return null;
    }
}

/** Składa string jak z `datetime-local` (`YYYY-MM-DDTHH:mm`). */
export function buildDatetimeLocal(
    date: CalendarDate,
    hour: number,
    minute: number,
): string {
    const y = String(date.year);
    const mo = String(date.month).padStart(2, '0');
    const day = String(date.day).padStart(2, '0');
    const hh = String(hour).padStart(2, '0');
    const mm = String(minute).padStart(2, '0');

    return `${y}-${mo}-${day}T${hh}:${mm}`;
}

/** Etykieta jak w UI: `DD.MM.YYYY HH:mm`. */
export function formatDatetimeLocalPl(value: string): string {
    const p = parseDatetimeLocalParts(value);

    if (!p) {
        return '';
    }

    const dd = String(p.date.day).padStart(2, '0');
    const mo = String(p.date.month).padStart(2, '0');
    const yyyy = String(p.date.year);

    return `${dd}.${mo}.${yyyy} ${String(p.hour).padStart(2, '0')}:${String(p.minute).padStart(2, '0')}`;
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
