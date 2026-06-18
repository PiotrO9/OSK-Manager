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
        class="border-border flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between md:p-5"
    >
        <div class="min-w-0">
            <h2 class="text-foreground text-sm font-medium">Termin</h2>
            <p class="text-muted-foreground text-sm">{{ label }}</p>
        </div>

        <div class="flex items-center gap-2">
            <UiButton
                type="button"
                variant="outline"
                size="icon"
                :disabled="disabled"
                aria-label="Poprzedni tydzien"
                @click="emit('prev')"
            >
                <ChevronLeft class="size-4" aria-hidden="true" />
            </UiButton>
            <UiButton
                type="button"
                variant="outline"
                size="icon"
                :disabled="disabled"
                aria-label="Nastepny tydzien"
                @click="emit('next')"
            >
                <ChevronRight class="size-4" aria-hidden="true" />
            </UiButton>
        </div>
    </section>
</template>
