<script setup lang="ts">
import { ArrowLeft, Info, Save, Upload } from 'lucide-vue-next';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/shadcn/tooltip';

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
    photoFileInput,
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
                    <section
                        class="border-border bg-muted/20 grid gap-4 rounded-xl border p-4 md:grid-cols-[minmax(0,18rem)_minmax(0,24rem)] md:items-start"
                        aria-label="Zdjecie pojazdu"
                    >
                        <div class="space-y-2">
                            <h3 class="text-foreground text-sm font-semibold">
                                Zdjecie pojazdu
                            </h3>
                            <p class="text-muted-foreground text-sm">
                                Wybierz nowe zdjecie, a zostanie przeslane razem
                                z zapisem formularza.
                            </p>

                            <p
                                v-if="detailLoadError"
                                class="text-destructive text-sm"
                                role="alert"
                            >
                                {{ detailLoadError }}
                            </p>
                        </div>

                        <div class="min-w-0 space-y-3 md:max-w-sm">
                            <div
                                class="bg-background text-muted-foreground border-border relative aspect-[4/3] max-w-80 overflow-hidden rounded-xl border"
                            >
                                <img
                                    v-if="previewPhotoSrc"
                                    :src="previewPhotoSrc"
                                    :alt="`Zdjecie pojazdu ${initialVehicle.name}`"
                                    class="size-full object-cover"
                                />
                                <div
                                    v-else-if="isDetailLoading"
                                    class="flex size-full items-center justify-center px-4 text-center text-sm"
                                    role="status"
                                >
                                    Wczytywanie podgladu zdjęcia...
                                </div>
                                <div
                                    v-else
                                    class="flex size-full items-center justify-center px-4 text-center text-sm"
                                    role="img"
                                    aria-label="Brak zdjęcia pojazdu"
                                >
                                    Brak zdjęcia
                                </div>
                            </div>

                            <div class="min-w-0 space-y-2">
                                <div class="flex items-center gap-2">
                                    <p
                                        class="text-foreground text-sm font-semibold"
                                    >
                                        Nowe zdjecie
                                    </p>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger as-child>
                                                <button
                                                    type="button"
                                                    class="text-muted-foreground hover:text-foreground focus-visible:ring-ring inline-flex size-5 items-center justify-center rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                                                    aria-label="Wymagania zdjęcia pojazdu"
                                                >
                                                    <Info
                                                        class="size-4"
                                                        aria-hidden="true"
                                                    />
                                                </button>
                                            </TooltipTrigger>
                                            <TooltipContent
                                                side="right"
                                                align="center"
                                            >
                                                JPEG, PNG lub WebP, maksymalnie
                                                5 MB.
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>

                                <input
                                    id="vehicle-photo-input"
                                    ref="photoFileInput"
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    class="sr-only"
                                    aria-label="Wybierz nowe zdjecie pojazdu"
                                    :disabled="isSaveBusy"
                                    @change="handlePhotoFileInputChange"
                                />

                                <div
                                    class="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center"
                                >
                                    <UiButton
                                        as-child
                                        type="button"
                                        variant="secondary"
                                        :disabled="isSaveBusy"
                                    >
                                        <label
                                            for="vehicle-photo-input"
                                            class="cursor-pointer"
                                        >
                                            <Upload
                                                class="size-4"
                                                aria-hidden="true"
                                            />
                                            Wybierz plik
                                        </label>
                                    </UiButton>
                                    <p
                                        class="text-muted-foreground min-w-0 truncate text-sm"
                                        aria-live="polite"
                                    >
                                        {{ pendingPhotoFileName }}
                                    </p>
                                </div>
                            </div>

                            <p
                                v-if="photoUploadError"
                                class="text-destructive text-sm"
                                role="alert"
                            >
                                {{ photoUploadError }}
                            </p>
                        </div>
                    </section>
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
