<script setup lang="ts">
import { CarFront } from 'lucide-vue-next';
import type { VehicleDetailsRow } from '~/composables/vehicles/useVehicleDetailsPresentation';
import type { StatusTone } from '~/types/ui';

defineProps<{
    photoUrl: string | null;
    initials: string;
    name: string;
    registrationNumber: string;
    availabilityLabel: string;
    availabilityTone: StatusTone;
    isDefault: boolean;
    profileRows: VehicleDetailsRow[];
}>();
</script>

<template>
    <UiCard class="overflow-hidden rounded-lg shadow-xs">
        <UiCardContent class="space-y-4 p-4">
            <div class="flex items-center gap-3">
                <div
                    class="border-border bg-muted/40 text-muted-foreground flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border font-semibold"
                >
                    <img
                        v-if="photoUrl"
                        :src="photoUrl"
                        :alt="`Zdjęcie pojazdu ${name}`"
                        class="size-full object-cover"
                    />
                    <span v-else aria-hidden="true">{{ initials }}</span>
                </div>

                <div class="min-w-0">
                    <p class="text-foreground text-sm font-semibold">
                        Dane pojazdu
                    </p>
                    <p
                        class="text-muted-foreground truncate text-sm"
                        :title="name"
                    >
                        {{ name }}
                    </p>
                </div>
            </div>

            <div class="grid gap-3">
                <div
                    class="border-border bg-background rounded-lg border px-3 py-3"
                >
                    <div class="flex min-w-0 items-start justify-between gap-3">
                        <div class="min-w-0">
                            <p
                                class="text-muted-foreground text-sm font-medium"
                            >
                                Status
                            </p>
                            <p
                                class="text-foreground mt-0.5 text-base font-semibold wrap-break-word"
                            >
                                {{ availabilityLabel }}
                            </p>
                            <p class="text-muted-foreground mt-0.5 text-xs">
                                Dostępność w harmonogramie
                            </p>
                        </div>
                        <StatusBadge
                            :label="availabilityLabel"
                            :tone="availabilityTone"
                        />
                    </div>
                </div>

                <div
                    class="border-border bg-background rounded-lg border px-3 py-3"
                >
                    <div class="flex min-w-0 items-start justify-between gap-3">
                        <div class="min-w-0">
                            <p
                                class="text-muted-foreground text-sm font-medium"
                            >
                                Rejestracja
                            </p>
                            <p
                                class="text-foreground mt-0.5 text-base font-semibold tracking-wide wrap-break-word"
                            >
                                <AppCopyableValue
                                    :value="registrationNumber"
                                    copy-label="numer rejestracyjny"
                                    success-title="Skopiowano numer rejestracyjny"
                                    error-title="Nie udało się skopiować numeru rejestracyjnego"
                                />
                            </p>
                            <p class="text-muted-foreground mt-0.5 text-xs">
                                Numer identyfikacyjny pojazdu
                            </p>
                        </div>
                        <CarFront
                            class="text-muted-foreground mt-0.5 size-4 shrink-0"
                            aria-hidden="true"
                        />
                    </div>
                </div>
            </div>

            <div class="flex min-h-5 flex-wrap gap-2">
                <StatusBadge
                    v-if="isDefault"
                    label="Domyślny pojazd"
                    tone="info"
                    subtle
                />
            </div>

            <dl class="divide-border divide-y">
                <div
                    v-for="row in profileRows"
                    :key="row.label"
                    class="flex items-center justify-between gap-4 py-3"
                >
                    <dt class="text-muted-foreground text-sm">
                        {{ row.label }}
                    </dt>
                    <dd
                        class="text-foreground flex min-w-0 items-center justify-end gap-1 text-right text-sm font-bold"
                    >
                        <span class="truncate" :title="row.value">{{
                            row.value
                        }}</span>
                        <VehicleUpdatedAtInfo
                            v-if="row.updatedAt !== undefined"
                            :updated-at="row.updatedAt"
                        />
                    </dd>
                </div>
            </dl>
        </UiCardContent>
    </UiCard>
</template>
