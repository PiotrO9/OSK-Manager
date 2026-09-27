<script setup lang="ts">
import { Pencil, ShieldCheck } from 'lucide-vue-next';
import type { RouteLocationRaw } from 'vue-router';
import type { VehicleDetailsDeadlineItem } from '~/composables/vehicles/useVehicleDetailsPresentation';

defineProps<{
    deadlineItems: VehicleDetailsDeadlineItem[];
    editHref: RouteLocationRaw;
}>();

function deadlineStateLabel(
    state: VehicleDetailsDeadlineItem['state'],
): string {
    if (state === 'expired') return 'Po terminie';

    if (state === 'soon') return 'Wkrótce';

    if (state === 'missing') return 'Brak terminu';

    return 'Aktualne';
}
</script>

<template>
    <section
        class="border-border bg-card rounded-lg border shadow-xs"
        aria-labelledby="vehicle-documents-heading"
    >
        <div
            class="border-border flex flex-col gap-3 border-b px-5 py-4 sm:flex-row sm:items-start sm:justify-between"
        >
            <div class="flex min-w-0 items-start gap-3">
                <ShieldCheck
                    class="text-info-700 dark:text-info-300 mt-0.5 size-4 shrink-0"
                    aria-hidden="true"
                />
                <div class="min-w-0 space-y-1">
                    <h2
                        id="vehicle-documents-heading"
                        class="text-foreground text-base font-semibold"
                    >
                        Terminy dokumentów
                    </h2>
                    <p class="text-muted-foreground text-sm">
                        Przegląd techniczny i ubezpieczenie OC.
                    </p>
                </div>
            </div>
            <UiButton
                as-child
                variant="outline"
                size="sm"
                class="w-fit rounded-lg"
            >
                <NuxtLink :to="editHref">
                    <Pencil class="mr-2 size-4" aria-hidden="true" />
                    Edytuj
                </NuxtLink>
            </UiButton>
        </div>

        <dl class="divide-border divide-y px-5">
            <div
                v-for="item in deadlineItems"
                :key="item.label"
                class="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
                <div class="min-w-0">
                    <dt class="text-foreground text-sm font-semibold">
                        {{ item.label }}
                    </dt>
                    <dd class="text-muted-foreground mt-1 text-sm">
                        {{ item.value }}
                    </dd>
                </div>
                <StatusBadge
                    :label="deadlineStateLabel(item.state)"
                    :tone="item.tone"
                    subtle
                />
            </div>
        </dl>
    </section>
</template>
