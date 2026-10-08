<script setup lang="ts">
const {
    FORM_ID,
    loadedLesson,
    assignedCourseInstructor,
    workingWeekdays,
    dayOffDates,
    workingExceptionDates,
    loadError,
    notFound,
    isNotEditable,
    formStartLocal,
    formEndLocal,
    formVehicleId,
    formInstructorId,
    formError,
    vehiclesError,
    isVehiclesLoading,
    instructorsError,
    instructorOptionsError,
    hasAvailableInstructors,
    canChangeInstructor,
    isInstructorsLoading,
    studentDisplayName,
    isSaving,
    isFetchLoading,
    lessonStatusLabel,
    lessonStatusTone,
    instructorsForSelect,
    vehiclesForSelect,
    instructorSelectLabel,
    scheduleBackHref,
    isFormDirty,
    isFormComplete,
    lessonAvailabilityStatus,
    lessonAvailabilityMessage,
    availableStartTimes,
    availableEndTimes,
    availableVehicleIds,
    isAvailabilityOptionsLoading,
    availabilityOptionsError,
    noHoursMessage,
    nextAvailableDay,
    nextAvailableStatus,
    findNextAvailableDay,
    lessonMinDurationMinutes,
    loadLesson,
    handleCancel,
    handleSubmit,
} = useManagerLessonEditPage();
</script>

<template>
    <div class="space-y-6">
        <ManagerLessonEditHeader
            v-if="loadedLesson"
            :form-id="FORM_ID"
            :can-save="Boolean(loadedLesson) && isFormDirty && isFormComplete"
            :is-availability-blocking="
                lessonAvailabilityStatus === 'checking' ||
                lessonAvailabilityStatus === 'unavailable'
            "
            :is-saving="isSaving"
            :is-checking-availability="lessonAvailabilityStatus === 'checking'"
        />

        <LoadingState
            v-if="isFetchLoading && !loadedLesson"
            title="Wczytywanie lekcji"
            description="Pobieramy dane potrzebne do edycji jazdy."
        />

        <EmptyState
            v-else-if="isNotEditable"
            title="Ta jazda nie jest już edytowalna"
            description="Zakończonych i anulowanych jazd nie można zmieniać."
        >
            <template #action>
                <UiButton as-child variant="outline">
                    <NuxtLink :to="scheduleBackHref">
                        Wróć do harmonogramu
                    </NuxtLink>
                </UiButton>
            </template>
        </EmptyState>

        <EmptyState
            v-else-if="notFound"
            title="Nie znaleziono lekcji"
            description="Lekcja nie istnieje albo nie jest dostępna w aktualnym kontekście."
        >
            <template #action>
                <UiButton as-child variant="outline">
                    <NuxtLink :to="scheduleBackHref">
                        Wróć do harmonogramu
                    </NuxtLink>
                </UiButton>
            </template>
        </EmptyState>

        <ErrorState
            v-else-if="loadError"
            title="Nie udało się wczytać lekcji"
            :description="loadError"
            @retry="loadLesson"
        />

        <template v-else-if="loadedLesson">
            <FormSection
                title="Edytuj jazde"
                description="Formularz podzielony na logiczne sekcje, z zachowaniem aktualnej walidacji i flow."
            >
                <ManagerLessonEditForm
                    v-model:start-local="formStartLocal"
                    v-model:end-local="formEndLocal"
                    v-model:vehicle-id="formVehicleId"
                    v-model:instructor-id="formInstructorId"
                    :form-id="FORM_ID"
                    :loaded-lesson="loadedLesson"
                    :booking-max-days-ahead="loadedLesson.bookingMaxDaysAhead"
                    :school-working-days-mask="
                        loadedLesson.schoolWorkingDaysMask
                    "
                    :working-weekdays="workingWeekdays"
                    :day-off-dates="dayOffDates"
                    :working-exception-dates="workingExceptionDates"
                    :student-display-name="studentDisplayName"
                    :lesson-status-label="lessonStatusLabel"
                    :lesson-status-tone="lessonStatusTone"
                    :instructors-for-select="instructorsForSelect"
                    :instructor-select-label="instructorSelectLabel"
                    :assigned-course-instructor="assignedCourseInstructor"
                    :is-instructors-loading="isInstructorsLoading"
                    :instructors-error="instructorsError"
                    :instructor-options-error="instructorOptionsError"
                    :has-available-instructors="hasAvailableInstructors"
                    :can-change-instructor="canChangeInstructor"
                    :vehicles-for-select="vehiclesForSelect"
                    :is-vehicles-loading="isVehiclesLoading"
                    :vehicles-error="vehiclesError"
                    :form-error="formError"
                    :availability-status="lessonAvailabilityStatus"
                    :availability-message="lessonAvailabilityMessage"
                    :available-start-times="availableStartTimes"
                    :available-end-times="availableEndTimes"
                    :available-vehicle-ids="availableVehicleIds"
                    :is-availability-options-loading="
                        isAvailabilityOptionsLoading
                    "
                    :availability-options-error="availabilityOptionsError"
                    :no-hours-message="noHoursMessage"
                    :next-available-day="nextAvailableDay"
                    :next-available-status="nextAvailableStatus"
                    :min-duration-minutes="lessonMinDurationMinutes"
                    @submit="handleSubmit"
                    @find-next-available="findNextAvailableDay"
                />

                <template #footer>
                    <ManagerLessonEditActions
                        :form-id="FORM_ID"
                        :can-save="isFormDirty && isFormComplete"
                        :is-availability-blocking="
                            lessonAvailabilityStatus === 'checking' ||
                            lessonAvailabilityStatus === 'unavailable'
                        "
                        :is-saving="isSaving"
                        :is-checking-availability="
                            lessonAvailabilityStatus === 'checking'
                        "
                        @cancel="handleCancel"
                    />
                </template>
            </FormSection>
        </template>
    </div>
</template>
