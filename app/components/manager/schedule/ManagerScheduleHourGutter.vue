<script setup lang="ts">
defineProps<{
    hourLabels: number[];
    gridHeightPx: number;
}>();
</script>

<template>
    <div
        class="border-border flex w-12 shrink-0 flex-col border-r"
        aria-hidden="true"
    >
        <div class="border-border flex h-12 shrink-0 items-end border-b pr-2" />
        <div class="flex flex-col" :style="{ height: `${gridHeightPx}px` }">
            <div
                v-for="h in hourLabels"
                :key="h"
                class="text-muted-foreground flex h-[60px] items-start justify-end pr-2 text-xs"
            >
                {{ String(h).padStart(2, '0') }}:00
            </div>
        </div>
    </div>
</template>
