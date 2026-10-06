<script setup lang="ts">
import { ArrowLeft, Plus } from 'lucide-vue-next';
import type { InstructorFormField } from '~/composables/instructors/manager/useManagerInstructorForm';

definePageMeta({
    layout: 'app-shell',
    middleware: ['manager'],
});

usePageMeta({
    title: () => 'Dodaj instruktora',
    description: () => 'Utwórz konto i przypisz instruktora do szkoły jazdy.',
});

const {
    schools,
    schoolsLoadError,
    isSchoolsLoading,
    isSaving,
    isCreated,
    isNavigating,
    navigationError,
    isLeaveDialogOpen,
    cancelLeave,
    confirmDiscard,
    returnToList,
    apiError,
    emailModel,
    passwordModel,
    firstNameModel,
    lastNameModel,
    licenseNumberModel,
    schoolIdModel,
    birthDateModel,
    fieldErrors,
    maxBirthDate,
    touchField,
    loadSchools,
    handleSubmit,
} = useManagerInstructorCreatePage();

const formFields = useTemplateRef<{
    focusField: (field: InstructorFormField) => Promise<void>;
}>('formFields');

async function submitForm() {
    const result = await handleSubmit();

    if (result.status === 'field-error') {
        await nextTick();
        await formFields.value?.focusField(result.field);
    }
}
</script>

<template>
    <div class="space-y-6">
        <PageHeader
            title="Dodaj instruktora"
            description="Utwórz konto i przypisz instruktora do szkoły jazdy."
        >
            <template #actions>
                <UiButton variant="outline" as-child>
                    <NuxtLink to="/manager/instructors">
                        <ArrowLeft class="size-4" aria-hidden="true" />
                        Wróć do instruktorów
                    </NuxtLink>
                </UiButton>
            </template>
        </PageHeader>

        <div class="w-full">
            <div
                v-if="isCreated"
                class="border-border bg-card space-y-4 rounded-lg border p-5 sm:p-6"
                role="status"
            >
                <p class="text-sm">
                    {{ navigationError ?? 'Instruktor został utworzony.' }}
                </p>
                <UiButton :disabled="isNavigating" @click="returnToList">
                    <ArrowLeft class="size-4" aria-hidden="true" />
                    Wróć do instruktorów
                </UiButton>
            </div>
            <p
                v-else-if="isSchoolsLoading"
                class="text-muted-foreground py-8 text-sm"
                role="status"
            >
                Wczytywanie listy szkół jazdy…
            </p>

            <div
                v-else-if="schoolsLoadError"
                class="border-border bg-card space-y-4 rounded-lg border p-5 sm:p-6"
            >
                <p class="text-destructive text-sm" role="alert">
                    {{ schoolsLoadError }}
                </p>
                <UiButton type="button" variant="outline" @click="loadSchools">
                    Spróbuj ponownie
                </UiButton>
            </div>

            <p
                v-else-if="schools.length === 0"
                class="text-muted-foreground py-8 text-sm"
                role="status"
            >
                Brak szkół jazdy dostępnych dla Twojego konta.
            </p>

            <form
                v-else
                id="manager-instructor-create-form"
                novalidate
                class="border-border bg-card space-y-6 rounded-lg border p-5 sm:p-6"
                @submit.prevent="submitForm"
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
                    ref="formFields"
                    v-model:email="emailModel"
                    v-model:password="passwordModel"
                    v-model:first-name="firstNameModel"
                    v-model:last-name="lastNameModel"
                    v-model:license-number="licenseNumberModel"
                    v-model:school-id="schoolIdModel"
                    v-model:birth-date="birthDateModel"
                    :schools="schools"
                    :is-saving="isSaving"
                    :field-errors="fieldErrors"
                    :max-birth-date="maxBirthDate"
                    @touch-field="touchField"
                />
            </form>

            <div
                v-if="
                    !isCreated &&
                    !isSchoolsLoading &&
                    !schoolsLoadError &&
                    schools.length > 0
                "
                class="mt-4 flex justify-end"
            >
                <UiButton
                    type="submit"
                    form="manager-instructor-create-form"
                    class="w-full sm:w-auto"
                    :disabled="isSaving"
                    :aria-busy="isSaving"
                >
                    <Plus class="size-4" aria-hidden="true" />
                    {{ isSaving ? 'Tworzenie konta…' : 'Utwórz instruktora' }}
                </UiButton>
            </div>
        </div>
        <ManagerInstructorDiscardDialog
            :open="isLeaveDialogOpen"
            @cancel="cancelLeave"
            @discard="confirmDiscard"
        />
    </div>
</template>
