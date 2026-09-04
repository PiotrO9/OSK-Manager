import type { FreeWindow } from '~/types/events/instructorEvent';
import { formatDateOnly } from '~/utils/date/weeklyCalendarDates';
import {
    getContainingWindowBoundsMs,
    getLocalDayIntersections,
    localMinuteIsInIntervals,
    msToDatetimeLocalString,
    ONE_HOUR_MS,
    ONE_MINUTE_MS,
    parseLocalDayParts,
    startLocalToMs,
} from '~/utils/schedule/eventEditFreeWindowIntervals';

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
            if (localMinuteIsInIntervals(p.y, p.mo, p.d, h, min, intervals)) {
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
        if (localMinuteIsInIntervals(p.y, p.mo, p.d, hour, min, intervals)) {
            minutes.push(min);
        }
    }

    return minutes.length > 0 ? minutes : null;
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
