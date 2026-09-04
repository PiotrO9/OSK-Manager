import type { FreeWindow } from '~/types/events/instructorEvent';
import { parseDatetimeLocalParts } from '~/utils/date/weeklyCalendarDates';

export interface LocalDayParts {
    y: number;
    mo: number;
    d: number;
}

export interface DateInterval {
    start: Date;
    end: Date;
}

export interface WindowBoundsMs {
    ws: number;
    we: number;
}

export const ONE_HOUR_MS = 60 * 60 * 1000;
export const ONE_MINUTE_MS = 60 * 1000;

export function parseLocalDayParts(localDayStr: string): LocalDayParts | null {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(localDayStr.trim());

    if (!match) {
        return null;
    }

    const y = Number(match[1]);
    const mo = Number(match[2]);
    const d = Number(match[3]);

    if (!Number.isFinite(y) || !Number.isFinite(mo) || !Number.isFinite(d)) {
        return null;
    }

    return { y, mo, d };
}

export function localDayBounds(localDayStr: string): DateInterval | null {
    const parts = parseLocalDayParts(localDayStr);

    if (!parts) {
        return null;
    }

    const start = new Date(parts.y, parts.mo - 1, parts.d, 0, 0, 0, 0);
    const end = new Date(parts.y, parts.mo - 1, parts.d, 23, 59, 59, 999);

    return { start, end };
}

export function intersectWindowWithLocalDay(
    window: FreeWindow,
    localDayStr: string,
): DateInterval | null {
    const windowStart = new Date(window.startTime).getTime();
    const windowEnd = new Date(window.endTime).getTime();
    const day = localDayBounds(localDayStr);

    if (!day) {
        return null;
    }

    const dayStart = day.start.getTime();
    const dayEnd = day.end.getTime();
    const start = Math.max(windowStart, dayStart);
    const end = Math.min(windowEnd, dayEnd);

    if (start > end) {
        return null;
    }

    return { start: new Date(start), end: new Date(end) };
}

export function getLocalDayIntersections(
    windows: readonly FreeWindow[],
    localDayStr: string,
): DateInterval[] {
    const out: DateInterval[] = [];

    for (const window of windows) {
        const intersection = intersectWindowWithLocalDay(window, localDayStr);

        if (intersection) {
            out.push(intersection);
        }
    }

    return out;
}

export function localMinuteIsInIntervals(
    y: number,
    mo: number,
    d: number,
    hour: number,
    minute: number,
    intervals: readonly DateInterval[],
): boolean {
    const time = new Date(y, mo - 1, d, hour, minute, 0, 0).getTime();

    return intervals.some(
        ({ start, end }) => time >= start.getTime() && time <= end.getTime(),
    );
}

export function getContainingWindowBoundsMs(
    windows: readonly FreeWindow[],
    instantMs: number,
): WindowBoundsMs | null {
    for (const window of windows) {
        const ws = new Date(window.startTime).getTime();
        const we = new Date(window.endTime).getTime();

        if (instantMs >= ws && instantMs <= we) {
            return { ws, we };
        }
    }

    return null;
}

export function startLocalToMs(startLocal: string): number | null {
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

export function msToDatetimeLocalString(ms: number): string {
    const date = new Date(ms);
    const y = date.getFullYear();
    const mo = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hh = String(date.getHours()).padStart(2, '0');
    const mm = String(date.getMinutes()).padStart(2, '0');

    return `${y}-${mo}-${day}T${hh}:${mm}`;
}
