<script setup lang="ts">
import type { StatusTone } from './types';

const props = withDefaults(
    defineProps<{
        label: string;
        tone?: StatusTone;
        subtle?: boolean;
    }>(),
    {
        tone: 'neutral',
        subtle: false,
    },
);

const toneClasses: Record<StatusTone, { solid: string; subtle: string }> = {
    neutral: {
        solid: 'border-secondary-200 bg-secondary-100 text-secondary-800',
        subtle: 'border-border bg-background text-muted-foreground',
    },
    info: {
        solid: 'border-info-200 bg-info-50 text-info-700',
        subtle: 'border-info-200 bg-info-50/50 text-info-700',
    },
    success: {
        solid: 'border-success-200 bg-success-50 text-success-700',
        subtle: 'border-success-200 bg-success-50/50 text-success-700',
    },
    warning: {
        solid: 'border-warning-200 bg-warning-50 text-warning-800',
        subtle: 'border-warning-200 bg-warning-50/60 text-warning-800',
    },
    danger: {
        solid: 'border-danger-200 bg-danger-50 text-danger-700',
        subtle: 'border-danger-200 bg-danger-50/60 text-danger-700',
    },
};
</script>

<template>
    <span
        class="inline-flex w-fit shrink-0 items-center rounded-full border px-2.5 py-1 text-xs leading-none font-semibold whitespace-nowrap"
        :class="toneClasses[props.tone][props.subtle ? 'subtle' : 'solid']"
    >
        {{ props.label }}
    </span>
</template>
