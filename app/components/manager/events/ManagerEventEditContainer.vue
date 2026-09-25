<script setup lang="ts">
import type { InstructorEvent } from '~/types/events/instructorEvent';
import { theoryEligibleRowToStudentListItem } from '~/utils/events/theoryEventEligibleStudents';

const { eventId, schoolId } = useManagerEventEditPage();

const loadedEvent = ref<InstructorEvent | null>(null);

const {
    formType,
    formStartLocal,
    formEndLocal,
    formStartDate,
    formStartHour,
    formStartMinute,
    formEndDate,
    formEndHour,
    formEndMinute,
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
    applyPrefill,
    parseCapacity,
    localDatetimeToIso,
    eventAvailabilityStatus,
    eventAvailabilityMessage,
    availableVehicleIds,
    isAvailabilityOptionsLoading,
    availabilityOptionsError,
    recheckEventAvailability,
    handleStartDateChange,
    handleStartHourChange,
    handleStartMinuteChange,
    handleEndDateChange,
    handleEndHourChange,
    handleEndMinuteChange,
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
    headerDateRangeLabel,
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
            :date-range-label="headerDateRangeLabel"
            :can-save="Boolean(loadedEvent) && isFormDirty"
            :is-availability-blocking="
                eventAvailabilityStatus === 'checking' ||
                eventAvailabilityStatus === 'unavailable'
            "
            :is-saving="isSaving"
            :is-delete-loading="isDeleteLoading"
        />

        <ManagerEventEditMissingSchoolNotice v-if="!schoolId" />

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
                :header-date-range-label="headerDateRangeLabel"
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
                :start-date="formStartDate"
                :start-hour="formStartHour"
                :start-minute="formStartMinute"
                :end-date="formEndDate"
                :end-hour="formEndHour"
                :end-minute="formEndMinute"
                :start-hour-options="startHourOptionsResolved"
                :start-minute-options="startMinuteOptionsResolved"
                :end-hour-options="endHourOptionsResolved"
                :end-minute-options="endMinuteOptionsResolved"
                :min-date="pickerMinDate"
                :max-date="pickerMaxDate"
                @submit="handleSubmit"
                @cancel="handleCancel"
                @delete="handleOpenDeleteDialog"
                @status-patched="handleEventStatusPatched"
                @start-date-change="handleStartDateChange"
                @start-hour-change="handleStartHourChange"
                @start-minute-change="handleStartMinuteChange"
                @end-date-change="handleEndDateChange"
                @end-hour-change="handleEndHourChange"
                @end-minute-change="handleEndMinuteChange"
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
            />

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
        />
    </div>
</template>
