<script setup lang="ts">
import type { ManagerCourseInfoItem } from '~/composables/courses/useManagerCourseDetailPage';

defineProps<{
    items: ManagerCourseInfoItem[];
}>();
</script>

<template>
    <UiCard class="h-fit gap-0 overflow-hidden rounded-lg py-0 shadow-xs">
        <UiCardHeader class="border-border border-b px-5 py-4">
            <div class="space-y-1">
                <UiCardTitle class="text-lg font-bold">
                    Parametry kursu
                </UiCardTitle>
                <UiCardDescription>
                    Godziny, typ i limit zapisane w konfiguracji.
                </UiCardDescription>
            </div>
        </UiCardHeader>
        <UiCardContent class="grid gap-3 p-4">
            <div
                v-for="item in items"
                :key="item.label"
                class="border-border flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-start sm:justify-between"
            >
                <div class="min-w-0">
                    <p class="font-semibold">{{ item.label }}</p>
                    <p class="text-muted-foreground mt-1 text-sm">
                        {{ item.description }}
                    </p>
                </div>
                <StatusBadge :label="item.badge" :tone="item.tone" subtle />
            </div>
        </UiCardContent>
    </UiCard>
</template>
