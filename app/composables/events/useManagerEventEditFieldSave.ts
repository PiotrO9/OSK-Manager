import type { Ref } from 'vue';
import type {
    FreeWindow,
    InstructorEvent,
    PatchInstructorEventPayload,
} from '~/types/events/instructorEvent';
import { getApiFetchErrorMessage } from '~/utils/api/apiFetchErrorMessage';
import { isSlotWithinFreeWindows } from '~/utils/schedule/freeWindows';
import {
    getManagerEventEditErrorStatusCode,
    isPatchParticipantConflict,
} from '~/composables/events/managerEventEditErrors';

interface UseManagerEventEditFieldSaveInput {
    loadedEvent: Ref<InstructorEvent | null>;
    formType: Ref<'THEORY' | 'DRIVE'>;
    formStartLocal: Ref<string>;
    formEndLocal: Ref<string>;
    formVehicleId: Ref<string>;
    formInstructorId: Ref<string>;
    formCapacityInput: Ref<string | number>;
    formError: Ref<string | null>;
    freeWindows: Ref<FreeWindow[]>;
    freeWindowsUnavailable: Ref<boolean>;
    updateInstructorEvent: (
        id: string,
        payload: PatchInstructorEventPayload,
    ) => Promise<InstructorEvent>;
    parseCapacity: (raw: unknown) => number | null | false;
    localDatetimeToIso: (local: string) => string | null;
    refreshFreeWindowsFromSlots: (date: string) => Promise<void>;
}

export function useManagerEventEditFieldSave(
    input: UseManagerEventEditFieldSaveInput,
) {
    async function updateDirtyEventFields(
        id: string,
        shouldRefreshSlotsAfterPatch: boolean,
    ): Promise<boolean> {
        const startIso = input.localDatetimeToIso(input.formStartLocal.value);
        const endIso = input.localDatetimeToIso(input.formEndLocal.value);

        if (!startIso || !endIso) {
            input.formError.value =
                'Podaj początek i koniec bloku (data i godzina).';

            return false;
        }

        if (new Date(startIso).getTime() >= new Date(endIso).getTime()) {
            input.formError.value = 'Koniec musi być później niż początek.';

            return false;
        }

        if (shouldRefreshSlotsAfterPatch) {
            const start = new Date(startIso);
            const end = new Date(endIso);

            if (
                input.freeWindowsUnavailable.value ||
                !isSlotWithinFreeWindows(input.freeWindows.value, start, end)
            ) {
                input.formError.value = input.freeWindowsUnavailable.value
                    ? 'Instruktor nie ma dostępności w tym dniu — zmień datę lub instruktora.'
                    : 'Wybrany przedział czasu nie mieści się w wolnym oknie grafiku instruktora.';

                return false;
            }
        }

        const type = input.formType.value;

        if (type === 'DRIVE') {
            const vehicleId = input.formVehicleId.value.trim();

            if (!vehicleId) {
                input.formError.value =
                    'Dla jazdy wybierz pojazd (parametr ?schoolId= w adresie strony i lista pojazdów OSK).';

                return false;
            }
        }

        const instructorId = input.formInstructorId.value.trim();

        if (!instructorId) {
            input.formError.value = 'Wybierz instruktora.';

            return false;
        }

        const capacity = input.parseCapacity(input.formCapacityInput.value);

        if (capacity === false) {
            input.formError.value =
                'Limit miejsc musi być liczbą całkowitą ≥ 0 lub puste (bez limitu).';

            return false;
        }

        const payload: PatchInstructorEventPayload = {
            instructorId,
            type,
            startTime: startIso,
            endTime: endIso,
            vehicleId:
                type === 'DRIVE' ? input.formVehicleId.value.trim() : null,
            capacity,
        };

        try {
            const updated = await input.updateInstructorEvent(id, payload);
            const previous = input.loadedEvent.value;

            if (previous) {
                input.loadedEvent.value = {
                    ...previous,
                    ...updated,
                    studentUserIds: previous.studentUserIds,
                    studentAttendanceKnown: previous.studentAttendanceKnown,
                    students: previous.students,
                };
            }

            if (shouldRefreshSlotsAfterPatch) {
                const date = input.formStartLocal.value.trim().slice(0, 10);

                if (date) {
                    await input.refreshFreeWindowsFromSlots(date);
                }
            }

            return true;
        } catch (err: unknown) {
            const message = getApiFetchErrorMessage(
                err,
                'Nie udało się zapisać zmian.',
            );

            if (
                getManagerEventEditErrorStatusCode(err) === 409 &&
                !isPatchParticipantConflict(err)
            ) {
                const date = input.formStartLocal.value.trim().slice(0, 10);

                if (date) {
                    await input.refreshFreeWindowsFromSlots(date);
                }
            }

            input.formError.value = message;

            return false;
        }
    }

    return {
        updateDirtyEventFields,
    };
}
