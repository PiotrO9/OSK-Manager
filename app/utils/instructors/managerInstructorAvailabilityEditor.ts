import type { WeeklyDayFormRow } from '~/types/instructors/instructorAvailability';
import { getAvailabilityTimelineBarStyle } from '~/utils/schedule/availabilityTimeline';

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
