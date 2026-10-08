<script setup lang="ts">
import { Car, Eye, Pencil, Trash2 } from 'lucide-vue-next';
import type { Vehicle } from '~/types/vehicles/vehicle';
import {
    displayVehicleText,
    formatVehicleMeta,
    getVehicleDeadlinePresentation,
    vehicleStatusLabel,
    vehicleStatusTone,
} from '~/utils/vehicles/display';

defineProps<{
    isManager: boolean;
    resolvedSchoolId: string | null;
    vehicles: Vehicle[];
    isDeleteLoading: boolean;
    isSetDefaultLoading: boolean;
}>();

defineEmits<{
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
                <span class="inline-flex items-center gap-1">
                    <StatusBadge
                        :label="formatVehicleMeta(vehicle)"
                        tone="neutral"
                        subtle
                    />
                    <VehicleUpdatedAtInfo :updated-at="vehicle.updatedAt" />
                </span>
            </div>

            <div class="border-border mt-4 grid gap-2 border-t pt-3 text-xs">
                <div class="flex min-w-0 items-center justify-between gap-3">
                    <span class="text-muted-foreground">Przegląd</span>
                    <StatusBadge
                        :label="
                            getVehicleDeadlinePresentation(
                                vehicle.inspectionDate,
                            ).label
                        "
                        :tone="
                            getVehicleDeadlinePresentation(
                                vehicle.inspectionDate,
                            ).tone
                        "
                        subtle
                    />
                </div>
                <div class="flex min-w-0 items-center justify-between gap-3">
                    <span class="text-muted-foreground">OC</span>
                    <StatusBadge
                        :label="
                            getVehicleDeadlinePresentation(
                                vehicle.insuranceDate,
                            ).label
                        "
                        :tone="
                            getVehicleDeadlinePresentation(
                                vehicle.insuranceDate,
                            ).tone
                        "
                        subtle
                    />
                </div>
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
                    <NuxtLink :to="`/vehicles/${vehicle.id}`">
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
                        :to="`/vehicles/${vehicle.id}/edit`"
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
                    :aria-label="`Usuń pojazd ${displayVehicleText(vehicle.name)}, ${displayVehicleText(vehicle.registrationNumber)}`"
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
                :aria-label="`Ustaw jako domyślny: ${displayVehicleText(vehicle.name)}, ${displayVehicleText(vehicle.registrationNumber)}`"
                @click="$emit('setDefault', vehicle)"
            >
                Ustaw jako domyślny
            </UiButton>
        </article>
    </div>
</template>
