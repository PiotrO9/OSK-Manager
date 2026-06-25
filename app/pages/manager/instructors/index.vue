<script setup lang="ts">
import { Plus } from 'lucide-vue-next';

definePageMeta({
    layout: 'app-shell',
    middleware: ['manager'],
});

usePageMeta({
    title: () => 'Instruktorzy',
    description: () => 'Zarządzanie kontami instruktorów w szkołach jazdy.',
});

const {
    schools,
    schoolsLoadError,
    isSchoolsLoading,
    activeSchoolId,
    activeSchool,
    instructors,
    isInstructorsLoading,
    instructorsLoadError,
    formDialogOpen,
    isFormSaving,
    apiError,
    prefillSchoolId,
    instructorsWithQualificationsCount,
    uniqueQualificationCodesCount,
    visibleInstructorsLabel,
    qualificationFilterLabel,
    loadSchools,
    loadInstructors,
    handleActiveSchoolChange,
    instructorDetailsTo,
    instructorQualificationLabel,
    instructorInitials,
    handleOpenCreateDialog,
    handleFormDialogOpenChange,
    handleInstructorSubmit,
} = useManagerInstructorsPage();
</script>

<template>
    <div class="space-y-5">
        <PageHeader
            title="Instruktorzy"
            description="Zespół szkoleniowy, kwalifikacje i przypisanie do OSK."
        >
            <template #actions>
                <UiButton
                    type="button"
                    class="h-10 rounded-xl px-4 font-semibold shadow-sm"
                    aria-label="Otwórz formularz dodawania instruktora"
                    @click="handleOpenCreateDialog"
                >
                    <Plus class="mr-2 size-4" aria-hidden="true" />
                    Dodaj instruktora
                </UiButton>
            </template>
        </PageHeader>

        <ManagerInstructorsStatsGrid
            :instructors-count="instructors.length"
            :active-school="activeSchool"
            :instructors-with-qualifications-count="
                instructorsWithQualificationsCount
            "
            :unique-qualification-codes-count="uniqueQualificationCodesCount"
        />

        <ManagerInstructorsListCard
            v-model:active-school-id="activeSchoolId"
            :schools="schools"
            :active-school="activeSchool"
            :instructors="instructors"
            :is-schools-loading="isSchoolsLoading"
            :is-instructors-loading="isInstructorsLoading"
            :schools-load-error="schoolsLoadError"
            :instructors-load-error="instructorsLoadError"
            :visible-instructors-label="visibleInstructorsLabel"
            :qualification-filter-label="qualificationFilterLabel"
            :instructor-details-to="instructorDetailsTo"
            :instructor-qualification-label="instructorQualificationLabel"
            :instructor-initials="instructorInitials"
            @active-school-change="handleActiveSchoolChange"
            @retry-schools="loadSchools"
            @retry-instructors="loadInstructors"
        />

        <ManagerInstructorFormDialog
            :open="formDialogOpen"
            :schools="schools"
            :is-schools-loading="isSchoolsLoading"
            :schools-load-error="schoolsLoadError"
            :is-saving="isFormSaving"
            :api-error="apiError"
            :prefill-school-id="prefillSchoolId"
            @update:open="handleFormDialogOpenChange"
            @submit="handleInstructorSubmit"
        />
    </div>
</template>
