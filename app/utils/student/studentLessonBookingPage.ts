import type { CurrentUserCourseItem } from '~/types/courses/course';
import type { SchoolAvailabilitySlot } from '~/types/schools/schoolAvailabilitySlots';
import {
    formatDateOnly,
    getMonday,
} from '~/utils/date/weeklyCalendarDates';
import type { ConnectedInstructorSlot } from '~/utils/instructors/managerInstructorWeeklyCalendar';
import { formatPolishCount } from '~/utils/text/polishPlural';

/** Domyślne okno rezerwacji OSK — zgodne z backendem, gdy brak ustawień szkoły. */
export const STUDENT_LESSON_BOOKING_MAX_DAYS_AHEAD = 30;

function parseTimeToMinutes(time: string): number | null {
    const parts = time.trim().split(':').map(Number);

    if (parts.length < 2) {
        return null;
    }

    const hours = parts[0];
    const minutes = parts[1];

    if (
        hours === undefined ||
        minutes === undefined ||
        !Number.isFinite(hours) ||
        !Number.isFinite(minutes)
    ) {
        return null;
    }

    return hours * 60 + minutes;
}

export function addDaysToDateString(isoDate: string, offsetDays: number): string {
    const date = new Date(`${isoDate}T00:00:00`);

    if (Number.isNaN(date.getTime())) {
        return isoDate;
    }

    date.setDate(date.getDate() + offsetDays);

    return formatDateOnly(date);
}

export function getStudentLessonBookingMaxBookableDate(
    today = new Date(),
): string {
    return addDaysToDateString(
        formatDateOnly(today),
        STUDENT_LESSON_BOOKING_MAX_DAYS_AHEAD,
    );
}

export function getStudentLessonBookingMinWeekStart(today = new Date()): Date {
    return getMonday(today);
}

export function getStudentLessonBookingMaxWeekStart(today = new Date()): Date {
    const maxBookable = getStudentLessonBookingMaxBookableDate(today);
    const anchor = new Date(`${maxBookable}T00:00:00`);

    return getMonday(anchor);
}

export function isStudentLessonBookingPrevWeekDisabled(
    weekStart: Date,
    today = new Date(),
): boolean {
    const minStart = getStudentLessonBookingMinWeekStart(today);

    return weekStart.getTime() <= minStart.getTime();
}

export function isStudentLessonBookingNextWeekDisabled(
    weekStart: Date,
    today = new Date(),
): boolean {
    const maxStart = getStudentLessonBookingMaxWeekStart(today);

    return weekStart.getTime() >= maxStart.getTime();
}

export function isStudentLessonBookingWeekBeyondWindow(
    weekStart: Date,
    today = new Date(),
): boolean {
    const weekMonday = formatDateOnly(weekStart);
    const maxBookable = getStudentLessonBookingMaxBookableDate(today);

    return weekMonday > maxBookable;
}

export function filterStudentLessonBookableSlots(
    slots: readonly SchoolAvailabilitySlot[],
    now = new Date(),
): SchoolAvailabilitySlot[] {
    const todayStr = formatDateOnly(now);
    const nowMinutes = now.getHours() * 60 + now.getMinutes();

    return slots.filter((slot) => {
        if (slot.date > todayStr) {
            return true;
        }

        if (slot.date < todayStr) {
            return false;
        }

        const startMinutes = parseTimeToMinutes(slot.startTime);

        return startMinutes !== null && startMinutes > nowMinutes;
    });
}

export function getStudentLessonBookingRemainingHours(
    course: Pick<CurrentUserCourseItem, 'totalHours' | 'progress'>,
): number {
    return Math.max(0, course.totalHours - course.progress);
}

export function getStudentLessonBookingSlotDurationHours(
    slot: Pick<SchoolAvailabilitySlot, 'startTime' | 'endTime'>,
): number {
    const startMinutes = parseTimeToMinutes(slot.startTime);
    const endMinutes = parseTimeToMinutes(slot.endTime);

    if (
        startMinutes === null ||
        endMinutes === null ||
        endMinutes <= startMinutes
    ) {
        return 0;
    }

    return (endMinutes - startMinutes) / 60;
}

export function canStudentBookSlotWithCourseHours(
    course: Pick<CurrentUserCourseItem, 'totalHours' | 'progress'>,
    slot: Pick<SchoolAvailabilitySlot, 'startTime' | 'endTime'>,
): boolean {
    const remaining = getStudentLessonBookingRemainingHours(course);
    const duration = getStudentLessonBookingSlotDurationHours(slot);

    return duration > 0 && duration <= remaining + 1e-9;
}

export function formatStudentLessonBookingCourseCountLabel(count: number): string {
    return formatPolishCount(count, [
        'kurs do rezerwacji',
        'kursy do rezerwacji',
        'kursów do rezerwacji',
    ]);
}

export function formatStudentLessonBookingAvailableSlotsLabel(
    count: number,
    options?: { isLoading?: boolean; hasCourse?: boolean },
): string {
    if (!options?.hasCourse) {
        return 'Najpierw wybierz kurs';
    }

    if (options.isLoading) {
        return 'Wczytywanie terminów…';
    }

    return formatPolishCount(count, [
        'dostępny termin',
        'dostępne terminy',
        'dostępnych terminów',
    ]);
}

export function formatStudentLessonBookingRemainingHoursLabel(
    course: Pick<CurrentUserCourseItem, 'totalHours' | 'progress'> | null,
): string {
    if (!course) {
        return 'Wybierz kurs, aby zobaczyć saldo godzin programu.';
    }

    const remaining = getStudentLessonBookingRemainingHours(course);

    return `${remaining} z ${course.totalHours} godz. programu pozostało do wykorzystania`;
}

export function connectStudentLessonBookingAdjacentSlots(
    slots: readonly SchoolAvailabilitySlot[],
): ConnectedInstructorSlot[] {
    const sorted = [...slots].sort(
        (a, b) =>
            a.date.localeCompare(b.date) ||
            a.instructorId.localeCompare(b.instructorId) ||
            a.startTime.localeCompare(b.startTime) ||
            a.endTime.localeCompare(b.endTime),
    );

    return sorted.map((slot, index) => {
        const previous = sorted[index - 1];
        const next = sorted[index + 1];

        return {
            slot,
            joinsPrevious:
                previous?.date === slot.date &&
                previous.instructorId === slot.instructorId &&
                previous.endTime === slot.startTime,
            joinsNext:
                next?.date === slot.date &&
                next.instructorId === slot.instructorId &&
                slot.endTime === next.startTime,
        };
    });
}

export function getStudentLessonBookingInstructorName(
    slot: SchoolAvailabilitySlot,
): string {
    return `${slot.instructorFirstName} ${slot.instructorLastName}`.trim();
}
