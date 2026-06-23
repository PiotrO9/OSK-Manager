<script setup lang="ts">
import { ChevronLeft, ChevronRight } from 'lucide-vue-next';

defineProps<{
    label: string;
    disabled?: boolean;
}>();

const emit = defineEmits<{
    prev: [];
    next: [];
}>();
</script>

<template>
    <section
        class="border-border bg-background flex flex-col gap-3 rounded-2xl border p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between"
    >
        <div class="min-w-0">
            <h2 class="text-foreground text-sm font-extrabold">Termin</h2>
            <p class="text-muted-foreground text-sm">{{ label }}</p>
        </div>

        <div class="flex items-center gap-2">
            <UiButton
                type="button"
                variant="outline"
                size="icon"
                class="rounded-xl"
                :disabled="disabled"
                aria-label="Poprzedni tydzień"
                @click="emit('prev')"
            >
                <ChevronLeft class="size-4" aria-hidden="true" />
            </UiButton>
            <UiButton
                type="button"
                variant="outline"
                size="icon"
                class="rounded-xl"
                :disabled="disabled"
                aria-label="Następny tydzień"
                @click="emit('next')"
            >
                <ChevronRight class="size-4" aria-hidden="true" />
            </UiButton>
        </div>
    </section>
</template>
