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

    const dateFormatter = new Intl.DateTimeFormat('pl-PL', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
    const timeFormatter = new Intl.DateTimeFormat('pl-PL', {
        hour: '2-digit',
        minute: '2-digit',
    });
    const startLabel = `${dateFormatter.format(start)} · ${timeFormatter.format(start)}`;

    if (start.toDateString() === end.toDateString()) {
        return `${startLabel}–${timeFormatter.format(end)}`;
    }

    return `${startLabel} – ${dateFormatter.format(end)} · ${timeFormatter.format(end)}`;
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

    return {
        scheduleBackHref,
        deleteDialogTimeLabel,
    };
}
