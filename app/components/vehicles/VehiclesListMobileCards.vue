<script setup lang="ts">
import { Car, Eye, Pencil, Trash2 } from 'lucide-vue-next';
import type { VehicleStatusUpdateBody } from '~/composables/vehicles/useVehiclesApi';
import type { VehiclesListPanelId } from '~/composables/vehicles/useVehiclesListPage';
import type { Vehicle } from '~/types/vehicles/vehicle';
import {
    displayVehicleText,
    formatVehicleMeta,
    vehicleStatusLabel,
    vehicleStatusTone,
} from '~/utils/vehicles/display';

defineProps<{
    isManager: boolean;
    activePanel: VehiclesListPanelId;
    resolvedSchoolId: string | null;
    vehicles: Vehicle[];
    isDeleteLoading: boolean;
    isSetDefaultLoading: boolean;
    statusUpdatingVehicleId: string | null;
}>();

defineEmits<{
    statusChange: [vehicle: Vehicle, payload: VehicleStatusUpdateBody];
    requestDelete: [vehicle: Vehicle];
    setDefault: [vehicle: Vehicle];
}>();
</script>

<template>
    <div class="space-y-3 p-3">
        <article
            v-for="vehicle in vehicles"
            :key="vehicle.id"
            class="border-border bg-background rounded-2xl border p-4"
        >
            <div class="flex min-w-0 items-start gap-3">
                <div
                    class="flex size-9 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-700"
                >
                    <Car class="size-4" aria-hidden="true" />
                </div>
                <div class="min-w-0 flex-1">
                    <p class="text-foreground truncate font-extrabold">
                        {{ displayVehicleText(vehicle.name) }}
                    </p>
                    <p class="text-muted-foreground mt-1 truncate text-sm">
                        {{ displayVehicleText(vehicle.registrationNumber) }}
                    </p>
                </div>
            </div>

            <div class="mt-3 flex flex-wrap gap-2">
                <StatusBadge
                    :label="vehicleStatusLabel(vehicle)"
                    :tone="vehicleStatusTone(vehicle)"
                />
                <StatusBadge
                    v-if="vehicle.isDefault"
                    label="Domyślny"
                    tone="info"
                    subtle
                />
                <StatusBadge
                    :label="formatVehicleMeta(vehicle)"
                    tone="neutral"
                    subtle
                />
            </div>

            <div
                v-if="isManager && activePanel === 'manager'"
                class="mt-4 flex flex-wrap items-center justify-between gap-3"
            >
                <VehicleAvailabilityControl
                    id-prefix="vehicle-status-mobile"
                    :vehicle="vehicle"
                    :disabled="statusUpdatingVehicleId === vehicle.id"
                    :busy="statusUpdatingVehicleId === vehicle.id"
                    :control-label="`Zmien status pojazdu ${displayVehicleText(vehicle.name)}, ${displayVehicleText(vehicle.registrationNumber)}`"
                    @status-change="$emit('statusChange', vehicle, $event)"
                />
            </div>

            <ActionGroup
                v-if="isManager && resolvedSchoolId"
                class="mt-4"
                :label="`Akcje: ${displayVehicleText(vehicle.name)}`"
                density="compact"
            >
                <UiButton
                    as-child
                    variant="outline"
                    size="sm"
                    class="rounded-full"
                >
                    <NuxtLink
                        :to="{
                            path: `/vehicles/${vehicle.id}`,
                            query: {
                                schoolId: resolvedSchoolId,
                            },
                        }"
                    >
                        <Eye class="size-4" aria-hidden="true" />
                        Szczegóły
                    </NuxtLink>
                </UiButton>
                <UiButton
                    as-child
                    variant="outline"
                    size="icon"
                    class="size-9 rounded-full"
                >
                    <NuxtLink
                        :to="{
                            path: `/vehicles/${vehicle.id}/edit`,
                            query: {
                                schoolId: resolvedSchoolId,
                            },
                        }"
                        class="inline-flex size-9 items-center justify-center"
                        :aria-label="`Edytuj pojazd ${displayVehicleText(vehicle.name)}, ${displayVehicleText(vehicle.registrationNumber)}`"
                    >
                        <Pencil class="size-4" aria-hidden="true" />
                    </NuxtLink>
                </UiButton>
                <UiButton
                    type="button"
                    variant="outline"
                    size="icon"
                    class="text-destructive hover:bg-destructive/10 hover:text-destructive size-9 rounded-full"
                    :disabled="isDeleteLoading"
                    :aria-label="`Usun pojazd ${displayVehicleText(vehicle.name)}, ${displayVehicleText(vehicle.registrationNumber)}`"
                    @click="$emit('requestDelete', vehicle)"
                >
                    <Trash2 class="size-4" aria-hidden="true" />
                </UiButton>
            </ActionGroup>

            <UiButton
                v-if="isManager && resolvedSchoolId && !vehicle.isDefault"
                type="button"
                variant="secondary"
                size="sm"
                class="mt-3 w-full rounded-xl"
                :disabled="isSetDefaultLoading"
                :aria-busy="isSetDefaultLoading"
                :aria-label="`Ustaw jako domyslny: ${displayVehicleText(vehicle.name)}, ${displayVehicleText(vehicle.registrationNumber)}`"
                @click="$emit('setDefault', vehicle)"
            >
                Ustaw jako domyslny
            </UiButton>
        </article>
    </div>
</template>
