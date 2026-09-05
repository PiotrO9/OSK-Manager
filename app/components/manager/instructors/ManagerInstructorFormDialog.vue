<script setup lang="ts">
import type { DrivingSchool } from '~/types/schools/drivingSchool';
import type { InstructorRegisterPayload } from '~/composables/instructors/manager/useManagerInstructorFormDialog';

export type { InstructorRegisterPayload } from '~/composables/instructors/manager/useManagerInstructorFormDialog';

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
    submit: [payload: InstructorRegisterPayload];
}>();

const DESCRIPTION_ID = 'instructor-form-dialog-desc';

const {
    emailModel,
    firstNameModel,
    lastNameModel,
    licenseNumberModel,
    passwordModel,
    schoolIdModel,
    validation,
    validate,
} = useManagerInstructorFormDialog(props);

function handleOpenChange(open: boolean) {
    emit('update:open', open);
}

function handleCancel() {
    emit('update:open', false);
}

function handleFormSubmit() {
    const payload = validate();

    if (!payload) {
        return;
    }

    emit('submit', payload);
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
                <UiDialogTitle>Nowy instruktor</UiDialogTitle>
                <UiDialogDescription :id="DESCRIPTION_ID">
                    Konto powstaje przez rejestrację z rolą INSTRUCTOR w
                    wybranej OSK (upstream
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

                <ManagerInstructorFormFields
                    v-model:email="emailModel"
                    v-model:password="passwordModel"
                    v-model:first-name="firstNameModel"
                    v-model:last-name="lastNameModel"
                    v-model:license-number="licenseNumberModel"
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
                        {{
                            isSaving ? 'Tworzenie konta…' : 'Utwórz instruktora'
                        }}
                    </UiButton>
                </UiDialogFooter>
            </form>
        </UiDialogContent>
    </UiDialog>
</template>
