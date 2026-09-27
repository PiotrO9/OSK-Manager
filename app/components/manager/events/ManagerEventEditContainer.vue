<script setup lang="ts">
import type { InstructorEvent } from '~/types/events/instructorEvent';
import { theoryEligibleRowToStudentListItem } from '~/utils/events/theoryEventEligibleStudents';

const { eventId } = useManagerEventEditPage();

const loadedEvent = ref<InstructorEvent | null>(null);
const eventInstructorId = computed(
    () => loadedEvent.value?.instructorId?.trim() ?? '',
);
const {
    schoolId: resolvedSchoolId,
    isSchoolContextLoading,
    schoolContextError,
    loadInstructorSchoolContext,
} = useManagerInstructorSchoolContext({ instructorId: eventInstructorId });
const schoolId = computed(() => resolvedSchoolId.value);

watch(
    eventInstructorId,
    () => {
        void loadInstructorSchoolContext();
    },
    { immediate: true },
);

const {
    formType,
    formStartLocal,
    formEndLocal,
    formVehicleId,
    formInstructorId,
    formCapacityInput,
    formError,
    isFormFieldsDirty,
    pickerMinDate,
    pickerMaxDate,
    startHourOptionsResolved,
    startMinuteOptionsResolved,
    endHourOptionsResolved,
    endMinuteOptionsResolved,
    availableStartTimes,
    availableEndTimes,
    applyPrefill,
    parseCapacity,
    localDatetimeToIso,
    eventAvailabilityStatus,
    eventAvailabilityMessage,
    availableVehicleIds,
    isAvailabilityOptionsLoading,
    availabilityOptionsError,
    recheckEventAvailability,
    handleDateChange,
    handleStartTimeChange,
    handleEndTimeChange,
} = useManagerEventEditForm({
    loadedEvent,
});

const {
    loadError,
    notFound,
    vehicles,
    vehiclesError,
    isVehiclesLoading,
    instructorsError,
    isInstructorsLoading,
    linkedCourseLabel,
    qualifiedInstructorsForEvent,
    instructorSelectLabel,
    isFetchLoading,
    fetchTheoryEventEligibleStudents,
    loadEvent,
} = useManagerEventEditData({
    eventId,
    schoolId,
    loadedEvent,
    formType,
    formInstructorId,
    applyPrefill,
});

const {
    theoryStudentsError,
    theoryEligibleData,
    theoryEligibleError,
    isTheoryEligibleLoading,
    theoryEligibleNoCourse,
    draftTheoryStudentUserIds,
    theoryCapacitySummary,
    studentAttendanceKnown,
    isTheoryStudentsDirty,
    capacityForStudentPicker,
    sortedStudentIds,
    isTheoryRowChecked,
    isTheoryEligibleRowInteractive,
    handleToggleTheoryStudent,
    reloadTheoryEligibleStudents,
    refreshEligibleForCurrentTime,
} = useManagerEventParticipants({
    eventId,
    loadedEvent,
    formStartLocal,
    formEndLocal,
    formCapacityInput,
    parseCapacity,
    localDatetimeToIso,
    fetchTheoryEventEligibleStudents,
});

const {
    deleteDialogOpen,
    deleteDialogTimeLabel,
    isFormDirty,
    isSaving,
    isDeleteLoading,
    scheduleBackHref,
    handleCancel,
    handleSubmit,
    handleOpenDeleteDialog,
    handleDeleteDialogCancel,
    handleDeleteDialogConfirm,
    handleEventStatusPatched,
} = useManagerEventEditActions({
    eventId,
    schoolId,
    loadedEvent,
    formType,
    formStartLocal,
    formEndLocal,
    formVehicleId,
    formInstructorId,
    formCapacityInput,
    formError,
    isFormFieldsDirty,
    isTheoryStudentsDirty,
    theoryStudentsError,
    studentAttendanceKnown,
    capacityForStudentPicker,
    draftTheoryStudentUserIds,
    parseCapacity,
    localDatetimeToIso,
    refreshEligibleForCurrentTime,
    sortedStudentIds,
    eventAvailabilityMessage,
    recheckEventAvailability,
});
</script>

<template>
    <div class="space-y-5">
        <ManagerEventEditHeader
            :can-save="Boolean(loadedEvent) && isFormDirty"
            :is-availability-blocking="
                eventAvailabilityStatus === 'checking' ||
                eventAvailabilityStatus === 'unavailable'
            "
            :is-saving="isSaving"
            :is-delete-loading="isDeleteLoading"
        />

        <ManagerEventEditMissingSchoolNotice
            v-if="loadedEvent && !schoolId"
            :is-loading="isSchoolContextLoading"
            :error="schoolContextError"
            @retry="loadInstructorSchoolContext"
        />

        <ManagerEventEditReturnErrorState
            v-if="!eventId"
            title="Nieprawidłowy identyfikator wydarzenia"
            description="Adres strony nie zawiera poprawnego ID wydarzenia."
        />

        <LoadingState
            v-else-if="isFetchLoading && !loadedEvent && !notFound"
            title="Wczytywanie wydarzenia"
            description="Pobieramy dane bloku, instruktora i dostępne okna grafiku."
        />

        <template v-else-if="notFound">
            <ManagerEventEditReturnErrorState
                title="Wydarzenie nie zostało znalezione"
                description="Serwer zwrócił 404 dla tego bloku czasu."
            />
        </template>

        <template v-else-if="loadError">
            <ErrorState
                title="Nie udało się wczytać wydarzenia"
                :description="loadError"
                @retry="loadEvent"
            />
        </template>

        <template v-else-if="loadedEvent">
            <ManagerEventEditFormSection
                v-model:instructor-id="formInstructorId"
                v-model:vehicle-id="formVehicleId"
                :event-id="loadedEvent.id"
                :event-status="loadedEvent.status"
                :form-type="formType"
                :school-id="schoolId"
                :form-error="formError"
                :event-availability-status="eventAvailabilityStatus"
                :event-availability-message="eventAvailabilityMessage"
                :available-vehicle-ids="availableVehicleIds"
                :is-availability-options-loading="isAvailabilityOptionsLoading"
                :availability-options-error="availabilityOptionsError"
                :is-saving="isSaving"
                :is-delete-loading="isDeleteLoading"
                :is-form-dirty="isFormDirty"
                :instructors="qualifiedInstructorsForEvent"
                :instructor-select-label="instructorSelectLabel"
                :is-instructors-loading="isInstructorsLoading"
                :instructors-error="instructorsError"
                :vehicles="vehicles"
                :is-vehicles-loading="isVehiclesLoading"
                :vehicles-error="vehiclesError"
                :date="formStartLocal.slice(0, 10)"
                :start-time="formStartLocal.slice(11, 16)"
                :end-time="formEndLocal.slice(11, 16)"
                :start-hour-options="startHourOptionsResolved"
                :start-minute-options="startMinuteOptionsResolved"
                :end-hour-options="endHourOptionsResolved"
                :end-minute-options="endMinuteOptionsResolved"
                :available-start-times="availableStartTimes"
                :available-end-times="availableEndTimes"
                :min-date="pickerMinDate"
                :max-date="pickerMaxDate"
                @submit="handleSubmit"
                @cancel="handleCancel"
                @status-patched="handleEventStatusPatched"
                @date-change="handleDateChange"
                @start-time-change="handleStartTimeChange"
                @end-time-change="handleEndTimeChange"
            />

            <ManagerEventTheoryStudentsSection
                v-if="formType === 'THEORY'"
                :loaded-event="loadedEvent"
                :linked-course-label="linkedCourseLabel"
                :theory-capacity-summary="theoryCapacitySummary"
                :form-capacity-input="formCapacityInput"
                :parse-capacity="parseCapacity"
                :student-attendance-known="studentAttendanceKnown"
                :theory-eligible-no-course="theoryEligibleNoCourse"
                :is-theory-eligible-loading="isTheoryEligibleLoading"
                :theory-eligible-error="theoryEligibleError"
                :theory-eligible-data="theoryEligibleData"
                :theory-students-error="theoryStudentsError"
                :is-saving="isSaving"
                :school-id="schoolId"
                :is-theory-row-checked="isTheoryRowChecked"
                :is-theory-eligible-row-interactive="
                    isTheoryEligibleRowInteractive
                "
                @toggle-student="
                    (row, checked) =>
                        handleToggleTheoryStudent(
                            theoryEligibleRowToStudentListItem(row),
                            checked,
                        )
                "
                @refresh-eligible="reloadTheoryEligibleStudents"
            />

            <section
                aria-label="Usuwanie wydarzenia"
                class="border-border bg-card rounded-lg border px-4 py-3 shadow-xs md:px-5"
            >
                <ManagerEventDeleteAction
                    :is-saving="isSaving"
                    :is-delete-loading="isDeleteLoading"
                    @delete="handleOpenDeleteDialog"
                />
            </section>

            <ManagerInstructorEventDeleteDialog
                v-model:open="deleteDialogOpen"
                :time-range-label="deleteDialogTimeLabel"
                :is-deleting="isDeleteLoading"
                @cancel="handleDeleteDialogCancel"
                @confirm="handleDeleteDialogConfirm"
            />
        </template>

        <ManagerEventEditBackLink
            v-if="loadedEvent || notFound"
            :to="scheduleBackHref"
            :label="
                typeof scheduleBackHref === 'object' &&
                scheduleBackHref.path === '/events'
                    ? 'Wróć do wydarzeń dnia'
                    : undefined
            "
        />
    </div>
</template>
