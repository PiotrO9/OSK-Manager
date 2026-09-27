import type { Ref } from 'vue';
import type {
    InstructorEvent,
    PatchInstructorEventPayload,
} from '~/types/events/instructorEvent';
import { getApiFetchErrorMessage } from '~/utils/api/apiFetchErrorMessage';
import type { ScheduleAvailabilityStatus } from '~/types/schedule/scheduleAvailability';

interface UseManagerEventEditFieldSaveInput {
    loadedEvent: Ref<InstructorEvent | null>;
    formType: Ref<'THEORY' | 'DRIVE'>;
    formStartLocal: Ref<string>;
    formEndLocal: Ref<string>;
    formVehicleId: Ref<string>;
    formInstructorId: Ref<string>;
    formCapacityInput: Ref<string | number>;
    formError: Ref<string | null>;
    updateInstructorEvent: (
        id: string,
        payload: PatchInstructorEventPayload,
    ) => Promise<InstructorEvent>;
    parseCapacity: (raw: unknown) => number | null | false;
    localDatetimeToIso: (local: string) => string | null;
    eventAvailabilityMessage: Ref<string>;
    recheckEventAvailability: () => Promise<ScheduleAvailabilityStatus>;
}

export function useManagerEventEditFieldSave(
    input: UseManagerEventEditFieldSaveInput,
) {
    async function updateDirtyEventFields(id: string): Promise<boolean> {
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

        if (
            input.formStartLocal.value.slice(0, 10) !==
            input.formEndLocal.value.slice(0, 10)
        ) {
            input.formError.value =
                'Początek i koniec wydarzenia muszą przypadać tego samego dnia.';

            return false;
        }

        const type = input.formType.value;

        if (type === 'DRIVE') {
            const vehicleId = input.formVehicleId.value.trim();

            if (!vehicleId) {
                input.formError.value = 'Dla jazdy wybierz pojazd.';

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

        const availabilityStatus = await input.recheckEventAvailability();

        if (availabilityStatus === 'unavailable') {
            input.formError.value =
                input.eventAvailabilityMessage.value ||
                'Wybrany termin jest niedostępny.';

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

            return true;
        } catch (err: unknown) {
            const message = getApiFetchErrorMessage(
                err,
                'Nie udało się zapisać zmian.',
            );

            input.formError.value = message;

            return false;
        }
    }

    return {
        updateDirtyEventFields,
    };
}
