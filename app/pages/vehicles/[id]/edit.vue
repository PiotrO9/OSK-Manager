<script setup lang="ts">
import type { Vehicle, VehicleWritePayload } from '~/types/vehicle';

definePageMeta({
    layout: 'app-shell',
    middleware: ['manager'],
});

usePageMeta({
    title: () => 'Edycja pojazdu',
    description: () => 'Zmień dane pojazdu.',
});

const route = useRoute();
const { fetchList, updateVehicle, isUpdateLoading } = useVehiclesApi();

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

const initialVehicle = computed(
    () => vehicles.value.find((v) => v.id === vehicleId.value) ?? null,
);

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

async function handleVehicleSubmit(payload: VehicleWritePayload) {
    const id = vehicleId.value;
    const sid = schoolId.value;

    if (!id || !sid) return;

    apiError.value = null;

    try {
        await updateVehicle(id, payload);

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
                rejestracyjny.
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
            :is-saving="isUpdateLoading"
            :api-error="apiError"
            @submit="handleVehicleSubmit"
        />

        <NuxtLink
            v-if="schoolId !== null"
            :to="{ path: '/vehicles', query: { schoolId } }"
            class="text-primary inline-flex text-sm font-medium underline-offset-4 hover:underline"
        >
            Wróć do listy pojazdów
        </NuxtLink>
    </div>
</template>
