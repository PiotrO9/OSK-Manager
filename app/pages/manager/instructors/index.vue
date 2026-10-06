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
    search,
    quickView,
    advancedFilters,
    advancedFilterDraft,
    advancedFilterDraftError,
    qualificationOptions,
    visibleInstructors,
    isInstructorsLoading,
    instructorsLoadError,
    visibleInstructorsLabel,
    qualificationFilterLabel,
    instructorsWithQualificationsCount,
    uniqueQualificationCodesCount,
    hasInstructorFilters,
    clearInstructorFilters,
    startNewAdvancedFilter,
    startEditAdvancedFilter,
    updateAdvancedFilterDraft,
    applyAdvancedFilterDraft,
    cancelAdvancedFilterDraft,
    removeAdvancedFilter,
    loadSchools,
    loadInstructors,
    handleActiveSchoolChange,
    instructorDetailsTo,
    instructorQualificationLabel,
    instructorInitials,
    handleOpenCreatePage,
} = useManagerInstructorsPage();
</script>

<template>
    <div class="space-y-6">
        <PageHeader
            title="Instruktorzy"
            description="Zespół szkoleniowy, kwalifikacje i szybki dostęp do profili."
        >
            <template #actions>
                <UiButton
                    as-child
                    class="h-11 w-full px-4 sm:h-10 sm:w-auto"
                    aria-label="Otwórz formularz dodawania instruktora"
                >
                    <NuxtLink to="/manager/instructors/new">
                        <Plus class="size-4" aria-hidden="true" />
                        Dodaj instruktora
                    </NuxtLink>
                </UiButton>
            </template>
        </PageHeader>

        <ManagerInstructorsListCard
            v-model:active-school-id="activeSchoolId"
            v-model:search="search"
            v-model:quick-view="quickView"
            :schools="schools"
            :active-school="activeSchool"
            :instructors="visibleInstructors"
            :advanced-filters="advancedFilters"
            :advanced-filter-draft="advancedFilterDraft"
            :advanced-filter-draft-error="advancedFilterDraftError"
            :qualification-options="qualificationOptions"
            :is-schools-loading="isSchoolsLoading"
            :is-instructors-loading="isInstructorsLoading"
            :schools-load-error="schoolsLoadError"
            :instructors-load-error="instructorsLoadError"
            :visible-instructors-label="visibleInstructorsLabel"
            :qualification-filter-label="qualificationFilterLabel"
            :instructors-with-qualifications-count="
                instructorsWithQualificationsCount
            "
            :unique-qualification-codes-count="uniqueQualificationCodesCount"
            :has-active-filters="hasInstructorFilters"
            :instructor-details-to="instructorDetailsTo"
            :instructor-qualification-label="instructorQualificationLabel"
            :instructor-initials="instructorInitials"
            @active-school-change="handleActiveSchoolChange"
            @create-instructor="handleOpenCreatePage"
            @start-new-advanced-filter="startNewAdvancedFilter"
            @start-edit-advanced-filter="startEditAdvancedFilter"
            @update-advanced-filter-draft="updateAdvancedFilterDraft"
            @apply-advanced-filter-draft="applyAdvancedFilterDraft"
            @cancel-advanced-filter-draft="cancelAdvancedFilterDraft"
            @remove-advanced-filter="removeAdvancedFilter"
            @clear-filters="clearInstructorFilters"
            @retry-schools="loadSchools"
            @retry-instructors="loadInstructors"
        />
    </div>
</template>
