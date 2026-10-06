<script setup lang="ts">
import { ChevronLeft, ChevronRight } from 'lucide-vue-next';

const props = withDefaults(
    defineProps<{
        isLoading: boolean;
        compactWeekRangeLabel: string;
        compact?: boolean;
        previousDisabled?: boolean;
        nextDisabled?: boolean;
    }>(),
    {
        compact: false,
        previousDisabled: false,
        nextDisabled: false,
    },
);

const emit = defineEmits<{
    previous: [event: MouseEvent];
    next: [event: MouseEvent];
    previousKeydown: [event: KeyboardEvent];
    nextKeydown: [event: KeyboardEvent];
}>();

const spacedWeekRangeLabel = computed(() =>
    props.compactWeekRangeLabel.replace(
        /(\d)\s*[-–]\s*(\d)/,
        '$1\u202f–\u202f$2',
    ),
);
</script>

<template>
    <div
        class="border-border bg-background inline-flex w-full items-center justify-self-center overflow-hidden rounded-lg border shadow-xs sm:col-start-2 sm:w-auto"
        :class="props.compact ? 'h-9' : 'h-10'"
        role="group"
        aria-label="Przejdź między tygodniami"
    >
        <UiButton
            type="button"
            variant="ghost"
            size="sm"
            class="border-border h-full shrink-0 rounded-none border-r px-2.5"
            aria-label="Poprzedni tydzień"
            :disabled="props.isLoading || props.previousDisabled"
            @click="emit('previous', $event)"
            @keydown="emit('previousKeydown', $event)"
        >
            <ChevronLeft class="size-4" aria-hidden="true" />
        </UiButton>
        <p
            class="text-foreground min-w-36 px-3 text-center text-sm font-semibold whitespace-nowrap"
            :class="props.compact ? 'sm:min-w-44' : 'sm:min-w-48'"
            aria-live="polite"
        >
            {{ spacedWeekRangeLabel }}
        </p>
        <UiButton
            type="button"
            variant="ghost"
            size="sm"
            class="border-border h-full shrink-0 rounded-none border-l px-2.5"
            aria-label="Następny tydzień"
            :disabled="props.isLoading || props.nextDisabled"
            @click="emit('next', $event)"
            @keydown="emit('nextKeydown', $event)"
        >
            <ChevronRight class="size-4" aria-hidden="true" />
        </UiButton>
    </div>
</template>
