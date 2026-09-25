<script setup lang="ts">
const props = withDefaults(
    defineProps<{
        label: string;
        isToday: boolean;
        compact?: boolean;
    }>(),
    {
        compact: false,
    },
);
</script>

<template>
    <div
        class="border-border flex shrink-0 flex-col items-center justify-center border-b px-1 text-center"
        :class="[
            props.compact ? 'h-10' : 'h-12',
            props.isToday ? 'bg-primary/10' : 'bg-background',
        ]"
    >
        <span class="text-foreground text-xs font-medium capitalize">
            {{ props.label }}
        </span>
        <span
            v-if="props.isToday && props.compact"
            class="text-primary text-[11px] font-bold"
        >
            dziś
        </span>
    </div>
</template>
