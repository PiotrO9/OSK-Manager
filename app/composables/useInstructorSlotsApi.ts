import { toValue } from 'vue';
import type { MaybeRefOrGetter } from 'vue';
import type { AvailabilitySlot } from '~/types/instructorSlots';

function buildSlotsUrl(
    instructorId: string,
    dateFrom: string,
    dateTo: string,
): string {
    const query = new URLSearchParams({
        dateFrom,
        dateTo,
    });

    return `/api/instructors/${encodeURIComponent(instructorId)}/availability/slots?${query.toString()}`;
}

function normalizeSlots(data: unknown): AvailabilitySlot[] {
    const slots = (data as { slots?: unknown } | null)?.slots;

    return Array.isArray(slots) ? (slots as AvailabilitySlot[]) : [];
}

export function useInstructorSlotsApi(instructorId: MaybeRefOrGetter<string>) {
    const isLoading = ref(false);

    async function fetchSlots(
        dateFrom: string,
        dateTo: string,
    ): Promise<AvailabilitySlot[]> {
        const id = toValue(instructorId).trim();

        if (!id) {
            return [];
        }

        const from = dateFrom.trim();
        const to = dateTo.trim();

        if (!from || !to) {
            return [];
        }

        isLoading.value = true;

        try {
            return await requestBffData<AvailabilitySlot[]>(
                'GET',
                buildSlotsUrl(id, from, to),
                {
                    fallbackMessage: 'Nie udało się pobrać dostępnych slotów.',
                    normalize: normalizeSlots,
                },
            );
        } finally {
            isLoading.value = false;
        }
    }

    return {
        isLoading: readonly(isLoading),
        fetchSlots,
    };
}
