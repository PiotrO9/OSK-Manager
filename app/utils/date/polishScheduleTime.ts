import { fromDate, parseDateTime, toZoned } from '@internationalized/date';

export const POLISH_TIME_ZONE = 'Europe/Warsaw';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
const DATETIME_LOCAL_RE = /^\d{4}-\d{2}-\d{2}T([01]\d|2[0-3]):[0-5]\d$/;

export function polishLocalDateTimeToIso(local: string): string | null {
    const value = local.trim();

    if (!DATETIME_LOCAL_RE.test(value)) {
        return null;
    }

    try {
        return toZoned(
            parseDateTime(value),
            POLISH_TIME_ZONE,
            'reject',
        ).toAbsoluteString();
    } catch {
        return null;
    }
}

export function polishSlotToIso(date: string, time: string): string | null {
    const localDate = date.trim();
    const localTime = time.trim();

    if (!DATE_RE.test(localDate) || !TIME_RE.test(localTime)) {
        return null;
    }

    return polishLocalDateTimeToIso(`${localDate}T${localTime}`);
}

export function isoInstantToPolishDatetimeLocal(iso: string): string {
    const value = iso.trim();

    if (!value) {
        return '';
    }

    const instant = new Date(value);

    if (Number.isNaN(instant.getTime())) {
        return '';
    }

    const local = fromDate(instant, POLISH_TIME_ZONE);

    return `${String(local.year).padStart(4, '0')}-${String(local.month).padStart(2, '0')}-${String(local.day).padStart(2, '0')}T${String(local.hour).padStart(2, '0')}:${String(local.minute).padStart(2, '0')}`;
}
