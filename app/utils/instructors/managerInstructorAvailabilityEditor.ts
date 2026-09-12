import type { WeeklyDayFormRow } from '~/types/instructors/instructorAvailability';
import { getAvailabilityTimelineBarStyle } from '~/utils/schedule/availabilityTimeline';

const MINUTES_IN_HOUR = 60;

export function getInstructorAvailabilityDraftTimelineBar(
    row: WeeklyDayFormRow,
) {
    if (!row.enabled) {
        return null;
    }

    return getAvailabilityTimelineBarStyle(row.startTime, row.endTime);
}

export function getInstructorAvailabilityLabel(row: WeeklyDayFormRow): string {
    if (!row.enabled) {
        return 'Brak dostępności';
    }

    return `${row.startTime}-${row.endTime}`;
}

export function getInstructorAvailabilityStatusLabel(
    row: WeeklyDayFormRow,
): string {
    if (!row.enabled) {
        return 'wyłączony';
    }

    if (row.endTime <= '15:00') {
        return 'krócej';
    }

    return 'aktywny';
}

export function getInstructorAvailabilityStatusClass(
    row: WeeklyDayFormRow,
): string {
    if (!row.enabled) {
        return 'bg-slate-100 text-slate-500 ring-slate-200';
    }

    if (row.endTime <= '15:00') {
        return 'bg-amber-50 text-amber-700 ring-amber-100';
    }

    return 'bg-emerald-50 text-emerald-700 ring-emerald-100';
}

export function validateInstructorAvailabilityRow(
    row: WeeklyDayFormRow,
): string | null {
    if (!row.enabled) {
        return null;
    }

    if (!row.startTime) {
        return 'Podaj godzinę rozpoczęcia.';
    }

    if (!row.endTime) {
        return 'Podaj godzinę zakończenia.';
    }

    if (row.startTime >= row.endTime) {
        return 'Godzina rozpoczęcia musi być wcześniejsza niż zakończenia.';
    }

    return null;
}

export function isInstructorAvailabilityRowChanged(
    row: WeeklyDayFormRow,
    savedRow: WeeklyDayFormRow | undefined,
): boolean {
    if (!savedRow) {
        return row.enabled;
    }

    return (
        row.enabled !== savedRow.enabled ||
        row.startTime !== savedRow.startTime ||
        row.endTime !== savedRow.endTime
    );
}

export function getInstructorAvailabilityChangedRows(
    rows: readonly WeeklyDayFormRow[],
    savedRows: readonly WeeklyDayFormRow[],
): WeeklyDayFormRow[] {
    const savedByDay = new Map(
        savedRows.map((row) => [row.dayOfWeek, row] as const),
    );

    return rows.filter((row) =>
        isInstructorAvailabilityRowChanged(row, savedByDay.get(row.dayOfWeek)),
    );
}

function parseTimeToMinutes(time: string): number | null {
    const [hourRaw, minuteRaw] = time.trim().split(':');
    const hour = Number(hourRaw);
    const minute = Number(minuteRaw);

    if (
        !Number.isFinite(hour) ||
        !Number.isFinite(minute) ||
        hour < 0 ||
        hour > 23 ||
        minute < 0 ||
        minute > 59
    ) {
        return null;
    }

    return hour * MINUTES_IN_HOUR + minute;
}

export function getInstructorAvailabilityDurationMinutes(
    row: WeeklyDayFormRow,
): number {
    if (!row.enabled) {
        return 0;
    }

    const start = parseTimeToMinutes(row.startTime);
    const end = parseTimeToMinutes(row.endTime);

    if (start === null || end === null || end <= start) {
        return 0;
    }

    return end - start;
}

export function formatInstructorAvailabilityDuration(
    rows: readonly WeeklyDayFormRow[],
): string {
    const totalMinutes = rows.reduce(
        (sum, row) => sum + getInstructorAvailabilityDurationMinutes(row),
        0,
    );

    if (totalMinutes === 0) {
        return '0 h';
    }

    const hours = Math.floor(totalMinutes / MINUTES_IN_HOUR);
    const minutes = totalMinutes % MINUTES_IN_HOUR;

    return minutes === 0 ? `${hours} h` : `${hours} h ${minutes} min`;
}

export interface InstructorAvailabilityRowsValidation {
    rowErrors: Record<number, string | null>;
    formError: string | null;
    hasErrors: boolean;
}

export function validateInstructorAvailabilityRows(
    rows: readonly WeeklyDayFormRow[],
): InstructorAvailabilityRowsValidation {
    const rowErrors: Record<number, string | null> = {};

    for (const row of rows) {
        const error = validateInstructorAvailabilityRow(row);

        if (error) {
            rowErrors[row.dayOfWeek] = error;
        }
    }

    const hasErrors = Object.values(rowErrors).some(Boolean);

    return {
        rowErrors,
        formError: hasErrors
            ? 'Popraw godziny w oznaczonych dniach przed zapisem.'
            : null,
        hasErrors,
    };
}
