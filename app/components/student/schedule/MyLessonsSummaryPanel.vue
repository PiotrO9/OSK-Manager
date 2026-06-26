<script setup lang="ts">
import type { SummaryStripItem } from '~/components/app/ui/types';

defineProps<{
    summaryItems: SummaryStripItem[];
}>();
</script>

<template>
    <section
        class="border-border bg-background overflow-hidden rounded-xl border shadow-xs"
        aria-labelledby="my-lessons-summary-title"
    >
        <div class="border-border border-b p-4">
            <h2
                id="my-lessons-summary-title"
                class="text-foreground text-lg font-bold"
            >
                Podsumowanie dnia
            </h2>
            <p class="text-muted-foreground mt-1 text-sm">
                Najważniejsze informacje z aktualnego zakresu.
            </p>
        </div>
        <div class="p-4">
            <SummaryStrip :items="summaryItems" />
        </div>
    </section>
</template>
