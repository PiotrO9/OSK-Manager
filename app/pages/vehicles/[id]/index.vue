<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router';
import VehicleDetailsContent from '~/components/vehicles/VehicleDetailsContent.vue';
import { useVehiclesApi } from '~/composables/vehicles/useVehiclesApi';
import type { VehicleDetail } from '~/types/vehicles/vehicle';

definePageMeta({
    layout: 'app-shell',
    middleware: ['manager'],
});

const route = useRoute();
const { fetchVehicleById, isDetailLoading } = useVehiclesApi();

const vehicleId = computed(() => {
    const raw = route.params.id;
    const s = Array.isArray(raw) ? raw[0] : raw;

    if (typeof s !== 'string') return null;

    const trimmed = s.trim();

    return trimmed.length > 0 ? trimmed : null;
});

const schoolId = computed(() => {
    const raw = route.query.schoolId;
    const s = Array.isArray(raw) ? raw[0] : raw;

    if (typeof s !== 'string') return null;

    const trimmed = s.trim();

    return trimmed.length > 0 ? trimmed : null;
});

const vehicle = shallowRef<VehicleDetail | null>(null);
const loadError = shallowRef<string | null>(null);

const vehicleTitle = computed(() => {
    const name = vehicle.value?.name.trim();

    return name && name.length > 0 ? name : 'Szczegóły pojazdu';
});

const backToListHref = computed<RouteLocationRaw>(() => {
    if (schoolId.value === null) {
        return '/vehicles';
    }

    return {
        path: '/vehicles',
        query: { schoolId: schoolId.value },
    };
});

const editHref = computed<RouteLocationRaw>(() => {
    const id = vehicleId.value ?? '';
    const query = schoolId.value === null ? {} : { schoolId: schoolId.value };

    return {
        path: `/vehicles/${id}/edit`,
        query,
    };
});

usePageMeta({
    title: () => vehicleTitle.value,
    description: () => 'Dane pojazdu i status techniczny.',
});

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
            title="Nieprawidlowy adres strony"
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
            description="Pobieram status, rejestracje i dane techniczne."
        />

        <VehicleDetailsContent
            v-else-if="vehicle !== null"
            :vehicle="vehicle"
            :back-to-list-href="backToListHref"
            :edit-href="editHref"
        />
    </div>
</template>
