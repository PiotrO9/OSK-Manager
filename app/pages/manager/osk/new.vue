<script setup lang="ts">
import { ArrowLeft } from 'lucide-vue-next';

definePageMeta({ layout: 'app-shell', middleware: ['manager'] });
usePageMeta({
    title: () => 'Dodaj OSK',
    description: () => 'Utwórz nową szkołę jazdy.',
});

const {
    name,
    city,
    address,
    asDefault,
    nameError,
    submitError,
    defaultSwitchLocked,
    isSchoolsLoading,
    schoolsLoadError,
    isSaving,
    isCreated,
    isNavigating,
    navigationError,
    isLeaveDialogOpen,
    cancelLeave,
    confirmDiscard,
    loadSchools,
    returnToList,
    handleSubmit,
} = useManagerOskCreatePage();
const form = useTemplateRef<{ focusName: () => void }>('form');

async function submitForm() {
    if ((await handleSubmit()) === 'field-error') {
        await nextTick();
        form.value?.focusName();
    }
}
</script>

<template>
    <div class="min-w-0 space-y-6">
        <PageHeader
            title="Dodaj OSK"
            description="Wprowadź dane nowej szkoły jazdy."
        >
            <template #actions>
                <UiButton
                    type="button"
                    variant="outline"
                    :disabled="isSaving || isNavigating"
                    @click="returnToList"
                >
                    <ArrowLeft class="size-4" aria-hidden="true" />
                    Wróć do szkół
                </UiButton>
            </template>
        </PageHeader>
        <div class="w-full max-w-3xl space-y-4">
            <p
                v-if="isCreated && !isSaving"
                class="border-border bg-card rounded-xl border p-5"
                role="status"
            >
                Szkoła została dodana.
            </p>
            <LoadingState
                v-else-if="isSchoolsLoading"
                title="Wczytywanie listy szkół jazdy…"
                :show-labels="false"
            />
            <ErrorState
                v-else-if="schoolsLoadError"
                title="Nie udało się wczytać szkół jazdy"
                :description="schoolsLoadError"
                @retry="loadSchools"
            />
            <ManagerOskCreateForm
                v-else
                ref="form"
                v-model:name="name"
                v-model:city="city"
                v-model:address="address"
                v-model:as-default="asDefault"
                :name-error="nameError"
                :submit-error="submitError"
                :default-switch-locked="defaultSwitchLocked"
                :is-saving="isSaving"
                @submit="submitForm"
                @cancel="returnToList"
            />
            <div v-if="navigationError" class="space-y-3">
                <p class="text-destructive text-sm" role="alert">
                    {{ navigationError }}
                </p>
                <UiButton
                    type="button"
                    variant="outline"
                    :disabled="isNavigating"
                    @click="returnToList"
                    >Wróć na listę OSK</UiButton
                >
            </div>
        </div>
        <ManagerOskDiscardDialog
            :open="isLeaveDialogOpen"
            @cancel="cancelLeave"
            @discard="confirmDiscard"
        />
    </div>
</template>
