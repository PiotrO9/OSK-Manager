<script setup lang="ts">
import { ArrowLeft, Info, Save, Upload } from 'lucide-vue-next';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/shadcn/tooltip';
import type {
    Vehicle,
    VehicleDetail,
    VehicleWritePayload,
} from '~/types/vehicles/vehicle';
import type { HeaderMetaItem } from '~/components/app/ui/types';

definePageMeta({
    layout: 'app-shell',
    middleware: ['manager'],
});

usePageMeta({
    title: () => 'Edycja pojazdu',
    description: () => 'Zmien dane pojazdu.',
});

const route = useRoute();
const {
    fetchList,
    fetchVehicleById,
    updateVehicle,
    uploadVehiclePhoto,
    isUpdateLoading,
    isPhotoUploadLoading,
} = useVehiclesApi();

const FORM_ID = 'vehicle-edit-form';

const schoolId = computed(() => {
    const raw = route.query.schoolId;
    const s = Array.isArray(raw) ? raw[0] : raw;

    if (typeof s !== 'string') return null;

    const t = s.trim();

    return t.length > 0 ? t : null;
});

const vehicleId = computed(() => {
    const raw = route.params.id;
    const s = Array.isArray(raw) ? raw[0] : raw;

    if (typeof s !== 'string') return null;

    const t = s.trim();

    return t.length > 0 ? t : null;
});

const loadError = ref<string | null>(null);
const vehicles = ref<Vehicle[]>([]);
const isListBootloading = ref(false);
const apiError = ref<string | null>(null);

const vehicleDetail = ref<VehicleDetail | null>(null);
const detailLoadError = ref<string | null>(null);
const isDetailLoading = ref(false);
const photoFileInput = ref<HTMLInputElement | null>(null);
const photoUploadError = ref<string | null>(null);
const pendingPhotoFile = ref<File | null>(null);
const pendingPhotoObjectUrl = ref<string | null>(null);

const initialVehicle = computed<Vehicle | null>(() => {
    const fromList = vehicles.value.find((v) => v.id === vehicleId.value);

    return fromList ?? vehicleDetail.value;
});

const vehicleTitle = computed(() => {
    const name = initialVehicle.value?.name.trim();

    return name && name.length > 0 ? name : 'Edytuj pojazd';
});

const headerMeta = computed<HeaderMetaItem[]>(() => {
    const vehicle = initialVehicle.value;

    if (!vehicle) return [];

    return [
        {
            label: 'Rejestracja',
            value: vehicle.registrationNumber || '-',
            tone: 'neutral',
        },
        {
            label: 'Status',
            value: vehicle.status === 'UNAVAILABLE' ? 'Niedostępny' : 'Aktywny',
            tone: vehicle.status === 'UNAVAILABLE' ? 'warning' : 'success',
        },
    ];
});

const previewPhotoSrc = computed(() => {
    if (pendingPhotoObjectUrl.value) {
        return pendingPhotoObjectUrl.value;
    }

    const url = vehicleDetail.value?.photoUrl?.trim();

    return url && url.length > 0 ? url : null;
});

const pendingPhotoFileName = computed(
    () => pendingPhotoFile.value?.name ?? 'Nie wybrano pliku',
);

const isSaveBusy = computed(
    () => isUpdateLoading.value || isPhotoUploadLoading.value,
);

const vehiclesListRoute = computed(() => ({
    path: '/vehicles',
    query: schoolId.value !== null ? { schoolId: schoolId.value } : undefined,
}));

function revokePendingPhotoPreview() {
    if (pendingPhotoObjectUrl.value) {
        URL.revokeObjectURL(pendingPhotoObjectUrl.value);
        pendingPhotoObjectUrl.value = null;
    }

    pendingPhotoFile.value = null;
}

async function loadList() {
    const sid = schoolId.value;

    if (!sid) {
        vehicles.value = [];

        return;
    }

    loadError.value = null;
    isListBootloading.value = true;

    try {
        vehicles.value = await fetchList(sid);
    } catch (err) {
        loadError.value =
            err instanceof Error
                ? err.message
                : 'Nie udało się wczytać listy pojazdów.';
        vehicles.value = [];
    } finally {
        isListBootloading.value = false;
    }
}

watch(
    () => [schoolId.value, vehicleId.value] as const,
    () => {
        void loadList();
    },
    { immediate: true },
);

async function loadVehicleDetail() {
    const id = vehicleId.value;

    if (!id) {
        vehicleDetail.value = null;

        return;
    }

    isDetailLoading.value = true;
    detailLoadError.value = null;

    try {
        vehicleDetail.value = await fetchVehicleById(id);
    } catch (err) {
        detailLoadError.value =
            err instanceof Error
                ? err.message
                : 'Nie udało się wczytać szczegółów pojazdu.';
        vehicleDetail.value = null;
    } finally {
        isDetailLoading.value = false;
    }
}

watch(
    vehicleId,
    () => {
        revokePendingPhotoPreview();

        if (photoFileInput.value) {
            photoFileInput.value.value = '';
        }

        void loadVehicleDetail();
    },
    { immediate: true },
);

function handlePhotoFileInputChange() {
    photoUploadError.value = null;

    if (pendingPhotoObjectUrl.value) {
        URL.revokeObjectURL(pendingPhotoObjectUrl.value);
        pendingPhotoObjectUrl.value = null;
    }

    const input = photoFileInput.value;
    const file = input?.files?.[0] ?? null;

    pendingPhotoFile.value = file;

    if (file) {
        pendingPhotoObjectUrl.value = URL.createObjectURL(file);
    }
}

onUnmounted(() => {
    revokePendingPhotoPreview();
});

async function handleVehicleSubmit(payload: VehicleWritePayload) {
    const id = vehicleId.value;
    const sid = schoolId.value;

    if (!id || !sid) return;

    apiError.value = null;
    photoUploadError.value = null;

    const file = pendingPhotoFile.value;

    if (file && file.size > 5 * 1024 * 1024) {
        photoUploadError.value = 'Plik jest za duzy (maks. 5 MB).';

        return;
    }

    try {
        await updateVehicle(id, payload);

        if (file) {
            try {
                const photoUrl = await uploadVehiclePhoto(id, file);

                if (vehicleDetail.value) {
                    vehicleDetail.value = {
                        ...vehicleDetail.value,
                        photoUrl,
                    };
                }

                revokePendingPhotoPreview();

                if (photoFileInput.value) {
                    photoFileInput.value.value = '';
                }
            } catch (err) {
                photoUploadError.value =
                    err instanceof Error
                        ? err.message
                        : 'Nie udało się przesłać zdjęcia.';

                return;
            }
        }

        await navigateTo({
            path: '/vehicles',
            query: { schoolId: sid },
        });
    } catch (err) {
        apiError.value =
            err instanceof Error
                ? err.message
                : 'Nie udało się zapisać pojazdu.';
    }
}
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
                    :form="FORM_ID"
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
                :form-id="FORM_ID"
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
                        :form="FORM_ID"
                        :disabled="isSaveBusy"
                    >
                        {{ isSaveBusy ? 'Zapisywanie...' : 'Zapisz' }}
                    </UiButton>
                </ActionGroup>
            </template>
        </FormSection>
    </div>
</template>
