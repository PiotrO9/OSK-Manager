import type {
    AssignStudentsToEventResponse,
    RemoveStudentsFromEventResponse,
    ReplaceStudentsOnEventResponse,
} from '~/types/events/event';
import { getApiFetchErrorMessage } from '~/utils/api/apiFetchErrorMessage';

function isAssignResponse(
    data: unknown,
): data is AssignStudentsToEventResponse {
    if (!data || typeof data !== 'object') {
        return false;
    }

    const raw = data as Partial<AssignStudentsToEventResponse>;

    return typeof raw.assigned === 'number' && typeof raw.skipped === 'number';
}

function isStudentIdsResponse(
    data: unknown,
): data is RemoveStudentsFromEventResponse & ReplaceStudentsOnEventResponse {
    return (
        !!data &&
        typeof data === 'object' &&
        Array.isArray((data as { studentUserIds?: unknown }).studentUserIds)
    );
}

export function useEventApi() {
    const isAssigning = ref(false);
    const assignError = ref<string | null>(null);
    const isRemoving = ref(false);
    const removeError = ref<string | null>(null);
    const isReplacing = ref(false);
    const replaceError = ref<string | null>(null);

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
            return await requestBffData<AssignStudentsToEventResponse>(
                'POST',
                `/api/events/${encodeURIComponent(eid)}/students`,
                {
                    body: { studentIds },
                    fallbackMessage: 'Nie udało się przypisać kursantów.',
                    invalidMessage: 'Nieprawidłowa odpowiedź serwera.',
                    normalize: (data) => (isAssignResponse(data) ? data : null),
                },
            );
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
            let last: RemoveStudentsFromEventResponse | null = null;

            for (const sid of studentIds) {
                const uid = sid.trim();

                if (!uid) {
                    continue;
                }

                last = await requestBffData<RemoveStudentsFromEventResponse>(
                    'DELETE',
                    `/api/events/${encodeURIComponent(eid)}/students/${encodeURIComponent(uid)}`,
                    {
                        fallbackMessage:
                            'Nie udało się usunąć kursantów z wydarzenia.',
                        invalidMessage: 'Nieprawidłowa odpowiedź serwera.',
                        normalize: (data) =>
                            isStudentIdsResponse(data) ? data : null,
                    },
                );
            }

            if (!last) {
                throw new Error('Brak identyfikatorów kursantów do usunięcia.');
            }

            return last;
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

    async function replaceStudentsOnEvent(
        eventId: string,
        studentIds: string[],
    ): Promise<ReplaceStudentsOnEventResponse> {
        const eid = eventId.trim();

        if (!eid) {
            throw new Error('Brak identyfikatora wydarzenia.');
        }

        isReplacing.value = true;
        replaceError.value = null;

        try {
            return await requestBffData<ReplaceStudentsOnEventResponse>(
                'PUT',
                `/api/events/${encodeURIComponent(eid)}/students`,
                {
                    body: { studentIds },
                    fallbackMessage: 'Nie udało się zapisać listy kursantów.',
                    invalidMessage: 'Nieprawidłowa odpowiedź serwera.',
                    normalize: (data) =>
                        isStudentIdsResponse(data) ? data : null,
                },
            );
        } catch (err: unknown) {
            replaceError.value = getApiFetchErrorMessage(
                err,
                'Nie udało się zapisać listy kursantów.',
            );

            throw err;
        } finally {
            isReplacing.value = false;
        }
    }

    return {
        isAssigning: readonly(isAssigning),
        assignError: readonly(assignError),
        isRemoving: readonly(isRemoving),
        removeError: readonly(removeError),
        isReplacing: readonly(isReplacing),
        replaceError: readonly(replaceError),
        assignStudentsToEvent,
        removeStudentsFromEvent,
        replaceStudentsOnEvent,
    };
}
