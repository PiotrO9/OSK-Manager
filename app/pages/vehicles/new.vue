<script setup lang="ts">
import { Save } from 'lucide-vue-next';
import { onBeforeRouteLeave, onBeforeRouteUpdate } from 'vue-router';
import VehicleForm from '~/components/vehicles/VehicleForm.vue';
import { useVehicleCreatePage } from '~/composables/vehicles/useVehicleCreatePage';

definePageMeta({
    layout: 'app-shell',
    middleware: ['manager'],
});

usePageMeta({
    title: () => 'Nowy pojazd',
    description: () => 'Dodaj pojazd do szkoły jazdy.',
});

const {
    apiError,
    canSubmit,
    clearRegistrationNumberError,
    currentSchool,
    formId,
    handleVehicleSubmit,
    isCreateLoading,
    isCreateNavigationAllowed,
    isSchoolContextLoading,
    loadSchoolContext,
    registrationNumberError,
    schoolContextError,
    vehiclesListRoute,
} = useVehicleCreatePage();

const isFormDirty = shallowRef(false);
const hasUnsavedChanges = computed(
    () => !isCreateNavigationAllowed.value && isFormDirty.value,
);

function confirmLeave(): boolean {
    return (
        !hasUnsavedChanges.value ||
        !import.meta.client ||
        window.confirm(
            'Masz niezapisane zmiany. Czy na pewno chcesz opuścić formularz?',
        )
    );
}

onBeforeRouteLeave(confirmLeave);
onBeforeRouteUpdate(confirmLeave);

function handleBeforeUnload(event: BeforeUnloadEvent): void {
    if (hasUnsavedChanges.value) {
        event.preventDefault();
        event.returnValue = '';
    }
}

onMounted(() => window.addEventListener('beforeunload', handleBeforeUnload));
onBeforeUnmount(() =>
    window.removeEventListener('beforeunload', handleBeforeUnload),
);
</script>

<template>
    <div class="space-y-6">
        <PageHeader
            title="Dodaj pojazd"
            description="Uzupełnij dane pojazdu i przypisz go do wybranej szkoły jazdy."
            eyebrow="Nowy pojazd"
        >
            <template #actions>
                <UiButton
                    type="submit"
                    :form="formId"
                    :disabled="!canSubmit"
                    :aria-busy="isCreateLoading"
                >
                    <Save class="size-4" aria-hidden="true" />
                    {{ isCreateLoading ? 'Dodawanie…' : 'Dodaj pojazd' }}
                </UiButton>
            </template>
        </PageHeader>

        <LoadingState
            v-if="isSchoolContextLoading"
            title="Wczytywanie szkoły"
            description="Wczytujemy domyślną szkołę, do której zostanie przypisany pojazd."
        />

        <ErrorState
            v-else-if="schoolContextError"
            title="Nie udało się wczytać szkoły"
            :description="schoolContextError"
            @retry="loadSchoolContext"
        />

        <FormSection v-else-if="currentSchool">
            <SchoolContext
                :school="currentSchool"
                show-address
                class="border-border mb-5 border-b pb-4"
            />

            <VehicleForm
                :key="currentSchool.id"
                :form-id="formId"
                mode="create"
                :initial-vehicle="null"
                :is-saving="isCreateLoading"
                :api-error="apiError"
                :registration-number-error="registrationNumberError"
                hide-default-actions
                @submit="handleVehicleSubmit"
                @dirty-change="isFormDirty = $event"
                @registration-number-change="clearRegistrationNumberError"
            />

            <template #footer>
                <ActionGroup
                    label="Akcje formularza"
                    align="end"
                    class="max-sm:[&>*]:w-full"
                >
                    <UiButton as-child variant="outline">
                        <NuxtLink :to="vehiclesListRoute">Anuluj</NuxtLink>
                    </UiButton>
                    <UiButton
                        type="submit"
                        :form="formId"
                        :disabled="!canSubmit"
                        :aria-busy="isCreateLoading"
                    >
                        {{ isCreateLoading ? 'Dodawanie…' : 'Dodaj pojazd' }}
                    </UiButton>
                </ActionGroup>
            </template>
        </FormSection>
    </div>
</template>
