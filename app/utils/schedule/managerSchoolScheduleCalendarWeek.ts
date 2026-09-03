import type { DateValue } from '@internationalized/date';
import { toDate } from 'reka-ui/date';
import { formatDateOnly, getMonday } from '~/utils/date/weeklyCalendarDates';

export interface ManagerSchoolScheduleWeekDay {
    date: Date;
    dateStr: string;
    header: string;
    isToday: boolean;
}

export type ManagerSchoolScheduleWeekDirection = 'prev' | 'next';

const WEEK_RANGE_LABEL_OPTIONS: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
};

export function buildManagerSchoolScheduleWeekDays(
    weekStart: Date,
    today = new Date(),
): ManagerSchoolScheduleWeekDay[] {
    const start = getMonday(weekStart);
    const todayStr = formatDateOnly(today);
    const out: ManagerSchoolScheduleWeekDay[] = [];

    for (let i = 0; i < 7; i += 1) {
        const d = new Date(
            start.getFullYear(),
            start.getMonth(),
            start.getDate() + i,
        );
        const dateStr = formatDateOnly(d);

        out.push({
            date: d,
            dateStr,
            header: d.toLocaleDateString('pl-PL', {
                weekday: 'short',
                day: 'numeric',
                month: 'numeric',
            }),
            isToday: dateStr === todayStr,
        });
    }

    return out;
}

export function formatManagerSchoolScheduleWeekRangeLabel(
    weekStart: Date,
): string {
    const ws = getMonday(weekStart);
    const end = new Date(ws.getFullYear(), ws.getMonth(), ws.getDate() + 6);

    return `${ws.toLocaleDateString('pl-PL', WEEK_RANGE_LABEL_OPTIONS)} - ${end.toLocaleDateString('pl-PL', WEEK_RANGE_LABEL_OPTIONS)}`;
}

export function formatManagerSchoolScheduleCompactWeekRangeLabel(
    weekStart: Date,
): string {
    const ws = getMonday(weekStart);
    const end = new Date(ws.getFullYear(), ws.getMonth(), ws.getDate() + 6);
    const startDay = ws.toLocaleDateString('pl-PL', { day: 'numeric' });
    const endDay = end.toLocaleDateString('pl-PL', { day: 'numeric' });
    const startMonth = ws.toLocaleDateString('pl-PL', { month: 'long' });
    const endMonth = end.toLocaleDateString('pl-PL', { month: 'long' });

    if (
        ws.getMonth() === end.getMonth() &&
        ws.getFullYear() === end.getFullYear()
    ) {
        return `${startDay}-${endDay} ${endMonth}`;
    }

    return `${startDay} ${startMonth} - ${endDay} ${endMonth}`;
}

export function shiftManagerSchoolScheduleWeek(
    weekStart: Date,
    direction: ManagerSchoolScheduleWeekDirection,
): Date {
    const d = getMonday(weekStart);

    d.setDate(d.getDate() + (direction === 'next' ? 7 : -7));

    return getMonday(d);
}

export function resolveManagerSchoolScheduleCalendarWeekStart(
    value: DateValue | DateValue[] | undefined,
): Date | null {
    if (value === undefined) {
        return null;
    }

    const arr = Array.isArray(value) ? value : [value];

    if (arr.length === 0) {
        return null;
    }

    let anchor = arr[0]!;

    for (const v of arr) {
        if (toDate(v).getTime() > toDate(anchor).getTime()) {
            anchor = v;
        }
    }

    return getMonday(toDate(anchor));
}
