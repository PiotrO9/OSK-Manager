<script setup lang="ts">
import { Pencil, Star, Trash2 } from 'lucide-vue-next';
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
    statusUpdatingVehicleId: string | null;
}>();

defineEmits<{
    requestDelete: [vehicle: Vehicle];
    setDefault: [vehicle: Vehicle];
}>();
</script>

<template>
    <table class="w-full min-w-[980px] text-left text-sm">
        <thead class="bg-muted/35 text-muted-foreground border-b">
            <tr>
                <th scope="col" class="px-4 py-3 font-semibold">Nazwa</th>
                <th scope="col" class="px-4 py-3 font-semibold">Dane</th>
                <th scope="col" class="px-4 py-3 font-semibold">Status</th>
                <th scope="col" class="px-4 py-3 font-semibold">Terminy</th>
                <th scope="col" class="px-4 py-3 text-right font-semibold">
                    Akcje
                </th>
            </tr>
        </thead>
        <tbody class="divide-border divide-y">
            <tr
                v-for="vehicle in vehicles"
                :key="vehicle.id"
                class="hover:bg-muted/25"
            >
                <td class="px-4 py-3">
                    <div class="min-w-0">
                        <p
                            class="text-foreground truncate font-extrabold"
                            :title="displayVehicleText(vehicle.name)"
                        >
                            {{ displayVehicleText(vehicle.name) }}
                        </p>
                        <p
                            class="text-muted-foreground mt-0.5 truncate text-xs"
                            :title="
                                displayVehicleText(vehicle.registrationNumber)
                            "
                        >
                            {{ displayVehicleText(vehicle.registrationNumber) }}
                        </p>
                    </div>
                </td>
                <td class="text-muted-foreground px-4 py-3">
                    <span class="inline-flex items-center gap-1">
                        <span>{{ formatVehicleMeta(vehicle) }}</span>
                        <VehicleUpdatedAtInfo :updated-at="vehicle.updatedAt" />
                    </span>
                </td>
                <td class="px-4 py-3">
                    <div class="flex flex-wrap items-center gap-2">
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
                        <span
                            v-if="statusUpdatingVehicleId === vehicle.id"
                            class="text-muted-foreground text-xs"
                            role="status"
                        >
                            Zapisywanie…
                        </span>
                    </div>
                </td>
                <td class="text-muted-foreground px-4 py-3">
                    <div class="flex flex-col items-start gap-1.5">
                        <StatusBadge
                            :label="`Przegląd: ${getVehicleDeadlinePresentation(vehicle.inspectionDate).label}`"
                            :tone="
                                getVehicleDeadlinePresentation(
                                    vehicle.inspectionDate,
                                ).tone
                            "
                            subtle
                        />
                        <StatusBadge
                            :label="`OC: ${getVehicleDeadlinePresentation(vehicle.insuranceDate).label}`"
                            :tone="
                                getVehicleDeadlinePresentation(
                                    vehicle.insuranceDate,
                                ).tone
                            "
                            subtle
                        />
                    </div>
                </td>
                <td class="px-4 py-3">
                    <ActionGroup
                        v-if="isManager && resolvedSchoolId"
                        :label="`Akcje: ${displayVehicleText(vehicle.name)}`"
                        align="end"
                        density="compact"
                    >
                        <UiButton
                            v-if="!vehicle.isDefault"
                            type="button"
                            variant="ghost"
                            size="icon"
                            class="size-9 rounded-full"
                            :disabled="isSetDefaultLoading"
                            :aria-busy="isSetDefaultLoading"
                            :aria-label="`Ustaw jako domyślny pojazd: ${displayVehicleText(vehicle.name)}, ${displayVehicleText(vehicle.registrationNumber)}`"
                            title="Ustaw jako domyślny"
                            @click="$emit('setDefault', vehicle)"
                        >
                            <Star class="size-4" aria-hidden="true" />
                        </UiButton>
                        <UiButton
                            as-child
                            variant="outline"
                            size="sm"
                            class="rounded-full"
                        >
                            <NuxtLink
                                :to="`/vehicles/${vehicle.id}`"
                                :aria-label="`Szczegóły pojazdu ${displayVehicleText(vehicle.name)}, ${displayVehicleText(vehicle.registrationNumber)}`"
                            >
                                Szczegóły
                            </NuxtLink>
                        </UiButton>
                        <UiButton
                            as-child
                            variant="ghost"
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
                            variant="ghost"
                            size="icon"
                            class="text-destructive hover:bg-destructive/10 hover:text-destructive size-9 rounded-full"
                            :disabled="isDeleteLoading"
                            :aria-label="`Usuń pojazd ${displayVehicleText(vehicle.name)}, ${displayVehicleText(vehicle.registrationNumber)}`"
                            @click="$emit('requestDelete', vehicle)"
                        >
                            <Trash2 class="size-4" aria-hidden="true" />
                        </UiButton>
                    </ActionGroup>
                </td>
            </tr>
        </tbody>
    </table>
</template>
