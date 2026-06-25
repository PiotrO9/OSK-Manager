<script setup lang="ts">
const {
    FORM_ID,
    loadedLesson,
    loadError,
    notFound,
    formStartLocal,
    formEndLocal,
    formVehicleId,
    formInstructorId,
    formError,
    vehiclesError,
    isVehiclesLoading,
    instructorsError,
    isInstructorsLoading,
    studentDisplayName,
    isSaving,
    isFetchLoading,
    schoolId,
    lessonStatusLabel,
    lessonStatusTone,
    lessonDateLabel,
    lessonHeaderMeta,
    instructorsForSelect,
    vehiclesForSelect,
    instructorSelectLabel,
    scheduleBackHref,
    isFormDirty,
    loadLesson,
    handleCancel,
    handleSubmit,
} = useManagerLessonEditPage();
</script>

<template>
    <div class="space-y-6">
        <ManagerLessonEditHeader
            :meta="lessonHeaderMeta"
            :lesson-date-label="lessonDateLabel"
            :form-id="FORM_ID"
            :can-save="Boolean(loadedLesson) && isFormDirty"
            :is-saving="isSaving"
        />

        <LoadingState
            v-if="isFetchLoading && !loadedLesson"
            title="Wczytywanie lekcji"
            description="Pobieramy dane potrzebne do edycji jazdy."
        />

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
                    :student-display-name="studentDisplayName"
                    :lesson-status-label="lessonStatusLabel"
                    :lesson-status-tone="lessonStatusTone"
                    :instructors-for-select="instructorsForSelect"
                    :instructor-select-label="instructorSelectLabel"
                    :is-instructors-loading="isInstructorsLoading"
                    :instructors-error="instructorsError"
                    :vehicles-for-select="vehiclesForSelect"
                    :is-vehicles-loading="isVehiclesLoading"
                    :vehicles-error="vehiclesError"
                    :school-id="schoolId"
                    :form-error="formError"
                    @submit="handleSubmit"
                />

                <template #footer>
                    <ManagerLessonEditActions
                        :form-id="FORM_ID"
                        :can-save="isFormDirty"
                        :is-saving="isSaving"
                        @cancel="handleCancel"
                    />
                </template>
            </FormSection>
        </template>
    </div>
</template>
