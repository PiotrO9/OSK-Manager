<script setup lang="ts">
definePageMeta({
    layout: 'app-shell',
    middleware: ['manager'],
});

const {
    route,
    instructor,
    editForm,
    courseTypes,
    courseTypesError,
    isLoading,
    errorMessage,
    isSubmitting,
    submitError,
    isEditDialogOpen,
    isDeleteDialogOpen,
    isDeleting,
    ratingSummary,
    isRatingSummaryLoading,
    isCourseTypesLoading,
    instructorSubpageQuery,
    displayText,
    loadInstructor,
    handleEnterEdit,
    handleSubmitEdit,
    handleOpenDeleteDialog,
    handleDeleteDialogCancel,
    handleDeleteDialogOpenChange,
    handleDeleteDialogConfirm,
} = useManagerInstructorDetailsPage();
</script>

<template>
    <div class="space-y-6">
        <LoadingState
            v-if="isLoading"
            title="Wczytywanie instruktora"
            description="Pobieram profil, kwalifikacje i powiazane dane."
        />

        <ErrorState
            v-else-if="errorMessage"
            title="Nie udaĹ‚o siÄ™ wczytaÄ‡ instruktora"
            :description="errorMessage"
            @retry="loadInstructor(route.params.id)"
        />

        <ManagerInstructorDetailsContent
            v-else-if="instructor !== null && editForm !== null"
            :instructor="instructor"
            :rating-summary="ratingSummary"
            :is-rating-summary-loading="isRatingSummaryLoading"
            :is-submitting="isSubmitting"
            :is-deleting="isDeleting"
            :subpage-query="instructorSubpageQuery"
            @edit="handleEnterEdit"
            @delete="handleOpenDeleteDialog"
        />
        <ManagerInstructorEditDialog
            v-if="editForm !== null"
            v-model:open="isEditDialogOpen"
            v-model:form="editForm"
            :is-submitting="isSubmitting || isDeleting"
            :submit-error="submitError"
            :course-types="courseTypes"
            :selected-qualified-course-types="
                instructor !== null ? instructor.qualifiedCourseTypes : []
            "
            :is-course-types-loading="isCourseTypesLoading"
            :course-types-error="courseTypesError"
            @submit="handleSubmitEdit"
        />

        <ManagerInstructorDeleteDialog
            :open="isDeleteDialogOpen"
            :instructor-display-name="
                instructor !== null ? displayText(instructor.name) : ''
            "
            @update:open="handleDeleteDialogOpenChange"
            @cancel="handleDeleteDialogCancel"
            @confirm="handleDeleteDialogConfirm"
        />
    </div>
</template>
