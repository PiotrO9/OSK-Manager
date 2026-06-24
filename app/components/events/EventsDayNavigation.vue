<script setup lang="ts">
import { ChevronLeft, ChevronRight } from 'lucide-vue-next';

defineProps<{
    selectedDateLabel: string;
    isLoading: boolean;
}>();

defineEmits<{
    previous: [];
    today: [];
    next: [];
}>();
</script>

<template>
    <div
        class="border-border bg-background flex flex-col gap-3 rounded-2xl border p-3 shadow-sm md:flex-row md:items-center md:justify-between"
    >
        <div class="flex flex-wrap items-center gap-2">
            <UiButton
                type="button"
                variant="ghost"
                size="sm"
                class="rounded-xl"
                aria-label="Poprzedni dzień"
                :disabled="isLoading"
                @click="$emit('previous')"
            >
                <ChevronLeft class="mr-1 size-4" aria-hidden="true" />
                Poprzedni
            </UiButton>

            <UiButton
                type="button"
                variant="secondary"
                size="sm"
                class="rounded-xl bg-sky-50 text-sky-700 hover:bg-sky-100"
                aria-label="Dzisiaj"
                :disabled="isLoading"
                @click="$emit('today')"
            >
                Dziś
            </UiButton>

            <UiButton
                type="button"
                variant="ghost"
                size="sm"
                class="rounded-xl"
                aria-label="Następny dzień"
                :disabled="isLoading"
                @click="$emit('next')"
            >
                Następny
                <ChevronRight class="ml-1 size-4" aria-hidden="true" />
            </UiButton>
        </div>

        <p
            class="text-foreground min-w-0 text-sm font-semibold capitalize"
            aria-live="polite"
        >
            {{ selectedDateLabel }}
        </p>
    </div>
</template>
