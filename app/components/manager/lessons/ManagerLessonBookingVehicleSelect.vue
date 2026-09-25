<script setup lang="ts">
import type { Vehicle } from '~/types/vehicles/vehicle';

const props = defineProps<{
    vehicles: readonly Vehicle[];
    availableVehicleIds?: readonly string[];
    disabled: boolean;
}>();

function isVehicleDisabled(vehicle: Vehicle): boolean {
    return (
        vehicle.status === 'UNAVAILABLE' ||
        (props.availableVehicleIds !== undefined &&
            !props.availableVehicleIds.includes(vehicle.id))
    );
}

function formatVehicleLabel(vehicle: Vehicle): string {
    const model = vehicle.name
        .trim()
        .replace(/^pojazd\s+\d+\s*-\s*/i, '')
        .trim();
    const label = `${model || '-'} (${vehicle.registrationNumber.trim()})`;

    return isVehicleDisabled(vehicle)
        ? `${label} - niedostępny w tym terminie`
        : label;
}

const selectedVehicleId = defineModel<string>('selectedVehicleId', {
    required: true,
});
</script>

<template>
    <div class="space-y-2">
        <label
            class="text-sm leading-none font-medium"
            for="lesson-booking-vehicle"
        >
            Pojazd (wolny w tym terminie)
        </label>
        <UiSelect
            v-model="selectedVehicleId"
            :disabled="disabled || vehicles.length === 0"
        >
            <UiSelectTrigger
                id="lesson-booking-vehicle"
                class="w-full"
                aria-required="true"
            >
                <UiSelectValue placeholder="— Wybierz pojazd —" />
            </UiSelectTrigger>
            <UiSelectContent>
                <UiSelectGroup>
                    <UiSelectItem
                        v-for="vehicle in vehicles"
                        :key="vehicle.id"
                        :value="vehicle.id"
                        :disabled="isVehicleDisabled(vehicle)"
                    >
                        {{ formatVehicleLabel(vehicle) }}
                    </UiSelectItem>
                </UiSelectGroup>
            </UiSelectContent>
        </UiSelect>
        <p
            v-if="availableVehicleIds?.length === 0"
            class="text-muted-foreground text-xs"
            role="status"
        >
            Brak wolnych pojazdów w tym oknie — wybierz inny slot lub sprawdź
            flotę OSK.
        </p>
    </div>
</template>
