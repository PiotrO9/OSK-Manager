/** Wspólna oś graficzna: 6:00–22:00 (minuty od północy). */
export const AVAILABILITY_TIMELINE_TRACK_START_MIN = 6 * 60;
export const AVAILABILITY_TIMELINE_TRACK_END_MIN = 22 * 60;
const TRACK_RANGE_MIN =
    AVAILABILITY_TIMELINE_TRACK_END_MIN - AVAILABILITY_TIMELINE_TRACK_START_MIN;

export interface AvailabilityTimelineBar {
    leftPct: number;
    widthPct: number;
}

export function parseHhMmToMinutes(value: string): number | null {
    const trimmed = value.trim();
    const match = /^(\d{1,2}):(\d{2})$/.exec(trimmed);

    if (!match) {
        return null;
    }

    const h = Number.parseInt(match[1]!, 10);
    const m = Number.parseInt(match[2]!, 10);

    if (
        !Number.isFinite(h) ||
        !Number.isFinite(m) ||
        h < 0 ||
        h > 23 ||
        m < 0 ||
        m > 59
    ) {
        return null;
    }

    return h * 60 + m;
}

export function getAvailabilityTimelineBarStyle(
    startTime: string,
    endTime: string,
): AvailabilityTimelineBar | null {
    const startMin = parseHhMmToMinutes(startTime);
    const endMin = parseHhMmToMinutes(endTime);

    if (startMin === null || endMin === null) {
        return null;
    }

    if (endMin <= startMin) {
        return null;
    }

    const clampedStart = Math.max(
        startMin,
        AVAILABILITY_TIMELINE_TRACK_START_MIN,
    );
    const clampedEnd = Math.min(endMin, AVAILABILITY_TIMELINE_TRACK_END_MIN);

    if (
        clampedEnd <= AVAILABILITY_TIMELINE_TRACK_START_MIN ||
        clampedStart >= AVAILABILITY_TIMELINE_TRACK_END_MIN
    ) {
        return null;
    }

    const leftPct =
        ((clampedStart - AVAILABILITY_TIMELINE_TRACK_START_MIN) /
            TRACK_RANGE_MIN) *
        100;
    const widthPct = ((clampedEnd - clampedStart) / TRACK_RANGE_MIN) * 100;

    if (widthPct <= 0) {
        return null;
    }

    return {
        leftPct: Math.max(0, Math.min(100, leftPct)),
        widthPct: Math.max(0, Math.min(100 - leftPct, widthPct)),
    };
}
