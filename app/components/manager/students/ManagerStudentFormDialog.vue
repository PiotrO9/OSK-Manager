<script setup lang="ts">
import type { DrivingSchool } from '~/types/schools/drivingSchool';
import {
    buildStudentRegisterPayload,
    getEmptyStudentFormValidationState,
    hasStudentFormValidationErrors,
    resolveDefaultStudentSchoolId,
    validateStudentFormDraft,
    type StudentRegisterPayload,
} from '~/utils/students/managerStudentFormDialog';

interface Props {
    open: boolean;
    schools: readonly DrivingSchool[];
    isSchoolsLoading: boolean;
    schoolsLoadError: string | null;
    isSaving: boolean;
    apiError: string | null;
    prefillSchoolId: string | null;
}

const props = defineProps<Props>();

const emit = defineEmits<{
    'update:open': [value: boolean];
    submit: [payload: StudentRegisterPayload];
}>();

const DESCRIPTION_ID = 'student-form-dialog-desc';

const emailModel = ref('');
const passwordModel = ref('');
const firstNameModel = ref('');
const lastNameModel = ref('');
const schoolIdModel = ref('');

const validation = reactive(getEmptyStudentFormValidationState());

function applyDefaultSchoolId() {
    schoolIdModel.value = resolveDefaultStudentSchoolId(
        props.schools,
        props.prefillSchoolId,
    );
}

function resetValidationAndFields() {
    emailModel.value = '';
    passwordModel.value = '';
    firstNameModel.value = '';
    lastNameModel.value = '';
    schoolIdModel.value = '';
    Object.assign(validation, getEmptyStudentFormValidationState());
}

watch(
    () => props.open,
    (open) => {
        if (!open) return;

        resetValidationAndFields();
        applyDefaultSchoolId();
    },
);

watch(
    () => props.isSchoolsLoading,
    (loading) => {
        if (!props.open || loading) return;

        if (schoolIdModel.value !== '') return;

        applyDefaultSchoolId();
    },
);

function handleOpenChange(open: boolean) {
    emit('update:open', open);
}

function handleCancel() {
    emit('update:open', false);
}

function handleFormSubmit() {
    if (props.isSaving) return;

    const draft = {
        email: emailModel.value,
        password: passwordModel.value,
        firstName: firstNameModel.value,
        lastName: lastNameModel.value,
        schoolId: schoolIdModel.value,
    };

    Object.assign(validation, validateStudentFormDraft(draft));

    if (hasStudentFormValidationErrors(validation)) {
        return;
    }

    emit('submit', buildStudentRegisterPayload(draft));
}
</script>

<template>
    <UiDialog :open="open" @update:open="handleOpenChange">
        <UiDialogContent
            :show-close-button="true"
            :close-on-outside-click="false"
            :aria-describedby="DESCRIPTION_ID"
            class="max-h-[90vh] max-w-lg overflow-y-auto"
        >
            <UiDialogHeader>
                <UiDialogTitle>Nowy kursant</UiDialogTitle>
                <UiDialogDescription :id="DESCRIPTION_ID">
                    Konto powstaje przez rejestrację z rolą STUDENT w wybranej
                    OSK (upstream
                    <span class="font-mono">POST /auth/register</span>).
                </UiDialogDescription>
            </UiDialogHeader>

            <p
                v-if="schoolsLoadError"
                class="text-destructive text-sm"
                role="alert"
            >
                {{ schoolsLoadError }}
            </p>

            <p
                v-else-if="isSchoolsLoading"
                class="text-muted-foreground text-sm"
                role="status"
            >
                Wczytywanie listy OSK…
            </p>

            <form
                v-else
                class="space-y-4"
                novalidate
                @submit.prevent="handleFormSubmit"
            >
                <p
                    v-if="apiError"
                    class="text-destructive text-sm"
                    role="alert"
                    aria-live="polite"
                >
                    {{ apiError }}
                </p>

                <ManagerStudentFormFields
                    v-model:email="emailModel"
                    v-model:password="passwordModel"
                    v-model:first-name="firstNameModel"
                    v-model:last-name="lastNameModel"
                    v-model:school-id="schoolIdModel"
                    :schools="schools"
                    :is-saving="isSaving"
                    :validation="validation"
                />

                <UiDialogFooter class="gap-2 sm:gap-2">
                    <UiButton
                        type="button"
                        variant="outline"
                        :disabled="isSaving"
                        @click="handleCancel"
                    >
                        Anuluj
                    </UiButton>
                    <UiButton type="submit" :disabled="isSaving">
                        {{ isSaving ? 'Tworzenie konta…' : 'Utwórz kursanta' }}
                    </UiButton>
                </UiDialogFooter>
            </form>
        </UiDialogContent>
    </UiDialog>
</template>
