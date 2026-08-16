<script setup lang="ts">
import type { Vehicle } from '~/types/vehicles/vehicle';

defineProps<{
    vehicles: readonly Vehicle[];
    disabled: boolean;
}>();

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
                    >
                        {{ vehicle.name }} ({{ vehicle.registrationNumber }})
                    </UiSelectItem>
                </UiSelectGroup>
            </UiSelectContent>
        </UiSelect>
        <p
            v-if="vehicles.length === 0"
            class="text-muted-foreground text-xs"
            role="status"
        >
            Brak wolnych pojazdów w tym oknie — wybierz inny slot lub sprawdź
            flotę OSK.
        </p>
    </div>
</template>
