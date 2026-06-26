<script setup lang="ts">
import type { ManagerCourseInfoItem } from '~/composables/courses/useManagerCourseDetailPage';

defineProps<{
    items: ManagerCourseInfoItem[];
}>();
</script>

<template>
    <UiCard class="overflow-hidden rounded-2xl shadow-sm">
        <UiCardHeader class="border-border border-b p-5">
            <div
                class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"
            >
                <div class="space-y-1">
                    <UiCardTitle class="text-xl font-extrabold">
                        Przeglad
                    </UiCardTitle>
                    <UiCardDescription>
                        Najwa¿niejsze dane i akcje dla tego widoku.
                    </UiCardDescription>
                </div>
                <StatusBadge label="Aktualne" tone="info" subtle />
            </div>
        </UiCardHeader>
        <UiCardContent class="grid gap-3 p-4">
            <div
                v-for="item in items"
                :key="item.label"
                class="border-border flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-start sm:justify-between"
            >
                <div class="min-w-0">
                    <p class="font-extrabold">{{ item.label }}</p>
                    <p class="text-muted-foreground mt-1 text-sm">
                        {{ item.description }}
                    </p>
                </div>
                <StatusBadge :label="item.badge" :tone="item.tone" subtle />
            </div>
        </UiCardContent>
    </UiCard>
</template>
