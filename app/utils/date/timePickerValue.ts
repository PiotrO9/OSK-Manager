export interface TimePickerValue {
    hour: number;
    minute: number;
}

const TIME_PICKER_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;

export function parseTimePickerValue(value: string): TimePickerValue | null {
    const match = TIME_PICKER_RE.exec(value.trim());

    if (!match) {
        return null;
    }

    return {
        hour: Number(match[1]),
        minute: Number(match[2]),
    };
}

export function formatTimePickerValue(hour: number, minute: number): string {
    return `${String(clampClockHour(hour)).padStart(2, '0')}:${String(clampClockMinute(minute)).padStart(2, '0')}`;
}

export function normalizeTimePickerValue(
    value: string,
    fallback: TimePickerValue = { hour: 8, minute: 0 },
): TimePickerValue {
    return parseTimePickerValue(value) ?? fallback;
}

export function timePickerValueToMinutes(value: string): number | null {
    const parsed = parseTimePickerValue(value);

    if (!parsed) {
        return null;
    }

    return timePickerPartsToMinutes(parsed.hour, parsed.minute);
}

export function timePickerPartsToMinutes(hour: number, minute: number): number {
    return clampClockHour(hour) * 60 + clampClockMinute(minute);
}

export function isTimePickerCandidateAllowed(
    hour: number,
    minute: number,
    bounds: {
        minExclusive?: string;
        maxExclusive?: string;
    } = {},
): boolean {
    const candidate = timePickerPartsToMinutes(hour, minute);
    const min = bounds.minExclusive
        ? timePickerValueToMinutes(bounds.minExclusive)
        : null;
    const max = bounds.maxExclusive
        ? timePickerValueToMinutes(bounds.maxExclusive)
        : null;

    if (min !== null && candidate <= min) {
        return false;
    }

    if (max !== null && candidate >= max) {
        return false;
    }

    return true;
}

export function isTimePickerHourSelectable(
    hour: number,
    bounds: {
        minExclusive?: string;
        maxExclusive?: string;
    } = {},
): boolean {
    for (let minute = 0; minute < 60; minute += 1) {
        if (isTimePickerCandidateAllowed(hour, minute, bounds)) {
            return true;
        }
    }

    return false;
}

export function nearestAllowedMinuteForHour(
    hour: number,
    preferredMinute: number,
    bounds: {
        minExclusive?: string;
        maxExclusive?: string;
    } = {},
): number | null {
    const safeMinute = clampClockMinute(preferredMinute);

    if (isTimePickerCandidateAllowed(hour, safeMinute, bounds)) {
        return safeMinute;
    }

    for (let offset = 1; offset < 60; offset += 1) {
        const later = safeMinute + offset;

        if (later <= 59 && isTimePickerCandidateAllowed(hour, later, bounds)) {
            return later;
        }

        const earlier = safeMinute - offset;

        if (
            earlier >= 0 &&
            isTimePickerCandidateAllowed(hour, earlier, bounds)
        ) {
            return earlier;
        }
    }

    return null;
}

export function clampClockHour(hour: number): number {
    if (!Number.isFinite(hour)) {
        return 0;
    }

    return Math.min(23, Math.max(0, Math.trunc(hour)));
}

export function clampClockMinute(minute: number): number {
    if (!Number.isFinite(minute)) {
        return 0;
    }

    return Math.min(59, Math.max(0, Math.trunc(minute)));
}

export function clockAngleFromPoint(
    x: number,
    y: number,
    center = 128,
): number {
    const raw = (Math.atan2(y - center, x - center) * 180) / Math.PI + 90;

    return (raw + 360) % 360;
}

export function minuteFromClockAngle(angle: number): number {
    return Math.round(angle / 6) % 60;
}

export function hourFromClockAngle(angle: number, distance: number): number {
    const hourOnDial = Math.round(angle / 30) % 12;
    const isInnerRing = distance < 88;

    if (isInnerRing) {
        return hourOnDial === 0 ? 0 : hourOnDial + 12;
    }

    return hourOnDial === 0 ? 12 : hourOnDial;
}

export function angleForClockHour(hour: number): number {
    const safeHour = clampClockHour(hour);

    return (safeHour % 12) * 30;
}

export function angleForClockMinute(minute: number): number {
    return clampClockMinute(minute) * 6;
}

export function clockOptionTransform(angle: number, radius: number): string {
    const rad = ((angle - 90) * Math.PI) / 180;
    const x = Math.cos(rad) * radius;
    const y = Math.sin(rad) * radius;

    return `translate(-50%, -50%) translate(${x.toFixed(2)}px, ${y.toFixed(2)}px)`;
}
