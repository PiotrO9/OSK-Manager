<script setup lang="ts">
import { CarFront } from 'lucide-vue-next';
import type { VehicleDetailsStatusPresentation } from '~/composables/vehicles/useVehicleDetailsPresentation';

defineProps<{
    availability: VehicleDetailsStatusPresentation;
}>();
</script>

<template>
    <section
        class="border-border bg-card rounded-lg border shadow-xs"
        aria-labelledby="vehicle-overview-availability-heading"
    >
        <div class="border-border border-b px-5 py-4">
            <div class="flex items-start gap-3">
                <CarFront
                    class="text-info-700 dark:text-info-300 mt-0.5 size-4 shrink-0"
                    aria-hidden="true"
                />
                <div class="min-w-0 space-y-1">
                    <h2
                        id="vehicle-overview-availability-heading"
                        class="text-foreground text-base font-semibold"
                    >
                        Dostępność pojazdu
                    </h2>
                    <p class="text-muted-foreground text-sm">
                        Status używany podczas planowania jazd.
                    </p>
                </div>
            </div>
        </div>
        <div class="flex items-start justify-between gap-4 p-5">
            <div class="min-w-0">
                <p class="text-foreground text-lg font-semibold">
                    {{ availability.label }}
                </p>
                <p class="text-muted-foreground mt-1 text-sm">
                    {{ availability.description }}
                </p>
            </div>
            <StatusBadge
                :label="availability.label"
                :tone="availability.tone"
            />
        </div>
    </section>
</template>
