<script setup lang="ts">
import type { CourseKind } from '~~/shared/contracts/courses';
import type { CourseTypeOption } from '~/types/courses/courseType';

interface Props {
    open: boolean;
    name: string;
    city: string;
    address: string;
    enabledCourseKinds: CourseKind[];
    offeredCourseTypeIds: string[];
    courseTypes: CourseTypeOption[];
    isCourseTypesLoading: boolean;
    courseTypesLoadError: string | null;
    isSaving: boolean;
    nameError: string;
    submitError: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
    'update:open': [value: boolean];
    'update:name': [value: string];
    'update:city': [value: string];
    'update:address': [value: string];
    'update:enabledCourseKinds': [value: CourseKind[]];
    'update:offeredCourseTypeIds': [value: string[]];
    retryCourseTypes: [];
    submit: [];
}>();

const fields = useTemplateRef<{ focusName: () => void }>('fields');

function handleOpenChange(open: boolean) {
    emit('update:open', open);
}

function handleCancel() {
    emit('update:open', false);
}

function handlePointerDownOutside(event: Event) {
    if (props.isSaving) {
        event.preventDefault();
    }
}

function handleEscapeKeyDown(event: Event) {
    if (props.isSaving) {
        event.preventDefault();
    }
}

watch(
    () => props.nameError,
    async (error) => {
        if (!error) return;

        await nextTick();
        fields.value?.focusName();
    },
);
</script>

<template>
    <UiDialog :open="open" @update:open="handleOpenChange">
        <UiDialogContent
            :show-close-button="!isSaving"
            aria-describedby="osk-form-edit-desc"
            class="max-h-[90vh] max-w-lg overflow-y-auto"
            @pointer-down-outside="handlePointerDownOutside"
            @escape-key-down="handleEscapeKeyDown"
        >
            <UiDialogHeader>
                <UiDialogTitle>Edycja szkoły jazdy</UiDialogTitle>
                <UiDialogDescription id="osk-form-edit-desc">
                    Zmień dane szkoły i dostępne rodzaje kursów.
                </UiDialogDescription>
            </UiDialogHeader>

            <form class="space-y-4" @submit.prevent="emit('submit')">
                <ManagerOskBasicFields
                    ref="fields"
                    :name="name"
                    :city="city"
                    :address="address"
                    :name-error="nameError"
                    :disabled="isSaving"
                    @update:name="emit('update:name', $event)"
                    @update:city="emit('update:city', $event)"
                    @update:address="emit('update:address', $event)"
                />

                <ManagerOskCourseSettingsFields
                    :enabled-course-kinds="enabledCourseKinds"
                    :offered-course-type-ids="offeredCourseTypeIds"
                    :course-types="courseTypes"
                    :is-course-types-loading="isCourseTypesLoading"
                    :course-types-load-error="courseTypesLoadError"
                    :is-saving="isSaving"
                    @update:enabled-course-kinds="
                        emit('update:enabledCourseKinds', $event)
                    "
                    @update:offered-course-type-ids="
                        emit('update:offeredCourseTypeIds', $event)
                    "
                    @retry-course-types="emit('retryCourseTypes')"
                />

                <p
                    v-if="submitError"
                    class="border-destructive/30 bg-destructive/5 text-destructive rounded-lg border px-3 py-2 text-sm"
                    role="alert"
                >
                    {{ submitError }}
                </p>

                <UiDialogFooter class="gap-2 sm:gap-2">
                    <UiButton
                        type="button"
                        variant="outline"
                        :disabled="isSaving"
                        @click="handleCancel"
                    >
                        Anuluj
                    </UiButton>
                    <UiButton
                        type="submit"
                        :disabled="isSaving"
                        :aria-busy="isSaving"
                    >
                        {{ isSaving ? 'Zapisywanie…' : 'Zapisz zmiany' }}
                    </UiButton>
                </UiDialogFooter>
            </form>
        </UiDialogContent>
    </UiDialog>
</template>
