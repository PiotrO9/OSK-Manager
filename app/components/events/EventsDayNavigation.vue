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
        class="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 sm:grid-cols-[1fr_auto_1fr]"
        role="toolbar"
        aria-label="Nawigacja dnia wydarzeń"
    >
        <div
            class="border-border bg-background inline-flex h-10 min-w-0 items-center overflow-hidden rounded-lg border shadow-xs sm:col-start-2"
        >
            <UiButton
                type="button"
                variant="ghost"
                size="sm"
                class="border-border h-full shrink-0 rounded-none border-r px-2.5"
                aria-label="Poprzedni dzień"
                :disabled="isLoading"
                @click="$emit('previous')"
            >
                <ChevronLeft class="size-4" aria-hidden="true" />
            </UiButton>

            <p
                class="text-foreground min-w-0 flex-1 truncate px-3 text-center text-sm font-semibold capitalize sm:min-w-56 sm:flex-none"
                :title="selectedDateLabel"
                aria-live="polite"
            >
                {{ selectedDateLabel }}
            </p>

            <UiButton
                type="button"
                variant="ghost"
                size="sm"
                class="border-border h-full shrink-0 rounded-none border-l px-2.5"
                aria-label="Następny dzień"
                :disabled="isLoading"
                @click="$emit('next')"
            >
                <ChevronRight class="size-4" aria-hidden="true" />
            </UiButton>
        </div>

        <UiButton
            type="button"
            variant="secondary"
            size="sm"
            class="justify-self-end rounded-xl bg-sky-50 text-sky-700 hover:bg-sky-100 sm:col-start-3"
            aria-label="Dzisiaj"
            :disabled="isLoading"
            @click="$emit('today')"
        >
            Dziś
        </UiButton>
    </div>
</template>
