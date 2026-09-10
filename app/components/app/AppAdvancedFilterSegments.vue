<script setup lang="ts">
import type {
    AdvancedFilterSegment,
    AdvancedFilterSegmentTone,
} from '~~/shared/utils/advancedFilters';

defineProps<{
    segments: readonly AdvancedFilterSegment[];
}>();

function getSegmentClass(tone: AdvancedFilterSegmentTone): string {
    if (tone === 'field') {
        return 'border-border bg-muted text-muted-foreground';
    }

    if (tone === 'operator') {
        return 'border-primary/20 bg-primary/10 text-primary';
    }

    return 'border-border bg-background text-foreground shadow-xs';
}
</script>

<template>
    <template
        v-for="segment in segments"
        :key="`${segment.tone}-${segment.label}`"
    >
        <span
            class="inline-flex max-w-36 shrink-0 items-center rounded-md border px-2 py-1 text-[11px] leading-4 font-semibold whitespace-nowrap"
            :class="getSegmentClass(segment.tone)"
        >
            {{ segment.label }}
        </span>
    </template>
</template>
