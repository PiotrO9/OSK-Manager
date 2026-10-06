import type { Ref } from 'vue';
import type { EventStatusCode } from '~/types/events/instructorEvent';
import type { ScheduleLessonItem } from '~/types/schedule/schedule';
import { getApiFetchErrorMessage } from '~/utils/api/apiFetchErrorMessage';
import { INSTRUCTOR_EVENT_STATUS_OPTIONS } from '~/utils/events/instructorEventStatusDisplay';

export function useMyLessonsEventStatus(items: Ref<ScheduleLessonItem[]>) {
    const { addToast } = useAppToast();
    const savingEventId = ref<string | null>(null);

    async function updateEventStatus(
        id: string,
        rawStatus: string,
    ): Promise<void> {
        const status = rawStatus.trim().toUpperCase();
        const item = items.value.find((entry) => entry.id === id);

        if (
            !item ||
            item.kind !== 'instructor_event' ||
            !INSTRUCTOR_EVENT_STATUS_OPTIONS.includes(
                status as EventStatusCode,
            ) ||
            savingEventId.value
        ) {
            return;
        }

        const previousStatus = item.status;

        savingEventId.value = id;

        try {
            const response = await requestBffData<{
                updated: number;
                skipped: number;
            }>('PATCH', '/api/events/bulk-status', {
                body: { eventIds: [id], status },
                fallbackMessage: 'Nie udało się zmienić statusu wydarzenia.',
            });

            if (!response || response.updated !== 1) {
                throw new Error('Nie udało się zapisać statusu wydarzenia.');
            }

            item.status = status;
            addToast({
                title: 'Status wydarzenia zmieniony',
                variant: 'success',
            });
        } catch (error: unknown) {
            item.status = previousStatus;
            addToast({
                title: 'Nie udało się zmienić statusu wydarzenia',
                description: getApiFetchErrorMessage(
                    error,
                    'Spróbuj ponownie.',
                ),
                variant: 'error',
            });
        } finally {
            savingEventId.value = null;
        }
    }

    return { savingEventId, updateEventStatus };
}
