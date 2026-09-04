<script setup lang="ts">
import { SlidersHorizontal } from 'lucide-vue-next';

defineProps<{
    baseHour: number;
    endHour: number;
    totalSlots: number;
    earliestSlotLabel: string;
}>();
</script>

<template>
    <div class="border-border border-b p-4 md:p-5">
        <div class="grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
            <div
                class="border-border bg-background flex min-w-0 flex-wrap items-center gap-2 rounded-xl border px-3 py-2"
                role="status"
                aria-live="polite"
            >
                <span
                    class="text-foreground flex items-center gap-2 text-sm font-semibold"
                >
                    <SlidersHorizontal
                        class="size-4 text-sky-700"
                        aria-hidden="true"
                    />
                    Filtry zapytania API
                </span>
                <StatusBadge label="Ten instruktor" tone="info" subtle />
                <StatusBadge
                    :label="`${baseHour}:00-${endHour}:00`"
                    tone="neutral"
                    subtle
                />
                <StatusBadge label="Sortuj: godzina" tone="neutral" subtle />
            </div>

            <div
                class="border-border bg-background grid grid-cols-3 overflow-hidden rounded-xl border"
            >
                <div class="border-border border-r px-3 py-2">
                    <p class="text-muted-foreground text-xs">Okna w tygodniu</p>
                    <p class="text-foreground text-lg font-extrabold">
                        {{ totalSlots }}
                    </p>
                </div>
                <div class="border-border border-r px-3 py-2">
                    <p class="text-muted-foreground text-xs">Najblizszy slot</p>
                    <p class="text-foreground text-lg font-extrabold">
                        {{ earliestSlotLabel }}
                    </p>
                </div>
                <div class="px-3 py-2">
                    <p class="text-muted-foreground text-xs">Zakres</p>
                    <p class="text-foreground text-lg font-extrabold">60 min</p>
                </div>
            </div>
        </div>
    </div>
</template>
