<script setup lang="ts">
import type { CourseTypeOption } from '~/types/courses/courseType';
import type { InstructorEditFormModel } from '~/types/instructors/instructor';

defineProps<{
    isSubmitting: boolean;
    submitError: string | null;
    courseTypes: CourseTypeOption[];
    selectedQualifiedCourseTypes: CourseTypeOption[];
    isCourseTypesLoading: boolean;
    courseTypesError: string | null;
}>();

const emit = defineEmits<{
    submit: [];
}>();

const open = defineModel<boolean>('open', { required: true });
const form = defineModel<InstructorEditFormModel | null>('form', {
    required: true,
});

const DESCRIPTION_ID = 'instructor-edit-dialog-desc';

function handleCancel(): void {
    open.value = false;
}

function handleFormSubmit(): void {
    emit('submit');
}
</script>

<template>
    <UiDialog v-model:open="open">
        <UiDialogContent
            :show-close-button="!isSubmitting"
            :close-on-outside-click="false"
            :aria-describedby="DESCRIPTION_ID"
            class="max-h-[90vh] max-w-lg overflow-y-auto"
        >
            <UiDialogHeader>
                <UiDialogTitle>Edycja instruktora</UiDialogTitle>
                <UiDialogDescription :id="DESCRIPTION_ID">
                    Zmiany zapisują się przez
                    <span class="font-mono">PATCH /api/instructors/:id</span>.
                    E‑mail jest tylko do odczytu. Kliknięcie poza oknem nie
                    zamyka formularza.
                </UiDialogDescription>
            </UiDialogHeader>

            <ManagerInstructorEditForm
                v-if="form"
                v-model:form="form"
                :is-submitting="isSubmitting"
                :submit-error="submitError"
                :course-types="courseTypes"
                :selected-qualified-course-types="selectedQualifiedCourseTypes"
                :is-course-types-loading="isCourseTypesLoading"
                :course-types-error="courseTypesError"
                @cancel="handleCancel"
                @submit="handleFormSubmit"
            />
        </UiDialogContent>
    </UiDialog>
</template>
