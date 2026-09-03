import type { ComputedRef, Ref } from 'vue';
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
import { useManagerEventEditActionLabels } from './useManagerEventEditActionLabels';
import { useManagerEventEditDeleteAction } from './useManagerEventEditDeleteAction';
import { useManagerEventEditParticipantsSave } from './useManagerEventEditParticipantsSave';

type FetchEventById = (
    id: string,
    options?: {
        includeSlots?: boolean;
        skipTheoryStudentsSubresource?: boolean;
    },
) => Promise<InstructorEvent>;

export function useManagerEventEditActions(input: {
    eventId: ComputedRef<string>;
    schoolId: ComputedRef<string>;
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
    isFormFieldsDirty: ComputedRef<boolean>;
    isTheoryStudentsDirty: ComputedRef<boolean>;
    theoryStudentsError: Ref<string | null>;
    studentAttendanceKnown: ComputedRef<boolean>;
    capacityForStudentPicker: ComputedRef<number | null>;
    draftTheoryStudentUserIds: Ref<string[]>;
    parseCapacity: (raw: unknown) => number | null | false;
    localDatetimeToIso: (local: string) => string | null;
    needsTimeOrInstructorSlotValidation: () => boolean;
    refreshFreeWindowsFromSlots: (date: string) => Promise<void>;
    fetchEventById: FetchEventById;
    applyPrefill: (ev: InstructorEvent) => void;
    syncFreeWindowsFromEvent: (ev: InstructorEvent) => void;
    resetStudentDraftFromEvent: (ev: InstructorEvent | null) => void;
    refreshEligibleForCurrentTime: () => Promise<void>;
    loadTheoryEligibleStudents: () => Promise<void>;
    sortedStudentIds: (ids: string[]) => string[];
}) {
    const {
        updateInstructorEvent,
        deleteInstructorEvent,
        isUpdateLoading,
        isDeleteLoading,
    } = useInstructorEventsApi();
    const { replaceStudentsOnEvent, isReplacing } = useEventApi();
    const { addToast } = useAppToast();

    const isFormDirty = computed(
        () =>
            input.isFormFieldsDirty.value || input.isTheoryStudentsDirty.value,
    );
    const isSaving = computed(() => isUpdateLoading.value || isReplacing.value);

    const { scheduleBackHref, deleteDialogTimeLabel, headerDateRangeLabel } =
        useManagerEventEditActionLabels({
            schoolId: input.schoolId,
            loadedEvent: input.loadedEvent,
            formStartLocal: input.formStartLocal,
            formEndLocal: input.formEndLocal,
            formInstructorId: input.formInstructorId,
        });

    const {
        deleteDialogOpen,
        isDeleteLoading: deleteActionLoading,
        handleOpenDeleteDialog,
        handleDeleteDialogCancel,
        handleDeleteDialogConfirm,
    } = useManagerEventEditDeleteAction({
        eventId: input.eventId,
        scheduleBackHref,
        isDeleteLoading,
        deleteInstructorEvent,
        addToast,
    });
    const { replaceDirtyParticipants } = useManagerEventEditParticipantsSave({
        loadedEvent: input.loadedEvent,
        formStartLocal: input.formStartLocal,
        formEndLocal: input.formEndLocal,
        formError: input.formError,
        draftTheoryStudentUserIds: input.draftTheoryStudentUserIds,
        replaceStudentsOnEvent,
        fetchEventById: input.fetchEventById,
        applyPrefill: input.applyPrefill,
        syncFreeWindowsFromEvent: input.syncFreeWindowsFromEvent,
        resetStudentDraftFromEvent: input.resetStudentDraftFromEvent,
        refreshEligibleForCurrentTime: input.refreshEligibleForCurrentTime,
        loadTheoryEligibleStudents: input.loadTheoryEligibleStudents,
        sortedStudentIds: input.sortedStudentIds,
        localDatetimeToIso: input.localDatetimeToIso,
    });

    function handleCancel(): void {
        void navigateTo(scheduleBackHref.value);
    }

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
            const updated = await updateInstructorEvent(id, payload);
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

    async function handleSubmit(): Promise<void> {
        input.formError.value = null;
        input.theoryStudentsError.value = null;

        if (!isFormDirty.value) {
            return;
        }

        const id = input.eventId.value.trim();

        if (!id) {
            input.formError.value = 'Brak identyfikatora wydarzenia.';

            return;
        }

        const fieldsDirty = input.isFormFieldsDirty.value;
        const participantsDirty = input.isTheoryStudentsDirty.value;

        if (participantsDirty) {
            if (!input.studentAttendanceKnown.value) {
                input.formError.value =
                    'Brak danych o zapisanych kursantach — nie można zapisać listy.';

                return;
            }

            const capacity = input.capacityForStudentPicker.value;

            if (
                capacity !== null &&
                input.draftTheoryStudentUserIds.value.length >
                    Math.trunc(capacity)
            ) {
                input.formError.value =
                    'Liczba zaznaczonych kursantów przekracza limit miejsc bloku.';

                return;
            }
        }

        const shouldRefreshSlotsAfterPatch =
            input.needsTimeOrInstructorSlotValidation();

        if (fieldsDirty) {
            const didUpdate = await updateDirtyEventFields(
                id,
                shouldRefreshSlotsAfterPatch,
            );

            if (!didUpdate) {
                return;
            }
        }

        if (participantsDirty) {
            const didReplace = await replaceDirtyParticipants(
                id,
                shouldRefreshSlotsAfterPatch,
            );

            if (!didReplace) {
                return;
            }
        }

        addToast({
            title: 'Zapisano zmiany',
            description: 'Wydarzenie zostało zaktualizowane.',
            variant: 'success',
        });

        await navigateTo(scheduleBackHref.value);
    }

    function handleEventStatusPatched(status: string): void {
        const event = input.loadedEvent.value;

        if (!event) {
            return;
        }

        input.loadedEvent.value = { ...event, status };
    }

    return {
        deleteDialogOpen,
        deleteDialogTimeLabel,
        headerDateRangeLabel,
        isFormDirty,
        isSaving,
        isUpdateLoading,
        isDeleteLoading: deleteActionLoading,
        isReplacing,
        scheduleBackHref,
        handleCancel,
        handleSubmit,
        handleOpenDeleteDialog,
        handleDeleteDialogCancel,
        handleDeleteDialogConfirm,
        handleEventStatusPatched,
    };
}
