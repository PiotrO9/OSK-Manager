import type { DateValue } from '@internationalized/date';
import { toDate } from 'reka-ui/date';
import type {
    LessonBookingAggregatedSlot,
    LessonBookingInstructorOption,
} from '~/types/lessons/lessonBooking';
import type { SchoolAvailabilitySlotsQueryFilters } from '~/types/schools/schoolAvailabilityFilters';
import type { SchoolAvailabilitySlot } from '~/types/schools/schoolAvailabilitySlots';
import { formatDateOnly, getMonday } from '~/utils/date/weeklyCalendarDates';

export interface ManagerSchoolAvailabilityWeekDay {
    date: Date;
    dateStr: string;
    header: string;
    isToday: boolean;
}

export const MANAGER_SCHOOL_AVAILABILITY_BASE_HOUR = 7;
export const MANAGER_SCHOOL_AVAILABILITY_END_HOUR = 19;
export const MANAGER_SCHOOL_AVAILABILITY_PX_PER_MINUTE = 1;
export const MANAGER_SCHOOL_AVAILABILITY_GRID_HEIGHT_PX =
    (MANAGER_SCHOOL_AVAILABILITY_END_HOUR -
        MANAGER_SCHOOL_AVAILABILITY_BASE_HOUR) *
    60;

export function buildSchoolAvailabilityCalendarFiltersPayload(): SchoolAvailabilitySlotsQueryFilters {
    return {
        limit: 500,
        sort: 'startTime',
    };
}

export function buildSchoolAvailabilityWeekDays(
    weekStart: Date,
    today = new Date(),
): ManagerSchoolAvailabilityWeekDay[] {
    const out: ManagerSchoolAvailabilityWeekDay[] = [];
    const start = new Date(
        weekStart.getFullYear(),
        weekStart.getMonth(),
        weekStart.getDate(),
    );
    const todayStr = formatDateOnly(today);

    for (let i = 0; i < 7; i += 1) {
        const date = new Date(
            start.getFullYear(),
            start.getMonth(),
            start.getDate() + i,
        );
        const dateStr = formatDateOnly(date);

        out.push({
            date,
            dateStr,
            header: date.toLocaleDateString('pl-PL', {
                weekday: 'short',
                day: 'numeric',
                month: 'numeric',
            }),
            isToday: dateStr === todayStr,
        });
    }

    return out;
}

export function formatSchoolAvailabilityWeekRangeLabel(
    weekStart: Date,
): string {
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

    return `${weekStart.toLocaleDateString('pl-PL', opts)} – ${end.toLocaleDateString('pl-PL', opts)}`;
}

export function getSchoolAvailabilitySelectedWeekMonday(
    value: DateValue | DateValue[] | undefined,
): Date | null {
    if (value === undefined) {
        return null;
    }

    const selectedValues = Array.isArray(value) ? value : [value];

    if (selectedValues.length === 0) {
        return null;
    }

    let anchor = selectedValues[0]!;

    for (const selectedValue of selectedValues) {
        if (toDate(selectedValue).getTime() > toDate(anchor).getTime()) {
            anchor = selectedValue;
        }
    }

    return getMonday(toDate(anchor));
}

export function schoolAvailabilityTimeToMinutes(time: string): number | null {
    const parts = time.trim().split(':').map(Number);

    if (parts.length < 2) {
        return null;
    }

    const h = parts[0];
    const m = parts[1];

    if (
        h === undefined ||
        m === undefined ||
        !Number.isFinite(h) ||
        !Number.isFinite(m)
    ) {
        return null;
    }

    return h * 60 + m;
}

export function isSchoolAvailabilitySlotInsideTimeline(
    slot: LessonBookingAggregatedSlot,
): boolean {
    const startMin = schoolAvailabilityTimeToMinutes(slot.startTime);
    const endMin = schoolAvailabilityTimeToMinutes(slot.endTime);
    const baseMin = MANAGER_SCHOOL_AVAILABILITY_BASE_HOUR * 60;
    const endBoundaryMin = MANAGER_SCHOOL_AVAILABILITY_END_HOUR * 60;

    if (startMin === null || endMin === null) {
        return false;
    }

    return startMin >= baseMin && endMin <= endBoundaryMin && endMin > startMin;
}

export function getSchoolAvailabilitySlotTopPx(startTime: string): number {
    const startMin = schoolAvailabilityTimeToMinutes(startTime);

    if (startMin === null) {
        return 0;
    }

    const baseMin = MANAGER_SCHOOL_AVAILABILITY_BASE_HOUR * 60;

    return (startMin - baseMin) * MANAGER_SCHOOL_AVAILABILITY_PX_PER_MINUTE;
}

export function buildSchoolAvailabilityAggregatedSlots(
    raw: readonly SchoolAvailabilitySlot[],
): LessonBookingAggregatedSlot[] {
    const byKey = new Map<string, LessonBookingInstructorOption[]>();

    for (const slot of raw) {
        const key = `${slot.date}|${slot.startTime}|${slot.endTime}`;
        const instructor: LessonBookingInstructorOption = {
            id: slot.instructorId,
            firstName: slot.instructorFirstName,
            lastName: slot.instructorLastName,
        };

        const availableInstructors = byKey.get(key);

        if (availableInstructors) {
            if (!availableInstructors.some((x) => x.id === instructor.id)) {
                availableInstructors.push(instructor);
            }
        } else {
            byKey.set(key, [instructor]);
        }
    }

    const aggregatedSlots: LessonBookingAggregatedSlot[] = [];

    for (const [key, availableInstructors] of byKey) {
        const parts = key.split('|');
        const date = parts[0] ?? '';
        const startTime = parts[1] ?? '';
        const endTime = parts[2] ?? '';

        if (!date || !startTime || !endTime) {
            continue;
        }

        availableInstructors.sort((a, b) =>
            `${a.lastName} ${a.firstName}`.localeCompare(
                `${b.lastName} ${b.firstName}`,
                'pl',
            ),
        );

        aggregatedSlots.push({
            date,
            startTime,
            endTime,
            instructorCount: availableInstructors.length,
            availableInstructors,
        });
    }

    return aggregatedSlots.sort((a, b) => {
        const byDate = a.date.localeCompare(b.date);

        if (byDate !== 0) {
            return byDate;
        }

        return a.startTime.localeCompare(b.startTime);
    });
}
