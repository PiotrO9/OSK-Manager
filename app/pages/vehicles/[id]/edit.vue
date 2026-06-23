<script setup lang="ts">
import type {
    Vehicle,
    VehicleDetail,
    VehicleWritePayload,
} from '~/types/vehicle';

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
    fetchList,
    fetchVehicleById,
    updateVehicle,
    uploadVehiclePhoto,
    isUpdateLoading,
    isPhotoUploadLoading,
} = useVehiclesApi();

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

const initialVehicle = computed(
    () => vehicles.value.find((v) => v.id === vehicleId.value) ?? null,
);

const previewPhotoSrc = computed(() => {
    if (pendingPhotoObjectUrl.value) {
        return pendingPhotoObjectUrl.value;
    }

    const url = vehicleDetail.value?.photoUrl?.trim();

    return url && url.length > 0 ? url : null;
});

const isSaveBusy = computed(
    () => isUpdateLoading.value || isPhotoUploadLoading.value,
);

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
        photoUploadError.value = 'Plik jest za duży (maks. 5 MB).';

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
        <div class="space-y-1">
            <h1 class="text-foreground text-2xl font-semibold tracking-tight">
                Edycja pojazdu
            </h1>
            <p class="text-muted-foreground text-sm">
                Zaktualizuj dane pojazdu. Wymagane są nazwa i numer
                rejestracyjny. Zdjęcie wybierz poniżej — zostanie wysłane po
                kliknięciu „Zapisz”.
            </p>
        </div>

        <p
            v-if="schoolId === null || vehicleId === null"
            class="text-muted-foreground text-sm"
            role="status"
        >
            Nieprawidłowy adres strony. Użyj linku „Edytuj” z listy pojazdów.
        </p>

        <p v-else-if="loadError" class="text-destructive text-sm" role="alert">
            {{ loadError }}
        </p>

        <div
            v-else-if="isListBootloading"
            class="text-muted-foreground text-sm"
            role="status"
        >
            Wczytywanie danych pojazdu…
        </div>

        <p
            v-else-if="initialVehicle === null"
            class="text-muted-foreground text-sm"
            role="status"
        >
            Nie znaleziono pojazdu o podanym identyfikatorze. Wróć do listy i
            spróbuj ponownie.
        </p>

        <VehicleForm
            v-else
            mode="edit"
            :initial-vehicle="initialVehicle"
            :is-saving="isSaveBusy"
            :api-error="apiError"
            @submit="handleVehicleSubmit"
        >
            <template #afterFields>
                <section
                    class="border-border space-y-4 rounded-2xl border p-6"
                    aria-label="Zdjęcie pojazdu"
                >
                    <h2 class="text-foreground text-base font-semibold">
                        Zdjęcie pojazdu
                    </h2>

                    <p
                        v-if="detailLoadError"
                        class="text-destructive text-sm"
                        role="alert"
                    >
                        {{ detailLoadError }}
                    </p>

                    <p
                        v-if="isDetailLoading && !previewPhotoSrc"
                        class="text-muted-foreground text-sm"
                        role="status"
                    >
                        Wczytywanie podglądu zdjęcia…
                    </p>

                    <div
                        v-else
                        class="bg-muted text-muted-foreground relative aspect-video max-w-md overflow-hidden rounded-xl"
                    >
                        <img
                            v-if="previewPhotoSrc"
                            :src="previewPhotoSrc"
                            :alt="`Zdjęcie pojazdu ${initialVehicle?.name ?? ''}`"
                            class="size-full object-cover"
                        />
                        <div
                            v-else
                            class="flex size-full items-center justify-center px-4 text-center text-sm"
                            role="img"
                            aria-label="Brak zdjęcia pojazdu"
                        >
                            Brak zdjęcia
                        </div>
                    </div>

                    <div class="min-w-0">
                        <label
                            for="vehicle-photo-input"
                            class="text-muted-foreground mb-1 block text-xs font-medium"
                        >
                            Nowe zdjęcie (JPEG, PNG lub WebP, max 5 MB)
                        </label>
                        <input
                            id="vehicle-photo-input"
                            ref="photoFileInput"
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            class="text-foreground file:text-foreground file:bg-muted max-w-full cursor-pointer text-sm file:mr-3 file:rounded-md file:border-0 file:px-3 file:py-1.5"
                            :disabled="isSaveBusy"
                            @change="handlePhotoFileInputChange"
                        />
                    </div>

                    <p
                        v-if="photoUploadError"
                        class="text-destructive text-sm"
                        role="alert"
                    >
                        {{ photoUploadError }}
                    </p>
                </section>
            </template>
        </VehicleForm>

        <NuxtLink
            v-if="schoolId !== null"
            :to="{ path: '/vehicles', query: { schoolId } }"
            class="text-primary inline-flex text-sm font-medium underline-offset-4 hover:underline"
        >
            Wróć do listy pojazdów
        </NuxtLink>
    </div>
</template>
