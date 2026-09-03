import { computed } from 'vue';
import type { SchoolAvailabilitySlot } from '~/types/schools/schoolAvailabilitySlots';

export interface StudentLessonBookingSlotGroup {
    date: string;
    label: string;
    shortLabel: string;
    isToday: boolean;
    slots: SchoolAvailabilitySlot[];
}

export interface StudentLessonBookingScheduleCell {
    key: string;
    date: string;
    hour: number;
    slots: SchoolAvailabilitySlot[];
}

export interface StudentLessonBookingScheduleRow {
    hour: number;
    label: string;
    cells: StudentLessonBookingScheduleCell[];
}

export function formatStudentLessonBookingDateLabel(date: string): string {
    const d = new Date(`${date}T00:00:00`);

    if (Number.isNaN(d.getTime())) {
        return date;
    }

    return new Intl.DateTimeFormat('pl-PL', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
    }).format(d);
}

export function formatStudentLessonBookingShortDayLabel(date: string): string {
    const d = new Date(`${date}T00:00:00`);

    if (Number.isNaN(d.getTime())) {
        return date;
    }

    return new Intl.DateTimeFormat('pl-PL', {
        weekday: 'short',
        day: '2-digit',
        month: '2-digit',
    }).format(d);
}

export function addStudentLessonBookingDays(
    date: string,
    offset: number,
): string {
    const d = new Date(`${date}T00:00:00`);

    if (Number.isNaN(d.getTime())) {
        return date;
    }

    d.setDate(d.getDate() + offset);

    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');

    return `${y}-${m}-${day}`;
}

export function getStudentLessonBookingHourFromTime(
    value: string,
): number | null {
    const match = /^(\d{2}):(\d{2})$/.exec(value.trim());

    if (!match) {
        return null;
    }

    const hour = Number(match[1]);

    return Number.isFinite(hour) ? hour : null;
}

export function getStudentLessonBookingInstructorName(
    slot: SchoolAvailabilitySlot,
): string {
    return `${slot.instructorFirstName} ${slot.instructorLastName}`.trim();
}

export function getStudentLessonBookingSlotListSlotKey(
    slot: SchoolAvailabilitySlot,
): string {
    return `${slot.date}|${slot.startTime}|${slot.endTime}|${slot.instructorId}`;
}

export function getStudentLessonBookingWeekDays(
    weekStartDate: string,
): string[] {
    return Array.from({ length: 7 }, (_value, index) =>
        addStudentLessonBookingDays(weekStartDate, index),
    );
}

function sortStudentLessonBookingSlots(
    slots: SchoolAvailabilitySlot[],
): SchoolAvailabilitySlot[] {
    return [...slots].sort((a, b) => {
        const byTime = a.startTime.localeCompare(b.startTime);

        if (byTime !== 0) {
            return byTime;
        }

        return getStudentLessonBookingInstructorName(a).localeCompare(
            getStudentLessonBookingInstructorName(b),
        );
    });
}

export function getStudentLessonBookingSlotGroups(options: {
    slots: SchoolAvailabilitySlot[];
    weekDays: string[];
    todayIso: string;
}): StudentLessonBookingSlotGroup[] {
    const byDate = new Map<string, SchoolAvailabilitySlot[]>();

    for (const slot of options.slots) {
        const list = byDate.get(slot.date) ?? [];

        list.push(slot);
        byDate.set(slot.date, list);
    }

    return options.weekDays.map((day) => {
        const slots = byDate.get(day) ?? [];

        return {
            date: day,
            label: formatStudentLessonBookingDateLabel(day),
            shortLabel: formatStudentLessonBookingShortDayLabel(day),
            isToday: day === options.todayIso,
            slots: sortStudentLessonBookingSlots(slots),
        };
    });
}

export function getStudentLessonBookingTodayIso(): string {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');

    return `${y}-${m}-${day}`;
}

export function getStudentLessonBookingScheduleHourRange(
    slots: SchoolAvailabilitySlot[],
): { startHour: number; endHour: number } {
    const starts = slots
        .map((slot) => getStudentLessonBookingHourFromTime(slot.startTime))
        .filter((hour): hour is number => hour !== null);

    const ends = slots
        .map((slot) => getStudentLessonBookingHourFromTime(slot.endTime))
        .filter((hour): hour is number => hour !== null);

    return {
        startHour: Math.min(7, ...starts),
        endHour: Math.max(18, ...ends),
    };
}

export function getStudentLessonBookingScheduleRows(options: {
    slots: SchoolAvailabilitySlot[];
    weekDays: string[];
    startHour: number;
    endHour: number;
}): StudentLessonBookingScheduleRow[] {
    const rows: StudentLessonBookingScheduleRow[] = [];

    for (let hour = options.startHour; hour <= options.endHour; hour += 1) {
        rows.push({
            hour,
            label: `${String(hour).padStart(2, '0')}:00`,
            cells: options.weekDays.map((date) => ({
                key: `${date}-${hour}`,
                date,
                hour,
                slots: sortStudentLessonBookingSlots(
                    options.slots.filter(
                        (slot) =>
                            slot.date === date &&
                            getStudentLessonBookingHourFromTime(
                                slot.startTime,
                            ) === hour,
                    ),
                ),
            })),
        });
    }

    return rows;
}

export function getStudentLessonBookingBestDayLabel(
    groups: StudentLessonBookingSlotGroup[],
): string {
    const best = groups
        .filter((group) => group.slots.length > 0)
        .sort((a, b) => b.slots.length - a.slots.length)[0];

    if (!best) {
        return '';
    }

    return `Najwięcej dostępności: ${best.label}`;
}

export function useStudentLessonBookingSlotList(input: {
    slots: SchoolAvailabilitySlot[];
    weekStartDate: string;
}) {
    const todayIso = computed(() => getStudentLessonBookingTodayIso());

    const weekDays = computed(() =>
        getStudentLessonBookingWeekDays(input.weekStartDate),
    );

    const groups = computed(() =>
        getStudentLessonBookingSlotGroups({
            slots: input.slots,
            weekDays: weekDays.value,
            todayIso: todayIso.value,
        }),
    );

    const nonEmptyGroups = computed(() =>
        groups.value.filter((group) => group.slots.length > 0),
    );

    const scheduleHourRange = computed(() =>
        getStudentLessonBookingScheduleHourRange(input.slots),
    );

    const scheduleGridColumns = computed(
        () => `64px repeat(${weekDays.value.length}, minmax(82px, 1fr))`,
    );

    const scheduleRows = computed(() =>
        getStudentLessonBookingScheduleRows({
            slots: input.slots,
            weekDays: weekDays.value,
            startHour: scheduleHourRange.value.startHour,
            endHour: scheduleHourRange.value.endHour,
        }),
    );

    const bestDayLabel = computed(() =>
        getStudentLessonBookingBestDayLabel(groups.value),
    );

    return {
        bestDayLabel,
        groups,
        nonEmptyGroups,
        scheduleGridColumns,
        scheduleRows,
    };
}
