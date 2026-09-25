<script setup lang="ts">
const props = withDefaults(
    defineProps<{
        hourLabels: number[];
        gridHeightPx: number;
        compact?: boolean;
    }>(),
    {
        compact: false,
    },
);
</script>

<template>
    <div
        class="border-border flex w-12 shrink-0 flex-col border-r"
        aria-hidden="true"
    >
        <div
            class="border-border flex shrink-0 items-end border-b pr-2"
            :class="props.compact ? 'h-10' : 'h-12'"
        />
        <div
            class="flex flex-col"
            :style="{ height: `${props.gridHeightPx}px` }"
        >
            <div
                v-for="hour in props.hourLabels"
                :key="hour"
                class="text-muted-foreground flex h-[60px] items-start justify-end pr-2 text-xs tabular-nums"
            >
                {{ String(hour).padStart(2, '0') }}:00
            </div>
        </div>
    </div>
</template>
