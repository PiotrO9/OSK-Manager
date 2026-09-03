import type { ComputedRef, Ref } from 'vue';
import type { InstructorEvent } from '~/types/events/instructorEvent';

interface UseManagerEventEditActionLabelsInput {
    schoolId: ComputedRef<string>;
    loadedEvent: Ref<InstructorEvent | null>;
    formStartLocal: Ref<string>;
    formEndLocal: Ref<string>;
    formInstructorId: Ref<string>;
}

function formatLocalDateTimeRange(startRaw: string, endRaw: string): string {
    if (!startRaw || !endRaw) {
        return '';
    }

    const start = new Date(startRaw);
    const end = new Date(endRaw);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
        return '';
    }

    const formatter = new Intl.DateTimeFormat('pl-PL', {
        dateStyle: 'short',
        timeStyle: 'short',
    });

    return `${formatter.format(start)} — ${formatter.format(end)}`;
}

function formatHeaderDateRange(startRaw: string, endRaw: string): string {
    if (!startRaw || !endRaw) {
        return 'Termin';
    }

    const start = new Date(startRaw);
    const end = new Date(endRaw);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
        return 'Termin';
    }

    const sameDay = start.toDateString() === end.toDateString();
    const sameMonth =
        start.getFullYear() === end.getFullYear() &&
        start.getMonth() === end.getMonth();
    const dayFormatter = new Intl.DateTimeFormat('pl-PL', {
        day: '2-digit',
    });
    const monthFormatter = new Intl.DateTimeFormat('pl-PL', {
        month: 'long',
    });
    const compactFormatter = new Intl.DateTimeFormat('pl-PL', {
        day: '2-digit',
        month: 'short',
    });

    if (sameDay) {
        return `${dayFormatter.format(start)} ${monthFormatter.format(start)}`;
    }

    if (sameMonth) {
        return `${dayFormatter.format(start)}-${dayFormatter.format(end)} ${monthFormatter.format(end)}`;
    }

    return `${compactFormatter.format(start)} - ${compactFormatter.format(end)}`;
}

export function useManagerEventEditActionLabels(
    input: UseManagerEventEditActionLabelsInput,
) {
    const scheduleBackHref = computed(() => {
        const instructorId =
            input.formInstructorId.value.trim() ||
            input.loadedEvent.value?.instructorId?.trim();
        const schoolId = input.schoolId.value;

        if (!instructorId) {
            return '/manager/instructors';
        }

        if (schoolId) {
            return {
                path: `/manager/instructors/${instructorId}/schedule`,
                query: { schoolId },
            };
        }

        return `/manager/instructors/${instructorId}/schedule`;
    });

    const deleteDialogTimeLabel = computed(() => {
        return formatLocalDateTimeRange(
            input.formStartLocal.value.trim(),
            input.formEndLocal.value.trim(),
        );
    });

    const headerDateRangeLabel = computed(() => {
        return formatHeaderDateRange(
            input.formStartLocal.value.trim(),
            input.formEndLocal.value.trim(),
        );
    });

    return {
        scheduleBackHref,
        deleteDialogTimeLabel,
        headerDateRangeLabel,
    };
}
