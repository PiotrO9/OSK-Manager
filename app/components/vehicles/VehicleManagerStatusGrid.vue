<script setup lang="ts">
import type { VehicleStatusUpdateBody } from '~/composables/vehicles/useVehiclesApi';
import type { Vehicle } from '~/types/vehicles/vehicle';

defineProps<{
    statusUpdatingVehicleId: string | null;
    vehicles: Vehicle[];
}>();

defineEmits<{
    statusChange: [vehicle: Vehicle, payload: VehicleStatusUpdateBody];
}>();

function displayText(value: string): string {
    const t = value.trim();

    return t.length > 0 ? t : '-';
}
</script>

<template>
    <div class="border-border bg-card rounded-xl border p-4 shadow-xs">
        <div class="flex flex-wrap items-center justify-between gap-3">
            <div class="min-w-0">
                <p class="text-foreground text-sm font-semibold">
                    Szybka kontrola statusow
                </p>
                <p class="text-muted-foreground mt-1 text-xs">
                    Przełącz dostępność pojazdów bez wchodzenia w edycję.
                </p>
            </div>
        </div>
        <div class="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
            <div
                v-for="vehicle in vehicles"
                :key="`status-control-${vehicle.id}`"
                class="border-border bg-background flex items-center justify-between gap-3 rounded-xl border px-3 py-2"
            >
                <span class="min-w-0">
                    <span
                        class="text-foreground block truncate text-sm font-semibold"
                    >
                        {{ displayText(vehicle.name) }}
                    </span>
                    <span class="text-muted-foreground block text-xs">
                        {{ displayText(vehicle.registrationNumber) }}
                    </span>
                </span>
                <VehicleAvailabilityControl
                    id-prefix="vehicle-status"
                    :vehicle="vehicle"
                    :disabled="statusUpdatingVehicleId === vehicle.id"
                    :busy="statusUpdatingVehicleId === vehicle.id"
                    :control-label="`Zmien status pojazdu ${displayText(vehicle.name)}, ${displayText(vehicle.registrationNumber)}`"
                    @status-change="$emit('statusChange', vehicle, $event)"
                />
            </div>
        </div>
    </div>
</template>
