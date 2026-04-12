import type {
    AssignStudentsToEventResponse,
    RemoveStudentsFromEventResponse,
} from '~/types/event';
import { resolveBffEndpoint } from '~/utils/bffEndpoint';
import { unwrapApiSuccessData } from '~/utils/apiEnvelope';
import { getApiFetchErrorMessage } from '~/utils/apiFetchErrorMessage';

export function useEventApi() {
    const isAssigning = ref(false);
    const assignError = ref<string | null>(null);
    const isRemoving = ref(false);
    const removeError = ref<string | null>(null);

    async function assignStudentsToEvent(
        eventId: string,
        studentIds: string[],
    ): Promise<AssignStudentsToEventResponse> {
        const eid = eventId.trim();

        if (!eid) {
            throw new Error('Brak identyfikatora wydarzenia.');
        }

        if (studentIds.length === 0) {
            throw new Error('Wybierz co najmniej jednego kursanta.');
        }

        isAssigning.value = true;
        assignError.value = null;

        try {
            const raw = await $fetch<unknown>(
                resolveBffEndpoint(
                    `/api/events/${encodeURIComponent(eid)}/students`,
                ),
                {
                    method: 'POST',
                    credentials: 'include',
                    body: { studentIds },
                },
            );

            const data =
                unwrapApiSuccessData<AssignStudentsToEventResponse>(raw);

            if (
                typeof data.assigned !== 'number' ||
                typeof data.skipped !== 'number'
            ) {
                throw new Error('Nieprawidłowa odpowiedź serwera.');
            }

            return data;
        } catch (err: unknown) {
            assignError.value = getApiFetchErrorMessage(
                err,
                'Nie udało się przypisać kursantów.',
            );

            throw err;
        } finally {
            isAssigning.value = false;
        }
    }

    async function removeStudentsFromEvent(
        eventId: string,
        studentIds: string[],
    ): Promise<RemoveStudentsFromEventResponse> {
        const eid = eventId.trim();

        if (!eid) {
            throw new Error('Brak identyfikatora wydarzenia.');
        }

        if (studentIds.length === 0) {
            throw new Error(
                'Wybierz co najmniej jednego kursanta do usunięcia.',
            );
        }

        isRemoving.value = true;
        removeError.value = null;

        try {
            const raw = await $fetch<unknown>(
                resolveBffEndpoint(
                    `/api/events/${encodeURIComponent(eid)}/students`,
                ),
                {
                    method: 'DELETE',
                    credentials: 'include',
                    body: { studentIds },
                },
            );

            const data =
                unwrapApiSuccessData<RemoveStudentsFromEventResponse>(raw);

            if (typeof data.removed !== 'number') {
                throw new Error('Nieprawidłowa odpowiedź serwera.');
            }

            return data;
        } catch (err: unknown) {
            removeError.value = getApiFetchErrorMessage(
                err,
                'Nie udało się usunąć kursantów z wydarzenia.',
            );

            throw err;
        } finally {
            isRemoving.value = false;
        }
    }

    return {
        isAssigning: readonly(isAssigning),
        assignError: readonly(assignError),
        isRemoving: readonly(isRemoving),
        removeError: readonly(removeError),
        assignStudentsToEvent,
        removeStudentsFromEvent,
    };
}
