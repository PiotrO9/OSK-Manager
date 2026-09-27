<script setup lang="ts">
import { Save } from 'lucide-vue-next';
import { onBeforeRouteLeave, onBeforeRouteUpdate } from 'vue-router';
import VehicleEditPhotoSection from '~/components/vehicles/VehicleEditPhotoSection.vue';
import VehicleForm from '~/components/vehicles/VehicleForm.vue';
import { useVehicleEditPage } from '~/composables/vehicles/useVehicleEditPage';

definePageMeta({
    layout: 'app-shell',
    middleware: ['manager'],
});

usePageMeta({
    title: () => 'Edycja pojazdu',
    description: () => 'Zmień dane pojazdu.',
});

const route = useRoute();

const {
    apiError,
    canRetryPhotoUpload,
    clearPendingPhoto,
    clearRegistrationNumberError,
    formId,
    handlePhotoFileInputChange,
    handleVehicleSubmit,
    initialVehicle,
    isDetailLoading,
    hasPendingPhoto,
    isSaveBusy,
    loadError,
    isSaveNavigationAllowed,
    loadVehicleDetail,
    pendingPhotoFileName,
    pendingPhotoFileSize,
    photoUploadError,
    previewPhotoSrc,
    registrationNumberError,
    retryPhotoUpload,
    vehicleId,
    vehicleTitle,
    vehiclesListRoute,
} = useVehicleEditPage();

const isFormDirty = ref(false);
const hasUnsavedChanges = computed(
    () => isFormDirty.value || hasPendingPhoto.value,
);

function confirmLeave(): boolean {
    return (
        isSaveNavigationAllowed.value ||
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
    if (!isSaveNavigationAllowed.value && hasUnsavedChanges.value) {
        event.preventDefault();
        event.returnValue = '';
    }
}

onMounted(() => {
    if (Object.keys(route.query).length > 0) {
        void navigateTo(route.path, { replace: true });
    }

    window.addEventListener('beforeunload', handleBeforeUnload);
});
onBeforeUnmount(() =>
    window.removeEventListener('beforeunload', handleBeforeUnload),
);
</script>

<template>
    <div class="space-y-6">
        <PageHeader
            :title="vehicleTitle"
            description="Zaktualizuj dane pojazdu i zdjęcie widoczne w panelu OSK."
        >
            <template #actions>
                <UiButton
                    type="submit"
                    :form="formId"
                    :disabled="isSaveBusy || initialVehicle === null"
                    :aria-busy="isSaveBusy"
                >
                    <Save class="size-4" aria-hidden="true" />
                    {{ isSaveBusy ? 'Zapisywanie…' : 'Zapisz zmiany' }}
                </UiButton>
            </template>
        </PageHeader>

        <ErrorState
            v-if="vehicleId === null"
            title="Nieprawidłowy adres strony"
            description="Nie znaleziono identyfikatora pojazdu w adresie."
        >
            <template #action>
                <UiButton as-child variant="outline" class="bg-background">
                    <NuxtLink to="/vehicles">Wróć do listy</NuxtLink>
                </UiButton>
            </template>
        </ErrorState>

        <ErrorState
            v-else-if="loadError"
            title="Nie udało się wczytać pojazdu"
            :description="loadError"
            @retry="loadVehicleDetail"
        />

        <LoadingState
            v-else-if="isDetailLoading && initialVehicle === null"
            title="Wczytywanie pojazdu"
            description="Pobieramy dane potrzebne do edycji formularza."
        />

        <EmptyState
            v-else-if="initialVehicle === null"
            title="Nie znaleziono pojazdu"
            description="Wróć do listy pojazdów i otwórz edycję ponownie."
        >
            <template #action>
                <UiButton as-child variant="outline">
                    <NuxtLink :to="vehiclesListRoute">Wróć do listy</NuxtLink>
                </UiButton>
            </template>
        </EmptyState>

        <FormSection
            v-else
            title="Dane pojazdu"
            description="Uzupełnij dane identyfikacyjne, terminy dokumentów i aktualny przebieg."
        >
            <VehicleForm
                :form-id="formId"
                mode="edit"
                :initial-vehicle="initialVehicle"
                :is-saving="isSaveBusy"
                :api-error="apiError"
                :registration-number-error="registrationNumberError"
                hide-default-actions
                @submit="handleVehicleSubmit"
                @dirty-change="isFormDirty = $event"
                @registration-number-change="clearRegistrationNumberError"
            >
                <template #afterFields>
                    <VehicleEditPhotoSection
                        :can-retry="canRetryPhotoUpload"
                        :file-name="pendingPhotoFileName"
                        :file-size="pendingPhotoFileSize"
                        :has-pending-file="hasPendingPhoto"
                        :is-busy="isSaveBusy"
                        :photo-upload-error="photoUploadError"
                        :preview-photo-src="previewPhotoSrc"
                        :vehicle-name="initialVehicle.name"
                        @clear-file="clearPendingPhoto"
                        @file-change="handlePhotoFileInputChange"
                        @retry-photo-upload="retryPhotoUpload"
                    />
                </template>
            </VehicleForm>

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
                        :disabled="isSaveBusy"
                        :aria-busy="isSaveBusy"
                    >
                        {{ isSaveBusy ? 'Zapisywanie…' : 'Zapisz zmiany' }}
                    </UiButton>
                </ActionGroup>
            </template>
        </FormSection>
    </div>
</template>
