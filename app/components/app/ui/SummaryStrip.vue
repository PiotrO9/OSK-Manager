<script setup lang="ts">
import type { StatusTone, SummaryStripItem } from './types';

const props = defineProps<{
    items: SummaryStripItem[];
}>();

const toneClasses: Record<StatusTone, string> = {
    neutral: 'bg-card',
    info: 'bg-info-50/50',
    success: 'bg-success-50/50',
    warning: 'bg-warning-50/50',
    danger: 'bg-danger-50/50',
};
</script>

<template>
    <section
        class="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4"
        aria-label="Podsumowanie"
    >
        <article
            v-for="item in props.items"
            :key="item.label"
            class="border-border min-w-0 rounded-xl border p-4 shadow-xs"
            :class="toneClasses[item.tone ?? 'neutral']"
        >
            <p class="text-muted-foreground truncate text-xs">
                {{ item.label }}
            </p>
            <p
                class="text-foreground mt-2 text-2xl leading-none font-bold tabular-nums"
            >
                {{ item.value }}
            </p>
            <p
                v-if="item.description"
                class="text-muted-foreground mt-2 truncate text-xs"
            >
                {{ item.description }}
            </p>
        </article>
    </section>
</template>
