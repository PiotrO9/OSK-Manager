<script setup lang="ts">
defineProps<{
    scheduleCountBadgeLabel: string;
    displayItemsCount: number;
}>();
</script>

<template>
    <div class="flex justify-end">
        <UiBadge variant="outline" class="rounded-full">
            {{ scheduleCountBadgeLabel }}: {{ displayItemsCount }}
        </UiBadge>
    </div>
</template>
