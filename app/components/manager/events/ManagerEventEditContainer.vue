<script setup lang="ts">
import type { FreeWindow, InstructorEvent } from '~/types/instructorEvent';
import { formatStudentDisplayName } from '~/types/student';
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

                <div v-if="loadedEvent" class="mb-5 max-w-sm space-y-2">
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
                        Aktualizacja dostępnych okien grafiku…
                    </p>
                    <p
                        v-if="freeWindowsUnavailable"
                        class="border-border rounded-md border border-dashed px-3 py-2 text-sm text-amber-700 dark:text-amber-500"
                        role="alert"
                    >
                        Instruktor nie ma dostępności w tym dniu — zmień datę
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

            <FormSection
                v-if="formType === 'THEORY'"
                title="Kursanci (teoria)"
                description="Zarządzaj realną listą kursantów z kursu, z zachowaniem limitów i kolizji grafiku."
            >
                <div class="space-y-6">
                    <p
                        v-if="loadedEvent?.courseId?.trim()"
                        class="text-muted-foreground border-border rounded-md border border-dashed px-3 py-2 text-sm"
                        role="status"
                    >
                        <span class="text-foreground font-medium">Kurs:</span>
                        {{ linkedCourseLabel ?? loadedEvent.courseId }}
                    </p>

                    <p
                        v-if="theoryCapacitySummary"
                        class="text-muted-foreground text-sm"
                        role="status"
                    >
                        {{ theoryCapacitySummary }}
                    </p>

                    <p
                        v-if="parseCapacity(formCapacityInput) === 0"
                        class="border-border rounded-md border border-dashed px-3 py-2 text-sm text-amber-700 dark:text-amber-500"
                        role="status"
                    >
                        Limit miejsc wynosi 0 — żaden kursant nie może zostać
                        przypisany do tego bloku.
                    </p>

                    <p
                        v-if="!studentAttendanceKnown"
                        class="text-muted-foreground border-border space-y-2 rounded-md border border-dashed px-3 py-2 text-sm"
                        role="status"
                    >
                        <span class="text-foreground block font-medium">
                            Brak listy zapisanych na ten blok
                        </span>
                        <span class="block">
                            Nie udało się ustalić aktualnych przypisań (np.
                            <span class="font-mono text-xs"
                                >GET …/events/…/students</span
                            >
                            ). Bez tego nie można edytować składu grupy.
                        </span>
                    </p>

                    <div v-else class="space-y-3">
                        <p
                            v-if="theoryEligibleNoCourse"
                            class="text-muted-foreground border-border rounded-md border border-dashed px-3 py-2 text-sm"
                            role="status"
                        >
                            Ten blok nie ma przypisanego kursu (
                            <code class="text-xs">courseId</code>
                            ) — lista kursantów jest niedostępna.
                        </p>
                        <p
                            v-else-if="isTheoryEligibleLoading"
                            class="text-muted-foreground text-sm"
                            role="status"
                        >
                            Wczytywanie listy kursantów…
                        </p>
                        <p
                            v-else-if="theoryEligibleError"
                            class="text-destructive text-sm"
                            role="alert"
                        >
                            {{ theoryEligibleError }}
                        </p>
                        <ul
                            v-else-if="
                                theoryEligibleData &&
                                theoryEligibleData.students.length > 0
                            "
                            class="space-y-2"
                            role="list"
                            aria-label="Kursanci kursu — zaznacz uczestników wydarzenia"
                        >
                            <li
                                v-for="row in theoryEligibleData.students"
                                :key="row.userId"
                                class="border-input flex flex-col gap-2 rounded-md border px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
                            >
                                <div
                                    class="flex min-w-0 flex-1 items-start gap-3"
                                >
                                    <UiCheckbox
                                        :id="`theory-student-${row.userId}`"
                                        :model-value="
                                            isTheoryRowChecked(
                                                theoryEligibleRowToStudentListItem(
                                                    row,
                                                ),
                                            )
                                        "
                                        :disabled="
                                            isSaving ||
                                            !schoolId ||
                                            !isTheoryEligibleRowInteractive(row)
                                        "
                                        :aria-label="`Zapis na wydarzenie: ${formatStudentDisplayName(theoryEligibleRowToStudentListItem(row))}`"
                                        @update:model-value="
                                            handleToggleTheoryStudent(
                                                theoryEligibleRowToStudentListItem(
                                                    row,
                                                ),
                                                $event === true,
                                            )
                                        "
                                    />
                                    <UiLabel
                                        :for="`theory-student-${row.userId}`"
                                        class="text-foreground min-w-0 flex-1 cursor-pointer text-sm leading-snug font-normal peer-disabled:cursor-not-allowed"
                                    >
                                        {{
                                            formatStudentDisplayName(
                                                theoryEligibleRowToStudentListItem(
                                                    row,
                                                ),
                                            )
                                        }}
                                        <span
                                            v-if="row.email?.trim()"
                                            class="text-muted-foreground block text-xs font-normal"
                                        >
                                            {{ row.email.trim() }}
                                        </span>
                                    </UiLabel>
                                </div>
                                <div
                                    class="flex shrink-0 flex-wrap gap-1 sm:justify-end"
                                >
                                    <UiBadge
                                        v-if="row.hasScheduleConflict"
                                        variant="destructive"
                                    >
                                        Kolizja grafiku
                                    </UiBadge>
                                    <UiBadge
                                        v-if="
                                            !row.canAssign &&
                                            !row.isAssignedToEvent
                                        "
                                        variant="secondary"
                                    >
                                        Niedostępny
                                    </UiBadge>
                                </div>
                            </li>
                        </ul>
                        <p
                            v-else
                            class="text-muted-foreground text-sm"
                            role="status"
                        >
                            Brak kursantów na kursie lub lista nie została
                            wczytana.
                        </p>
                    </div>

                    <p
                        v-if="theoryStudentsError"
                        class="text-destructive text-sm"
                        role="alert"
                    >
                        {{ theoryStudentsError }}
                    </p>
                </div>
            </FormSection>

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
