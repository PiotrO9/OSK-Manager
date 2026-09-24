<script setup lang="ts">
defineProps<{
    isLoading: boolean;
    baseHour: number;
    scheduleCountBadgeLabel: string;
    displayItemsCount: number;
    scheduleInstructorCount: number;
    earliestStartLabel: string;
    scopeBadgeLabel?: string;
    showInstructorCount?: boolean;
}>();
</script>

<template>
    <div class="space-y-4">
        <FilterBar
            title="Zakres harmonogramu"
            :result-label="isLoading ? 'Ładowanie...' : ''"
            :is-loading="isLoading"
            class="rounded-2xl"
        >
            <UiBadge
                variant="outline"
                class="border-primary-200 bg-primary-50 text-primary-700 rounded-full"
            >
                {{ scopeBadgeLabel ?? 'Wszyscy instruktorzy' }}
            </UiBadge>
            <UiBadge variant="secondary" class="rounded-full">
                {{ baseHour }}:00-19:00
            </UiBadge>
            <UiBadge variant="secondary" class="rounded-full">
                Sortuj: godzina
            </UiBadge>

            <template #actions>
                <UiBadge variant="outline" class="rounded-full">
                    {{ scheduleCountBadgeLabel }}: {{ displayItemsCount }}
                </UiBadge>
            </template>
        </FilterBar>

        <div class="flex flex-wrap items-center gap-2">
            <span class="text-muted-foreground text-sm font-semibold">
                Oś godzin: {{ baseHour }}:00-19:00
            </span>
            <UiBadge
                v-if="showInstructorCount ?? true"
                variant="outline"
                class="border-primary-200 bg-primary-50 text-primary-700 rounded-full"
            >
                Instruktorzy: {{ scheduleInstructorCount }}
            </UiBadge>
            <UiBadge variant="outline" class="rounded-full">
                Najwcześniej: {{ earliestStartLabel }}
            </UiBadge>
        </div>
    </div>
</template>
