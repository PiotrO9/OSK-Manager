import type { Ref } from 'vue';
import type { InstructorEvent } from '~/types/events/instructorEvent';
import { getApiFetchErrorMessage } from '~/utils/api/apiFetchErrorMessage';
import { getManagerEventEditErrorStatusCode } from '~/composables/events/managerEventEditErrors';

type FetchEventById = (
    id: string,
    options?: {
        includeSlots?: boolean;
        skipTheoryStudentsSubresource?: boolean;
    },
) => Promise<InstructorEvent>;

interface UseManagerEventEditParticipantsSaveInput {
    loadedEvent: Ref<InstructorEvent | null>;
    formStartLocal: Ref<string>;
    formEndLocal: Ref<string>;
    formError: Ref<string | null>;
    draftTheoryStudentUserIds: Ref<string[]>;
    replaceStudentsOnEvent: (
        id: string,
        studentUserIds: string[],
    ) => Promise<unknown>;
    fetchEventById: FetchEventById;
    applyPrefill: (ev: InstructorEvent) => void;
    syncFreeWindowsFromEvent: (ev: InstructorEvent) => void;
    resetStudentDraftFromEvent: (ev: InstructorEvent | null) => void;
    refreshEligibleForCurrentTime: () => Promise<void>;
    loadTheoryEligibleStudents: () => Promise<void>;
    sortedStudentIds: (ids: string[]) => string[];
    localDatetimeToIso: (local: string) => string | null;
}

export function useManagerEventEditParticipantsSave(
    input: UseManagerEventEditParticipantsSaveInput,
) {
    async function reloadAfterParticipantConflict(id: string): Promise<void> {
        const event = await input.fetchEventById(id, { includeSlots: true });

        input.loadedEvent.value = event;
        input.applyPrefill(event);
        input.syncFreeWindowsFromEvent(event);

        const startIso = input.localDatetimeToIso(input.formStartLocal.value);
        const endIso = input.localDatetimeToIso(input.formEndLocal.value);

        input.resetStudentDraftFromEvent(event);

        if (
            event.courseId?.trim() &&
            startIso &&
            endIso &&
            String(event.type ?? '')
                .trim()
                .toUpperCase() === 'THEORY'
        ) {
            await input.refreshEligibleForCurrentTime();

            return;
        }

        await input.loadTheoryEligibleStudents();
    }

    async function replaceDirtyParticipants(
        id: string,
        shouldRefreshSlotsAfterPatch: boolean,
    ): Promise<boolean> {
        try {
            await input.replaceStudentsOnEvent(
                id,
                input.sortedStudentIds(input.draftTheoryStudentUserIds.value),
            );

            return true;
        } catch (err: unknown) {
            const message = getApiFetchErrorMessage(
                err,
                'Nie udało się zapisać listy kursantów.',
            );

            if (getManagerEventEditErrorStatusCode(err) === 409) {
                try {
                    await reloadAfterParticipantConflict(id);
                } catch {
                    /* message below */
                }

                input.formError.value = shouldRefreshSlotsAfterPatch
                    ? 'Zmiany bloku zapisane, ale lista uczestników wymaga korekty — zdejmij lub zmień kursantów z kolizją grafiku i zapisz ponownie.'
                    : message;

                return false;
            }

            input.formError.value = message;

            return false;
        }
    }

    return {
        reloadAfterParticipantConflict,
        replaceDirtyParticipants,
    };
}
