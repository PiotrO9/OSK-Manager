import { toValue } from 'vue';
import type { MaybeRefOrGetter } from 'vue';
import { resolveBffEndpoint } from '~/utils/bffEndpoint';
import { unwrapApiSuccessData } from '~/utils/apiEnvelope';
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

    return resolveBffEndpoint(
        `/api/instructors/${encodeURIComponent(instructorId)}/availability/slots?${query.toString()}`,
    );
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
            const raw = await $fetch<unknown>(buildSlotsUrl(id, from, to), {
                credentials: 'include',
            });

            const data = unwrapApiSuccessData<{ slots: AvailabilitySlot[] }>(
                raw,
            );

            return Array.isArray(data?.slots) ? data.slots : [];
        } finally {
            isLoading.value = false;
        }
    }

    return {
        isLoading: readonly(isLoading),
        fetchSlots,
    };
}
