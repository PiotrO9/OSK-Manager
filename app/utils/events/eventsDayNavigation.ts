import type { ScheduleLessonItem } from '~/types/schedule/schedule';
import { buildScheduleManagerItemEditRoute } from '~/utils/schedule/scheduleManagerEditNavigation';

export function readEventsDayDate(value: unknown): string | null {
    const raw = Array.isArray(value) ? value[0] : value;

    if (typeof raw !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
        return null;
    }

    const year = Number(raw.slice(0, 4));

    if (year < 1900 || year > 2100) {
        return null;
    }

    const date = new Date(`${raw}T12:00:00`);

    return !Number.isNaN(date.getTime()) &&
        date.getFullYear() === year &&
        date.getMonth() + 1 === Number(raw.slice(5, 7)) &&
        date.getDate() === Number(raw.slice(8, 10))
        ? raw
        : null;
}

export function buildEventsDayEditRoute(
    item: ScheduleLessonItem,
    date: string,
) {
    const destination = buildScheduleManagerItemEditRoute(item);

    if (!destination) {
        return null;
    }

    return {
        path: destination.path,
        query: {
            from: 'events',
            date,
        },
    };
}

export function buildEventsDayReturnRoute(
    from: unknown,
    date: unknown,
    schoolId: string,
) {
    const source = Array.isArray(from) ? from[0] : from;
    const day = readEventsDayDate(date);

    if (source !== 'events' || !day) {
        return null;
    }

    return {
        path: '/events',
        query: {
            date: day,
            ...(schoolId.trim() ? { schoolId: schoolId.trim() } : {}),
        },
    };
}
