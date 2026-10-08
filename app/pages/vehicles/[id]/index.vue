<script setup lang="ts">
import VehicleDetailsContent from '~/components/vehicles/VehicleDetailsContent.vue';
import { useVehiclesApi } from '~/composables/vehicles/useVehiclesApi';
import type { VehicleDetail } from '~/types/vehicles/vehicle';

definePageMeta({
    layout: 'app-shell',
    middleware: ['manager'],
});

const route = useRoute();
const { fetchVehicleById, isDetailLoading } = useVehiclesApi();

onMounted(() => {
    if (Object.keys(route.query).length > 0) {
        void navigateTo(route.path, { replace: true });
    }
});

const vehicleId = computed(() => {
    const rawVehicleId = route.params.id;
    const vehicleIdParam = Array.isArray(rawVehicleId)
        ? rawVehicleId[0]
        : rawVehicleId;

    if (typeof vehicleIdParam !== 'string') return null;

    const trimmed = vehicleIdParam.trim();

    return trimmed.length > 0 ? trimmed : null;
});

const vehicle = shallowRef<VehicleDetail | null>(null);
const loadError = shallowRef<string | null>(null);
let vehicleLoadSequence = 0;

const vehicleTitle = computed(() => {
    const name = vehicle.value?.name.trim();

    return name && name.length > 0 ? name : 'Szczegóły pojazdu';
});

const backToListHref = '/vehicles';
const editHref = computed(() => {
    const id = vehicleId.value ?? '';

    return `/vehicles/${id}/edit`;
});

usePageMeta({
    title: () => vehicleTitle.value,
    description: () => 'Dane pojazdu i status techniczny.',
});

async function loadVehicle() {
    const id = vehicleId.value;
    const requestSequence = ++vehicleLoadSequence;

    if (!id) {
        vehicle.value = null;

        return;
    }

    loadError.value = null;
    vehicle.value = null;

    try {
        const detail = await fetchVehicleById(id);

        if (requestSequence !== vehicleLoadSequence) {
            return;
        }

        vehicle.value = detail;
    } catch (err) {
        if (requestSequence !== vehicleLoadSequence) {
            return;
        }

        loadError.value =
            err instanceof Error && err.message.trim().length > 0
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
        <ErrorState
            v-if="vehicleId === null"
            title="Nieprawidłowy adres strony"
            description="Nie znaleziono identyfikatora pojazdu w adresie."
        >
            <template #action>
                <UiButton as-child variant="outline" size="sm">
                    <NuxtLink :to="backToListHref">Lista pojazdów</NuxtLink>
                </UiButton>
            </template>
        </ErrorState>

        <ErrorState
            v-else-if="loadError"
            title="Nie udało się wczytać pojazdu"
            :description="loadError"
            @retry="loadVehicle"
        />

        <LoadingState
            v-else-if="isDetailLoading"
            title="Wczytywanie pojazdu"
            description="Pobieram status, rejestrację i dane techniczne."
        />

        <VehicleDetailsContent
            v-else-if="vehicle !== null"
            :vehicle="vehicle"
            :back-to-list-href="backToListHref"
            :edit-href="editHref"
        />
    </div>
</template>
