import type { ComputedRef, Ref } from 'vue';
import type { InstructorEvent } from '~/types/events/instructorEvent';
import type { ScheduleAvailabilityStatus } from '~/types/schedule/scheduleAvailability';
import { buildEventsDayReturnRoute } from '~/utils/events/eventsDayNavigation';
import { useManagerEventEditActionLabels } from './useManagerEventEditActionLabels';
import { useManagerEventEditDeleteAction } from './useManagerEventEditDeleteAction';
import { useManagerEventEditFieldSave } from './useManagerEventEditFieldSave';
import { useManagerEventEditParticipantsSave } from './useManagerEventEditParticipantsSave';

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
    isFormFieldsDirty: ComputedRef<boolean>;
    isTheoryStudentsDirty: ComputedRef<boolean>;
    theoryStudentsError: Ref<string | null>;
    studentAttendanceKnown: ComputedRef<boolean>;
    capacityForStudentPicker: ComputedRef<number | null>;
    draftTheoryStudentUserIds: Ref<string[]>;
    parseCapacity: (raw: unknown) => number | null | false;
    localDatetimeToIso: (local: string) => string | null;
    refreshEligibleForCurrentTime: () => Promise<void>;
    sortedStudentIds: (ids: string[]) => string[];
    eventAvailabilityMessage: Ref<string>;
    recheckEventAvailability: () => Promise<ScheduleAvailabilityStatus>;
}) {
    const {
        updateInstructorEvent,
        deleteInstructorEvent,
        isUpdateLoading,
        isDeleteLoading,
    } = useInstructorEventsApi();
    const {
        replaceStudentsOnEvent,
        checkStudentsAvailability,
        isReplacing,
        isCheckingStudentsAvailability,
    } = useEventApi();
    const { addToast } = useAppToast();
    const route = useRoute();

    const isFormDirty = computed(
        () =>
            input.isFormFieldsDirty.value || input.isTheoryStudentsDirty.value,
    );
    const isSaving = computed(
        () =>
            isUpdateLoading.value ||
            isReplacing.value ||
            isCheckingStudentsAvailability.value,
    );

    const {
        scheduleBackHref: defaultScheduleBackHref,
        deleteDialogTimeLabel,
        headerDateRangeLabel,
    } = useManagerEventEditActionLabels({
        schoolId: input.schoolId,
        loadedEvent: input.loadedEvent,
        formStartLocal: input.formStartLocal,
        formEndLocal: input.formEndLocal,
        formInstructorId: input.formInstructorId,
    });
    const scheduleBackHref = computed(
        () =>
            buildEventsDayReturnRoute(
                route.query.from,
                route.query.date,
                input.schoolId.value,
            ) ?? defaultScheduleBackHref.value,
    );

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
        formStartLocal: input.formStartLocal,
        formEndLocal: input.formEndLocal,
        formError: input.formError,
        draftTheoryStudentUserIds: input.draftTheoryStudentUserIds,
        replaceStudentsOnEvent,
        checkStudentsAvailability,
        refreshEligibleForCurrentTime: input.refreshEligibleForCurrentTime,
        sortedStudentIds: input.sortedStudentIds,
        localDatetimeToIso: input.localDatetimeToIso,
    });
    const { updateDirtyEventFields } = useManagerEventEditFieldSave({
        loadedEvent: input.loadedEvent,
        formType: input.formType,
        formStartLocal: input.formStartLocal,
        formEndLocal: input.formEndLocal,
        formVehicleId: input.formVehicleId,
        formInstructorId: input.formInstructorId,
        formCapacityInput: input.formCapacityInput,
        formError: input.formError,
        updateInstructorEvent,
        parseCapacity: input.parseCapacity,
        localDatetimeToIso: input.localDatetimeToIso,
        eventAvailabilityMessage: input.eventAvailabilityMessage,
        recheckEventAvailability: input.recheckEventAvailability,
    });

    function handleCancel(): void {
        void navigateTo(scheduleBackHref.value);
    }

    async function handleSubmit(): Promise<void> {
        if (isSaving.value) {
            return;
        }

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

        if (fieldsDirty) {
            const didUpdate = await updateDirtyEventFields(id);

            if (!didUpdate) {
                return;
            }
        }

        if (participantsDirty) {
            const didReplace = await replaceDirtyParticipants(id, fieldsDirty);

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
