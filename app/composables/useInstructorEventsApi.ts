import { resolveBffEndpoint } from '~/utils/bffEndpoint';
import { unwrapApiSuccessData } from '~/utils/apiEnvelope';
import type {
    CreateInstructorEventPayload,
    InstructorEvent,
} from '~/types/instructorEvent';

export function useInstructorEventsApi() {
    const isLoading = ref(false);

    async function createInstructorEvent(
        payload: CreateInstructorEventPayload,
    ): Promise<InstructorEvent> {
        isLoading.value = true;

        try {
            const body: Record<string, unknown> = {
                instructorId: payload.instructorId.trim(),
                type: payload.type,
                startTime: payload.startTime.trim(),
                endTime: payload.endTime.trim(),
            };

            if (payload.type === 'DRIVE' && payload.vehicleId?.trim()) {
                body.vehicleId = payload.vehicleId.trim();
            }

            if (payload.capacity !== undefined && payload.capacity !== null) {
                body.capacity = payload.capacity;
            }

            const raw = await $fetch<unknown>(
                resolveBffEndpoint('/api/events'),
                {
                    method: 'POST',
                    credentials: 'include',
                    body,
                },
            );

            const data = unwrapApiSuccessData<{ event: InstructorEvent }>(raw);

            if (!data?.event || typeof data.event !== 'object') {
                throw new Error('Nieprawidłowa odpowiedź serwera');
            }

            return data.event;
        } finally {
            isLoading.value = false;
        }
    }

    return {
        isLoading: readonly(isLoading),
        createInstructorEvent,
    };
}
