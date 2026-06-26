<script setup lang="ts">
import type { FreeWindow, InstructorEvent } from '~/types/instructorEvent';
import { theoryEligibleRowToStudentListItem } from '~/utils/theoryEventEligibleStudents';

const { eventId, schoolId } = useManagerEventEditPage();

const loadedEvent = ref<InstructorEvent | null>(null);
const freeWindows = ref<FreeWindow[]>([]);
const freeWindowsUnavailable = ref(false);

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
    currentFormDate,
    pickerMinDate,
    pickerMaxDate,
    startHourOptionsResolved,
    startMinuteOptionsResolved,
    endHourOptionsResolved,
    endMinuteOptionsResolved,
    applyPrefill,
    parseCapacity,
    localDatetimeToIso,
    needsTimeOrInstructorSlotValidation,
    handleStartDateChange,
    handleStartHourChange,
    handleStartMinuteChange,
    handleEndDateChange,
    handleEndHourChange,
    handleEndMinuteChange,
} = useManagerEventEditForm({
    loadedEvent,
    freeWindows,
    freeWindowsUnavailable,
});

const {
    isSlotsLoading,
    syncFreeWindowsFromEvent,
    refreshFreeWindowsFromSlots,
    skipNextSlotsRefresh,
} = useManagerEventSlots({
    formInstructorId,
    currentFormDate,
    freeWindows,
    freeWindowsUnavailable,
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
    fetchEventById,
    fetchTheoryEventEligibleStudents,
    loadEvent,
} = useManagerEventEditData({
    eventId,
    schoolId,
    loadedEvent,
    formType,
    formInstructorId,
    applyPrefill,
    syncFreeWindowsFromEvent,
    skipNextSlotsRefresh,
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
    loadTheoryEligibleStudents,
    resetStudentDraftFromEvent,
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
    freeWindows,
    freeWindowsUnavailable,
    isFormFieldsDirty,
    isTheoryStudentsDirty,
    theoryStudentsError,
    studentAttendanceKnown,
    capacityForStudentPicker,
    draftTheoryStudentUserIds,
    parseCapacity,
    localDatetimeToIso,
    needsTimeOrInstructorSlotValidation,
    refreshFreeWindowsFromSlots,
    fetchEventById,
    applyPrefill,
    syncFreeWindowsFromEvent,
    resetStudentDraftFromEvent,
    refreshEligibleForCurrentTime,
    loadTheoryEligibleStudents,
    sortedStudentIds,
});
</script>

<template>
    <div class="space-y-5">
        <ManagerEventEditHeader
            :date-range-label="headerDateRangeLabel"
            :can-save="Boolean(loadedEvent) && isFormDirty"
            :is-saving="isSaving"
            :is-delete-loading="isDeleteLoading"
        />

        <p
            v-if="!schoolId"
            class="border-border rounded-xl border border-dashed bg-amber-50/60 px-4 py-3 text-sm text-amber-800 dark:bg-amber-950/20 dark:text-amber-300"
            role="status"
        >
            Dodaj <code class="text-xs">?schoolId=</code> w adresie, aby wybrać
            pojazd przy jazdzie, zmienić instruktora i zarządzać kursantami w
            teorii.
        </p>

        <ErrorState
            v-if="!eventId"
            title="Nieprawidłowy identyfikator wydarzenia"
            description="Adres strony nie zawiera poprawnego ID wydarzenia."
        >
            <template #action>
                <UiButton as-child variant="outline" class="bg-background">
                    <NuxtLink to="/manager/instructors">
                        Wróć do listy instruktorów
                    </NuxtLink>
                </UiButton>
            </template>
        </ErrorState>

        <LoadingState
            v-else-if="isFetchLoading && !loadedEvent && !notFound"
            title="Wczytywanie wydarzenia"
            description="Pobieramy dane bloku, instruktora i dostępne okna grafiku."
        />

        <template v-else-if="notFound">
            <ErrorState
                title="Wydarzenie nie zostało znalezione"
                description="Serwer zwrócił 404 dla tego bloku czasu."
            >
                <template #action>
                    <UiButton as-child variant="outline" class="bg-background">
                        <NuxtLink to="/manager/instructors">
                            Wróć do listy instruktorów
                        </NuxtLink>
                    </UiButton>
                </template>
            </ErrorState>
        </template>

        <template v-else-if="loadError">
            <ErrorState
                title="Nie udało się wczytać wydarzenia"
                :description="loadError"
                @retry="loadEvent"
            />
        </template>

        <template v-else-if="loadedEvent">
            <FormSection
                title="Edytuj wydarzenie"
                description="Formularz podzielony na logiczne sekcje, bez zmiany walidacji i flow."
            >
                <div class="mb-4 flex justify-end">
                    <UiBadge
                        variant="outline"
                        class="rounded-full border-sky-200 bg-sky-50 px-3 py-1 text-sky-700"
                    >
                        FormSection
                    </UiBadge>
                </div>

                <div class="mb-5 max-w-sm space-y-2">
                    <p class="text-muted-foreground text-xs">
                        Status wydarzenia
                    </p>
                    <ManagerEventStatusSelect
                        :event-id="loadedEvent.id"
                        :status="loadedEvent.status"
                        @update:status="handleEventStatusPatched"
                    />
                </div>

                <form
                    id="event-edit-form"
                    class="space-y-5"
                    aria-label="Formularz edycji wydarzenia"
                    :aria-busy="isSaving"
                    @submit.prevent="handleSubmit"
                >
                    <ManagerEventResourceFields
                        v-model:instructor-id="formInstructorId"
                        v-model:vehicle-id="formVehicleId"
                        :event-type="formType"
                        :school-id="schoolId"
                        :instructors="qualifiedInstructorsForEvent"
                        :instructor-select-label="instructorSelectLabel"
                        :is-instructors-loading="isInstructorsLoading"
                        :instructors-error="instructorsError"
                        :vehicles="vehicles"
                        :is-vehicles-loading="isVehiclesLoading"
                        :vehicles-error="vehiclesError"
                        :is-saving="isSaving"
                    />
                    <ManagerEventTimeFields
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
                        :is-saving="isSaving"
                        @start-date-change="handleStartDateChange"
                        @start-hour-change="handleStartHourChange"
                        @start-minute-change="handleStartMinuteChange"
                        @end-date-change="handleEndDateChange"
                        @end-hour-change="handleEndHourChange"
                        @end-minute-change="handleEndMinuteChange"
                    />

                    <p
                        v-if="isSlotsLoading"
                        class="text-muted-foreground text-xs"
                        role="status"
                    >
                        Aktualizacja dostępnych okien grafiku...
                    </p>
                    <p
                        v-if="freeWindowsUnavailable"
                        class="border-border rounded-md border border-dashed px-3 py-2 text-sm text-amber-700 dark:text-amber-500"
                        role="alert"
                    >
                        Instruktor nie ma dostępności w tym dniu - zmień datę
                        lub instruktora, aby wybrać godziny bloku.
                    </p>

                    <p
                        v-if="formError"
                        class="text-destructive text-sm"
                        role="alert"
                    >
                        {{ formError }}
                    </p>

                    <ManagerEventEditActions
                        :is-saving="isSaving"
                        :is-delete-loading="isDeleteLoading"
                        :is-form-dirty="isFormDirty"
                        @cancel="handleCancel"
                    />
                </form>

                <template #footer>
                    <ManagerEventDeleteAction
                        :is-saving="isSaving"
                        :is-delete-loading="isDeleteLoading"
                        @delete="handleOpenDeleteDialog"
                    />
                </template>
            </FormSection>

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

        <NuxtLink
            v-if="loadedEvent || notFound"
            :to="scheduleBackHref"
            class="text-primary focus-visible:ring-ring inline-flex rounded-sm text-sm font-medium underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:outline-none"
            aria-label="Wróć do terminarza instruktora"
        >
            Wróć do terminarza instruktora
        </NuxtLink>
    </div>
</template>
