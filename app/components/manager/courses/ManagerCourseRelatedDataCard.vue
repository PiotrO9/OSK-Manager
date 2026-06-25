<script setup lang="ts">
import { ListChecks } from 'lucide-vue-next';
import type { ManagerCourseInfoItem } from '~/composables/useManagerCourseDetailPage';

defineProps<{
    items: ManagerCourseInfoItem[];
}>();
</script>

<template>
    <UiCard class="overflow-hidden rounded-2xl shadow-sm">
        <UiCardHeader class="border-border border-b p-5">
            <div class="flex items-start justify-between gap-3">
                <div class="space-y-1">
                    <UiCardTitle class="text-xl font-extrabold">
                        Powiazane dane
                    </UiCardTitle>
                    <UiCardDescription>
                        Elementy, ktorych nie można zgubic po redesignie.
                    </UiCardDescription>
                </div>
                <ListChecks
                    class="text-muted-foreground size-5 shrink-0"
                    aria-hidden="true"
                />
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
                <StatusBadge :label="item.badge" subtle />
            </div>
        </UiCardContent>
    </UiCard>
</template>
