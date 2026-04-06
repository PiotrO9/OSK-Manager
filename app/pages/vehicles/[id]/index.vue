<script setup lang="ts">
import type { VehicleDetail } from '~/types/vehicle';
import { formatDate } from '~/utils/date';

definePageMeta({
    layout: 'app-shell',
    middleware: ['manager'],
});

usePageMeta({
    title: () => 'Szczegóły pojazdu',
    description: () => 'Podgląd danych pojazdu.',
});

const route = useRoute();
const { fetchVehicleById, isDetailLoading } = useVehiclesApi();

const vehicleId = computed(() => {
    const raw = route.params.id;
    const s = Array.isArray(raw) ? raw[0] : raw;

    if (typeof s !== 'string') return null;

    const t = s.trim();

    return t.length > 0 ? t : null;
});

const schoolId = computed(() => {
    const raw = route.query.schoolId;
    const s = Array.isArray(raw) ? raw[0] : raw;

    if (typeof s !== 'string') return null;

    const t = s.trim();

    return t.length > 0 ? t : null;
});

const vehicle = ref<VehicleDetail | null>(null);
const loadError = ref<string | null>(null);

function displayText(value: string): string {
    const t = value.trim();

    return t.length > 0 ? t : '—';
}

function displayDateYmd(isoYmd: string | null): string {
    if (!isoYmd) return '—';

    const formatted = formatDate(isoYmd, 'short');

    return formatted.trim().length > 0 ? formatted : '—';
}

function displayOptionalInt(value: number | null): string {
    if (value === null) return '—';

    return new Intl.NumberFormat('pl-PL').format(value);
}

async function loadVehicle() {
    const id = vehicleId.value;

    if (!id) {
        vehicle.value = null;

        return;
    }

    loadError.value = null;
    vehicle.value = null;

    try {
        vehicle.value = await fetchVehicleById(id);
    } catch (err) {
        loadError.value =
            err instanceof Error
                ? err.message
                : 'Nie udało się wczytać pojazdu.';
    }
}

watch(
    vehicleId,
    () => {
        void loadVehicle();
    },
    { immediate: true },
);
</script>

<template>
    <div class="space-y-6">
        <div class="space-y-1">
            <h1 class="text-foreground text-2xl font-semibold tracking-tight">
                Szczegóły pojazdu
            </h1>
            <p class="text-muted-foreground text-sm">
                Informacje o pojeździe — tylko do odczytu.
            </p>
        </div>

        <p
            v-if="vehicleId === null"
            class="text-muted-foreground text-sm"
            role="status"
        >
            Nieprawidłowy adres strony.
        </p>

        <p v-else-if="loadError" class="text-destructive text-sm" role="alert">
            {{ loadError }}
        </p>

        <p
            v-else-if="isDetailLoading"
            class="text-muted-foreground text-sm"
            role="status"
        >
            Wczytywanie danych pojazdu…
        </p>

        <div
            v-else-if="vehicle !== null"
            class="border-border bg-card max-w-2xl min-w-0 space-y-6 rounded-2xl border p-6 shadow-sm"
        >
            <div class="flex min-w-0 flex-col gap-6 sm:flex-row sm:items-start">
                <div
                    class="bg-muted text-muted-foreground relative aspect-video w-full max-w-md shrink-0 overflow-hidden rounded-xl sm:aspect-4/3 sm:w-56"
                >
                    <img
                        v-if="vehicle.photoUrl"
                        :src="vehicle.photoUrl"
                        :alt="`Zdjęcie pojazdu ${displayText(vehicle.name)}`"
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

                <div class="min-w-0 flex-1 space-y-3">
                    <div class="flex min-w-0 flex-wrap items-center gap-2">
                        <UiBadge
                            v-if="vehicle.status === 'UNAVAILABLE'"
                            variant="destructive"
                            class="shrink-0"
                        >
                            Niedostępny
                        </UiBadge>
                        <UiBadge v-else variant="secondary" class="shrink-0">
                            Aktywny
                        </UiBadge>
                        <span
                            v-if="vehicle.isDefault"
                            class="bg-primary/15 text-primary shrink-0 rounded-md px-2 py-0.5 text-xs font-medium"
                        >
                            Domyślny
                        </span>
                    </div>

                    <div class="min-w-0 space-y-1">
                        <h2
                            class="text-foreground text-lg font-semibold break-words"
                        >
                            {{ displayText(vehicle.name) }}
                        </h2>
                        <p
                            class="text-muted-foreground font-mono text-sm tracking-wide break-all"
                        >
                            {{ displayText(vehicle.registrationNumber) }}
                        </p>
                    </div>
                </div>
            </div>

            <dl
                class="border-border grid gap-4 border-t pt-6 sm:grid-cols-2"
                aria-label="Dane pojazdu"
            >
                <div>
                    <dt class="text-muted-foreground text-xs font-medium">
                        Data przeglądu
                    </dt>
                    <dd class="text-foreground mt-1 text-sm font-medium">
                        {{ displayDateYmd(vehicle.inspectionDate) }}
                    </dd>
                </div>
                <div>
                    <dt class="text-muted-foreground text-xs font-medium">
                        Data ubezpieczenia
                    </dt>
                    <dd class="text-foreground mt-1 text-sm font-medium">
                        {{ displayDateYmd(vehicle.insuranceDate) }}
                    </dd>
                </div>
                <div>
                    <dt class="text-muted-foreground text-xs font-medium">
                        Rocznik
                    </dt>
                    <dd class="text-foreground mt-1 text-sm font-medium">
                        {{ displayOptionalInt(vehicle.modelYear) }}
                    </dd>
                </div>
                <div>
                    <dt class="text-muted-foreground text-xs font-medium">
                        Przebieg (km)
                    </dt>
                    <dd class="text-foreground mt-1 text-sm font-medium">
                        {{ displayOptionalInt(vehicle.mileageKm) }}
                    </dd>
                </div>
            </dl>
        </div>

        <NuxtLink
            v-if="schoolId !== null"
            :to="{ path: '/vehicles', query: { schoolId } }"
            class="text-primary inline-flex text-sm font-medium underline-offset-4 hover:underline"
        >
            Wróć do listy pojazdów
        </NuxtLink>
        <NuxtLink
            v-else
            to="/vehicles"
            class="text-primary inline-flex text-sm font-medium underline-offset-4 hover:underline"
        >
            Wróć do listy pojazdów
        </NuxtLink>
    </div>
</template>
