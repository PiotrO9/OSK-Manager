import type { AvailabilitySlot } from '~/types/instructors/instructorSlots';
import { formatDateOnly } from '~/utils/date/weeklyCalendarDates';

export const MANAGER_INSTRUCTOR_WEEK_BASE_HOUR = 7;
export const MANAGER_INSTRUCTOR_WEEK_END_HOUR = 19;
export const MANAGER_INSTRUCTOR_WEEK_GRID_HEIGHT_PX = 720;
export const MANAGER_INSTRUCTOR_WEEK_PX_PER_MINUTE = 1;

export interface ManagerInstructorWeekDay {
    date: Date;
    dateStr: string;
    header: string;
    shortHeader: string;
    isToday: boolean;
}

export interface ManagerInstructorBusiestDay {
    label: string;
    count: number;
}

export function getManagerInstructorSlotTopPx(startTime: string): number {
    const parts = startTime.trim().split(':').map(Number);

    if (parts.length < 2) {
        return 0;
    }

    const h = parts[0];
    const m = parts[1];

    if (
        h === undefined ||
        m === undefined ||
        !Number.isFinite(h) ||
        !Number.isFinite(m)
    ) {
        return 0;
    }

    const startMin = h * 60 + m;
    const baseMin = MANAGER_INSTRUCTOR_WEEK_BASE_HOUR * 60;

    return startMin - baseMin;
}

export function buildManagerInstructorWeekDays(
    weekStart: Date,
    today: Date = new Date(),
): ManagerInstructorWeekDay[] {
    const out: ManagerInstructorWeekDay[] = [];
    const start = new Date(
        weekStart.getFullYear(),
        weekStart.getMonth(),
        weekStart.getDate(),
    );
    const todayStr = formatDateOnly(today);

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
            shortHeader: d.toLocaleDateString('pl-PL', {
                weekday: 'short',
            }),
            isToday: dateStr === todayStr,
        });
    }

    return out;
}

export function formatManagerInstructorWeekRangeLabel(weekStart: Date): string {
    const end = new Date(
        weekStart.getFullYear(),
        weekStart.getMonth(),
        weekStart.getDate() + 6,
    );

    const opts: Intl.DateTimeFormatOptions = {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    };

    return `${weekStart.toLocaleDateString('pl-PL', opts)} - ${end.toLocaleDateString('pl-PL', opts)}`;
}

export function formatManagerInstructorWeekRangeCompactLabel(
    weekStart: Date,
): string {
    const end = new Date(
        weekStart.getFullYear(),
        weekStart.getMonth(),
        weekStart.getDate() + 6,
    );

    const startDay = weekStart.toLocaleDateString('pl-PL', {
        day: '2-digit',
    });
    const endLabel = end.toLocaleDateString('pl-PL', {
        day: '2-digit',
        month: 'long',
    });

    return `${startDay}-${endLabel}`;
}

export function groupManagerInstructorSlotsByDate(
    slots: readonly AvailabilitySlot[],
): Map<string, AvailabilitySlot[]> {
    const map = new Map<string, AvailabilitySlot[]>();

    for (const slot of slots) {
        if (!map.has(slot.date)) {
            map.set(slot.date, []);
        }

        map.get(slot.date)!.push(slot);
    }

    for (const arr of map.values()) {
        arr.sort((a, b) => a.startTime.localeCompare(b.startTime));
    }

    return map;
}

export function getManagerInstructorEarliestSlotLabel(
    slots: readonly AvailabilitySlot[],
): string {
    const first = slots
        .map((slot) => slot.startTime)
        .filter((time) => time.trim().length > 0)
        .sort((a, b) => a.localeCompare(b))[0];

    return first ?? '-';
}

export function getManagerInstructorBusiestDay(
    weekDays: readonly ManagerInstructorWeekDay[],
    slotsByDate: ReadonlyMap<string, readonly AvailabilitySlot[]>,
): ManagerInstructorBusiestDay | null {
    const sorted = weekDays
        .map((day) => ({
            label: day.shortHeader,
            count: slotsByDate.get(day.dateStr)?.length ?? 0,
        }))
        .sort((a, b) => b.count - a.count);

    const first = sorted[0];

    if (!first || first.count === 0) {
        return null;
    }

    return first;
}
