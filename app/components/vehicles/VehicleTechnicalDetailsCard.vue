<script setup lang="ts">
import { Pencil } from 'lucide-vue-next';
import type { RouteLocationRaw } from 'vue-router';
import type { VehicleDetailsRow } from '~/composables/vehicles/useVehicleDetailsPresentation';

defineProps<{
    rows: VehicleDetailsRow[];
    editHref: RouteLocationRaw;
}>();
</script>

<template>
    <UiCard class="gap-0 overflow-hidden rounded-lg py-0 shadow-xs">
        <UiCardHeader
            class="border-border flex flex-col gap-3 border-b px-5 pt-4 pb-4! sm:flex-row sm:items-start sm:justify-between"
        >
            <div>
                <UiCardTitle class="text-lg font-bold"
                    >Dane pojazdu</UiCardTitle
                >
                <UiCardDescription class="mt-1">
                    Informacje identyfikacyjne i eksploatacyjne.
                </UiCardDescription>
            </div>
            <UiButton
                as-child
                variant="outline"
                class="h-10 rounded-lg px-4 font-semibold"
            >
                <NuxtLink :to="editHref">
                    <Pencil class="mr-2 size-4" aria-hidden="true" />
                    Edytuj pojazd
                </NuxtLink>
            </UiButton>
        </UiCardHeader>

        <UiCardContent class="p-5">
            <dl class="divide-border divide-y">
                <div
                    v-for="row in rows"
                    :key="row.label"
                    class="grid gap-1 py-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] sm:gap-4"
                >
                    <dt class="text-muted-foreground text-sm">
                        {{ row.label }}
                    </dt>
                    <dd
                        class="text-foreground min-w-0 text-sm font-semibold wrap-break-word sm:text-right"
                    >
                        <AppCopyableValue
                            v-if="row.copyable"
                            :value="row.value"
                            copy-label="numer rejestracyjny"
                            success-title="Skopiowano numer rejestracyjny"
                            error-title="Nie udało się skopiować numeru rejestracyjnego"
                        />
                        <template v-else>
                            <span>{{ row.value }}</span>
                            <VehicleUpdatedAtInfo
                                v-if="row.updatedAt !== undefined"
                                :updated-at="row.updatedAt"
                            />
                        </template>
                    </dd>
                </div>
            </dl>
        </UiCardContent>
    </UiCard>
</template>
