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

    const deleteDialogOpen = ref(false);
    const isFormDirty = computed(
        () =>
            input.isFormFieldsDirty.value || input.isTheoryStudentsDirty.value,
    );
    const isSaving = computed(() => isUpdateLoading.value || isReplacing.value);

    const scheduleBackHref = computed(() => {
        const instructorId =
            input.formInstructorId.value.trim() ||
            input.loadedEvent.value?.instructorId?.trim();
        const schoolId = input.schoolId.value;

        if (!instructorId) {
            return '/manager/instructors';
        }

        if (schoolId) {
            return {
                path: `/manager/instructors/${instructorId}/schedule`,
                query: { schoolId },
            };
        }

        return `/manager/instructors/${instructorId}/schedule`;
    });

    const deleteDialogTimeLabel = computed(() => {
        const startRaw = input.formStartLocal.value.trim();
        const endRaw = input.formEndLocal.value.trim();

        if (!startRaw || !endRaw) {
            return '';
        }

        const start = new Date(startRaw);
        const end = new Date(endRaw);

        if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
            return '';
        }

        const formatter = new Intl.DateTimeFormat('pl-PL', {
            dateStyle: 'short',
            timeStyle: 'short',
        });

        return `${formatter.format(start)} — ${formatter.format(end)}`;
    });

    const headerDateRangeLabel = computed(() => {
        const startRaw = input.formStartLocal.value.trim();
        const endRaw = input.formEndLocal.value.trim();

        if (!startRaw || !endRaw) {
            return 'Termin';
        }

        const start = new Date(startRaw);
        const end = new Date(endRaw);

        if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
            return 'Termin';
        }

        const sameDay = start.toDateString() === end.toDateString();
        const sameMonth =
            start.getFullYear() === end.getFullYear() &&
            start.getMonth() === end.getMonth();
        const dayFormatter = new Intl.DateTimeFormat('pl-PL', {
            day: '2-digit',
        });
        const monthFormatter = new Intl.DateTimeFormat('pl-PL', {
            month: 'long',
        });
        const compactFormatter = new Intl.DateTimeFormat('pl-PL', {
            day: '2-digit',
            month: 'short',
        });

        if (sameDay) {
            return `${dayFormatter.format(start)} ${monthFormatter.format(start)}`;
        }

        if (sameMonth) {
            return `${dayFormatter.format(start)}-${dayFormatter.format(end)} ${monthFormatter.format(end)}`;
        }

        return `${compactFormatter.format(start)} - ${compactFormatter.format(end)}`;
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
            await replaceStudentsOnEvent(
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

    function handleOpenDeleteDialog(): void {
        deleteDialogOpen.value = true;
    }

    function handleDeleteDialogCancel(): void {
        deleteDialogOpen.value = false;
    }

    async function handleDeleteDialogConfirm(): Promise<void> {
        const id = input.eventId.value.trim();

        if (!id) {
            return;
        }

        try {
            await deleteInstructorEvent(id);

            addToast({
                title: 'Usunięto blok czasu',
                description: 'Blok został usunięty z harmonogramu.',
                variant: 'success',
            });

            deleteDialogOpen.value = false;
            await navigateTo(scheduleBackHref.value);
        } catch (err: unknown) {
            addToast({
                title: 'Nie udało się usunąć wydarzenia',
                description: getApiFetchErrorMessage(
                    err,
                    'Spróbuj ponownie lub wróć do terminarza.',
                ),
                variant: 'error',
            });
        }
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
        isDeleteLoading,
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
