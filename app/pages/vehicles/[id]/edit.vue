<script setup lang="ts">
import { ArrowLeft, Save } from 'lucide-vue-next';

definePageMeta({
    layout: 'app-shell',
    middleware: ['manager'],
});

usePageMeta({
    title: () => 'Edycja pojazdu',
    description: () => 'Zmien dane pojazdu.',
});

const {
    apiError,
    detailLoadError,
    formId,
    handlePhotoFileInputChange,
    handleVehicleSubmit,
    headerMeta,
    initialVehicle,
    isDetailLoading,
    isListBootloading,
    isSaveBusy,
    loadError,
    loadList,
    pendingPhotoFileName,
    photoUploadError,
    previewPhotoSrc,
    schoolId,
    vehicleId,
    vehicleTitle,
    vehiclesListRoute,
} = useVehicleEditPage();
</script>

<template>
    <div class="space-y-6">
        <PageHeader
            :title="vehicleTitle"
            description="Zaktualizuj dane pojazdu i zdjecie widoczne w panelu OSK."
            eyebrow="Edycja pojazdu"
            :meta="headerMeta"
        >
            <template #actions>
                <UiButton as-child variant="outline">
                    <NuxtLink :to="vehiclesListRoute">
                        <ArrowLeft class="size-4" aria-hidden="true" />
                        Anuluj
                    </NuxtLink>
                </UiButton>
                <UiButton
                    type="submit"
                    :form="formId"
                    :disabled="isSaveBusy || initialVehicle === null"
                >
                    <Save class="size-4" aria-hidden="true" />
                    {{ isSaveBusy ? 'Zapisywanie...' : 'Zapisz zmiany' }}
                </UiButton>
            </template>
        </PageHeader>

        <ErrorState
            v-if="schoolId === null || vehicleId === null"
            title="Nieprawidlowy adres strony"
            description="Otwórz edycję z listy pojazdów, aby zachować kontekst OSK i identyfikator pojazdu."
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
            @retry="loadList"
        />

        <LoadingState
            v-else-if="isListBootloading && initialVehicle === null"
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
            title="Edytuj pojazd"
            description="Formularz jest podzielony na logiczne sekcje bez zmiany walidacji i flow zapisu."
        >
            <VehicleForm
                :form-id="formId"
                mode="edit"
                :initial-vehicle="initialVehicle"
                :is-saving="isSaveBusy"
                :api-error="apiError"
                hide-default-actions
                @submit="handleVehicleSubmit"
            >
                <template #afterFields>
                    <VehicleEditPhotoSection
                        :detail-load-error="detailLoadError"
                        :file-name="pendingPhotoFileName"
                        :is-busy="isSaveBusy"
                        :is-detail-loading="isDetailLoading"
                        :photo-upload-error="photoUploadError"
                        :preview-photo-src="previewPhotoSrc"
                        :vehicle-name="initialVehicle.name"
                        @file-change="handlePhotoFileInputChange"
                    />
                </template>
            </VehicleForm>

            <template #footer>
                <ActionGroup label="Akcje formularza" align="end">
                    <UiButton as-child variant="outline">
                        <NuxtLink :to="vehiclesListRoute">Anuluj</NuxtLink>
                    </UiButton>
                    <UiButton
                        type="submit"
                        :form="formId"
                        :disabled="isSaveBusy"
                    >
                        {{ isSaveBusy ? 'Zapisywanie...' : 'Zapisz' }}
                    </UiButton>
                </ActionGroup>
            </template>
        </FormSection>
    </div>
</template>
