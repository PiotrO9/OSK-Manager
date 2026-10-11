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
    categoriesOnly: boolean;
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
            :aria-describedby="categoriesOnly ? undefined : DESCRIPTION_ID"
            class="max-h-[90vh] max-w-lg overflow-y-auto"
        >
            <UiDialogHeader>
                <div class="flex items-center gap-1">
                    <UiDialogTitle>{{
                        categoriesOnly
                            ? 'Kategorie uprawnień'
                            : 'Edycja instruktora'
                    }}</UiDialogTitle>
                    <ManagerInstructorCategoryRulesTooltip
                        v-if="categoriesOnly"
                    />
                </div>
                <UiDialogDescription
                    v-if="!categoriesOnly"
                    :id="DESCRIPTION_ID"
                >
                    Zmień dane profilu i uprawnienia instruktora.
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
                :categories-only="categoriesOnly"
                @cancel="handleCancel"
                @submit="handleFormSubmit"
            />
        </UiDialogContent>
    </UiDialog>
</template>
