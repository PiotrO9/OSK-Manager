import type { Ref } from 'vue';
import type { EventStudentsAvailabilityResponse } from '~/types/events/event';
import { getApiFetchErrorMessage } from '~/utils/api/apiFetchErrorMessage';
import { getManagerEventEditErrorStatusCode } from '~/composables/events/managerEventEditErrors';

interface UseManagerEventEditParticipantsSaveInput {
    formStartLocal: Ref<string>;
    formEndLocal: Ref<string>;
    formError: Ref<string | null>;
    draftTheoryStudentUserIds: Ref<string[]>;
    replaceStudentsOnEvent: (
        id: string,
        studentUserIds: string[],
    ) => Promise<unknown>;
    checkStudentsAvailability: (
        id: string,
        body: {
            studentIds: string[];
            startTime?: string;
            endTime?: string;
        },
    ) => Promise<EventStudentsAvailabilityResponse>;
    refreshEligibleForCurrentTime: () => Promise<void>;
    sortedStudentIds: (ids: string[]) => string[];
    localDatetimeToIso: (local: string) => string | null;
}

export function useManagerEventEditParticipantsSave(
    input: UseManagerEventEditParticipantsSaveInput,
) {
    async function replaceDirtyParticipants(
        id: string,
        eventFieldsWereSaved: boolean,
    ): Promise<boolean> {
        const studentIds = input.sortedStudentIds(
            input.draftTheoryStudentUserIds.value,
        );
        const startTime = input.localDatetimeToIso(input.formStartLocal.value);
        const endTime = input.localDatetimeToIso(input.formEndLocal.value);

        try {
            const preflight = await input.checkStudentsAvailability(id, {
                studentIds,
                ...(startTime && endTime ? { startTime, endTime } : {}),
            });

            if (!preflight.available) {
                try {
                    await input.refreshEligibleForCurrentTime();
                } catch {
                    /* keep the preflight result as the primary error */
                }

                const message =
                    preflight.issues[0]?.message ??
                    'Lista kursantów wymaga korekty.';

                input.formError.value = eventFieldsWereSaved
                    ? `Zmiany bloku zapisane, ale lista uczestników wymaga korekty. ${message}`
                    : message;

                return false;
            }

            await input.replaceStudentsOnEvent(id, studentIds);

            return true;
        } catch (err: unknown) {
            const message = getApiFetchErrorMessage(
                err,
                'Nie udało się zapisać listy kursantów.',
            );

            if (getManagerEventEditErrorStatusCode(err) === 409) {
                try {
                    await input.refreshEligibleForCurrentTime();
                } catch {
                    /* message below */
                }

                input.formError.value = eventFieldsWereSaved
                    ? 'Zmiany bloku zapisane, ale lista uczestników wymaga korekty — zdejmij lub zmień kursantów z kolizją grafiku i zapisz ponownie.'
                    : message;

                return false;
            }

            input.formError.value = message;

            return false;
        }
    }

    return {
        replaceDirtyParticipants,
    };
}
