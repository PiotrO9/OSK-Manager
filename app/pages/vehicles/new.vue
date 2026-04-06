<script setup lang="ts">
import type { VehicleWritePayload } from '~/types/vehicle';

definePageMeta({
    layout: 'app-shell',
    middleware: ['manager'],
});

usePageMeta({
    title: () => 'Nowy pojazd',
    description: () => 'Dodaj pojazd do szkoły jazdy.',
});

const route = useRoute();
const { createVehicle, isCreateLoading } = useVehiclesApi();

const apiError = ref<string | null>(null);

const schoolId = computed(() => {
    const raw = route.query.schoolId;
    const s = Array.isArray(raw) ? raw[0] : raw;

    if (typeof s !== 'string') return null;

    const t = s.trim();

    return t.length > 0 ? t : null;
});

async function handleVehicleSubmit(payload: VehicleWritePayload) {
    const sid = schoolId.value;

    if (!sid) return;

    apiError.value = null;

    try {
        await createVehicle({
            schoolId: sid,
            ...payload,
        });

        await navigateTo({
            path: '/vehicles',
            query: { schoolId: sid },
        });
    } catch (err) {
        apiError.value =
            err instanceof Error ? err.message : 'Nie udało się dodać pojazdu.';
    }
}
</script>

<template>
    <div class="space-y-6">
        <div class="space-y-1">
            <h1 class="text-foreground text-2xl font-semibold tracking-tight">
                Nowy pojazd
            </h1>
            <p class="text-muted-foreground text-sm">
                Dodaj pojazd przypisany do wybranej szkoły jazdy.
            </p>
        </div>

        <p
            v-if="schoolId === null"
            class="text-muted-foreground text-sm"
            role="status"
        >
            Brak parametru szkoły. Otwórz tę stronę z listy pojazdów (link
            „Dodaj pojazd”) lub dodaj
            <span class="font-mono">?schoolId=…</span> w adresie URL.
        </p>

        <VehicleForm
            v-else
            mode="create"
            :initial-vehicle="null"
            :is-saving="isCreateLoading"
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
