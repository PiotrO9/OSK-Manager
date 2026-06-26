import type { FreeWindow } from '~/types/events/instructorEvent';
import {
    formatDateOnly,
    parseDatetimeLocalParts,
} from '~/utils/date/weeklyCalendarDates';

function parseLocalDayParts(
    localDayStr: string,
): { y: number; mo: number; d: number } | null {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(localDayStr.trim());

    if (!m) {
        return null;
    }

    const y = Number(m[1]);
    const mo = Number(m[2]);
    const d = Number(m[3]);

    if (!Number.isFinite(y) || !Number.isFinite(mo) || !Number.isFinite(d)) {
        return null;
    }

    return { y, mo, d };
}

function localDayBounds(
    localDayStr: string,
): { start: Date; end: Date } | null {
    const p = parseLocalDayParts(localDayStr);

    if (!p) {
        return null;
    }

    const start = new Date(p.y, p.mo - 1, p.d, 0, 0, 0, 0);
    const end = new Date(p.y, p.mo - 1, p.d, 23, 59, 59, 999);

    return { start, end };
}

function intersectWindowWithLocalDay(
    w: FreeWindow,
    localDayStr: string,
): { start: Date; end: Date } | null {
    const ws = new Date(w.startTime).getTime();
    const we = new Date(w.endTime).getTime();
    const day = localDayBounds(localDayStr);

    if (!day) {
        return null;
    }

    const ds = day.start.getTime();
    const de = day.end.getTime();
    const start = Math.max(ws, ds);
    const end = Math.min(we, de);

    if (start > end) {
        return null;
    }

    return { start: new Date(start), end: new Date(end) };
}

function getLocalDayIntersections(
    windows: FreeWindow[],
    localDayStr: string,
): { start: Date; end: Date }[] {
    const out: { start: Date; end: Date }[] = [];

    for (const w of windows) {
        const x = intersectWindowWithLocalDay(w, localDayStr);

        if (x) {
            out.push(x);
        }
    }

    return out;
}

function minuteInIntervals(
    y: number,
    mo: number,
    d: number,
    hour: number,
    minute: number,
    intervals: { start: Date; end: Date }[],
): boolean {
    const t = new Date(y, mo - 1, d, hour, minute, 0, 0).getTime();

    return intervals.some(
        ({ start, end }) => t >= start.getTime() && t <= end.getTime(),
    );
}

/**
 * Min/max dnia kalendarza (YYYY-MM-DD) po lokalnych datach końców okien.
 */
export function getLocalDateBoundsForCalendar(
    windows: FreeWindow[],
): { minDate: string; maxDate: string } | null {
    if (windows.length === 0) {
        return null;
    }

    const dates: string[] = [];

    for (const w of windows) {
        dates.push(formatDateOnly(new Date(w.startTime)));
        dates.push(formatDateOnly(new Date(w.endTime)));
    }

    dates.sort();

    return { minDate: dates[0]!, maxDate: dates[dates.length - 1]! };
}

/**
 * Godziny, w których istnieje co najmniej jedna dozwolona minuta w danym dniu lokalnym.
 */
export function getAllowedHoursForDate(
    windows: FreeWindow[],
    localDayStr: string,
): number[] | null {
    const intervals = getLocalDayIntersections(windows, localDayStr);

    if (intervals.length === 0) {
        return null;
    }

    const p = parseLocalDayParts(localDayStr);

    if (!p) {
        return null;
    }

    const hours = new Set<number>();

    for (let h = 0; h < 24; h += 1) {
        for (let min = 0; min < 60; min += 1) {
            if (minuteInIntervals(p.y, p.mo, p.d, h, min, intervals)) {
                hours.add(h);

                break;
            }
        }
    }

    const arr = [...hours].sort((a, b) => a - b);

    return arr.length > 0 ? arr : null;
}

/**
 * Minuty w danej godzinie dla wybranego dnia lokalnego.
 */
export function getAllowedMinutesForDateHour(
    windows: FreeWindow[],
    localDayStr: string,
    hour: number,
): number[] | null {
    const intervals = getLocalDayIntersections(windows, localDayStr);

    if (intervals.length === 0) {
        return null;
    }

    const p = parseLocalDayParts(localDayStr);

    if (!p) {
        return null;
    }

    const minutes: number[] = [];

    for (let min = 0; min < 60; min += 1) {
        if (minuteInIntervals(p.y, p.mo, p.d, hour, min, intervals)) {
            minutes.push(min);
        }
    }

    return minutes.length > 0 ? minutes : null;
}

function getContainingWindowBoundsMs(
    windows: FreeWindow[],
    instantMs: number,
): { ws: number; we: number } | null {
    for (const w of windows) {
        const ws = new Date(w.startTime).getTime();
        const we = new Date(w.endTime).getTime();

        if (instantMs >= ws && instantMs <= we) {
            return { ws, we };
        }
    }

    return null;
}

function startLocalToMs(startLocal: string): number | null {
    const parts = parseDatetimeLocalParts(startLocal);

    if (!parts) {
        return null;
    }

    return new Date(
        parts.date.year,
        parts.date.month - 1,
        parts.date.day,
        parts.hour,
        parts.minute,
        0,
        0,
    ).getTime();
}

const ONE_HOUR_MS = 60 * 60 * 1000;

const ONE_MINUTE_MS = 60 * 1000;

function msToDatetimeLocalString(ms: number): string {
    const d = new Date(ms);
    const y = d.getFullYear();
    const mo = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');

    return `${y}-${mo}-${day}T${hh}:${mm}`;
}

/**
 * Propozycja końca, gdy trzeba go ustawić względem początku: **start + 1 h**, jeśli mieści się
 * w tym samym oknie co początek; w przeciwnym razie najwcześniejsza dozwolona chwila po starcie.
 * Bez `freeWindows` (pusta lista) — zwykłe +1 h w czasie lokalnym.
 */
export function suggestDefaultEndLocal(
    windows: FreeWindow[] | null | undefined,
    startLocal: string,
): string | null {
    const startMs = startLocalToMs(startLocal);

    if (startMs === null) {
        return null;
    }

    const list = windows ?? [];

    if (list.length === 0) {
        return msToDatetimeLocalString(startMs + ONE_HOUR_MS);
    }

    const win = getContainingWindowBoundsMs(list, startMs);

    if (!win) {
        return msToDatetimeLocalString(startMs + ONE_HOUR_MS);
    }

    const { ws, we } = win;
    const preferred = startMs + ONE_HOUR_MS;

    if (preferred > startMs && preferred <= we && preferred >= ws) {
        return msToDatetimeLocalString(preferred);
    }

    for (let t = startMs + ONE_MINUTE_MS; t <= we; t += ONE_MINUTE_MS) {
        if (t >= ws) {
            return msToDatetimeLocalString(t);
        }
    }

    return null;
}

/**
 * Godziny końca: w tym samym oknie co początek, ściśle po `startLocal`, do końca okna.
 */
export function getAllowedHoursForEnd(
    windows: FreeWindow[],
    startLocal: string,
    endLocalDayStr: string,
): number[] | null {
    const startMs = startLocalToMs(startLocal);

    if (startMs === null) {
        return null;
    }

    const win = getContainingWindowBoundsMs(windows, startMs);

    if (!win) {
        return null;
    }

    const { ws, we } = win;
    const p = parseLocalDayParts(endLocalDayStr);

    if (!p) {
        return null;
    }

    const hours = new Set<number>();

    for (let h = 0; h < 24; h += 1) {
        for (let min = 0; min < 60; min += 1) {
            const t = new Date(p.y, p.mo - 1, p.d, h, min, 0, 0).getTime();

            if (t > startMs && t <= we && t >= ws) {
                hours.add(h);

                break;
            }
        }
    }

    const arr = [...hours].sort((a, b) => a - b);

    return arr.length > 0 ? arr : null;
}

/**
 * Minuty końca w danej godzinie.
 */
export function getAllowedMinutesForEndHour(
    windows: FreeWindow[],
    startLocal: string,
    endLocalDayStr: string,
    hour: number,
): number[] | null {
    const startMs = startLocalToMs(startLocal);

    if (startMs === null) {
        return null;
    }

    const win = getContainingWindowBoundsMs(windows, startMs);

    if (!win) {
        return null;
    }

    const { ws, we } = win;
    const p = parseLocalDayParts(endLocalDayStr);

    if (!p) {
        return null;
    }

    const minutes: number[] = [];

    for (let min = 0; min < 60; min += 1) {
        const t = new Date(p.y, p.mo - 1, p.d, hour, min, 0, 0).getTime();

        if (t > startMs && t <= we && t >= ws) {
            minutes.push(min);
        }
    }

    return minutes.length > 0 ? minutes : null;
}
