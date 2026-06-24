<script setup lang="ts">
import type { DateValue } from '@internationalized/date';
import { ChevronLeft, ChevronRight } from 'lucide-vue-next';

defineProps<{
    isLoading: boolean;
    compactWeekRangeLabel: string;
    calendarSelectedModel: DateValue[];
    minValue: DateValue;
    maxValue: DateValue;
}>();

const emit = defineEmits<{
    previous: [event: MouseEvent];
    next: [event: MouseEvent];
    previousKeydown: [event: KeyboardEvent];
    nextKeydown: [event: KeyboardEvent];
    calendarUpdate: [value: DateValue[] | DateValue | undefined];
}>();

const calendarOpen = defineModel<boolean>('calendarOpen', { required: true });
</script>

<template>
    <div
        class="flex flex-wrap items-center justify-between gap-3"
        role="toolbar"
        aria-label="Nawigacja tygodnia harmonogramu lekcji"
    >
        <div class="flex flex-wrap items-center gap-2">
            <UiButton
                type="button"
                variant="outline"
                size="sm"
                class="h-10 rounded-xl px-4 font-semibold"
                aria-label="Poprzedni tydzień"
                :disabled="isLoading"
                @click="emit('previous', $event)"
                @keydown="emit('previousKeydown', $event)"
            >
                <ChevronLeft class="size-4" aria-hidden="true" />
                Poprzedni
            </UiButton>
            <UiButton
                type="button"
                variant="outline"
                size="sm"
                class="h-10 rounded-xl px-4 font-semibold"
                aria-label="Następny tydzień"
                :disabled="isLoading"
                @click="emit('next', $event)"
                @keydown="emit('nextKeydown', $event)"
            >
                Następny
                <ChevronRight class="size-4" aria-hidden="true" />
            </UiButton>
        </div>

        <p
            class="text-foreground min-w-0 flex-1 text-center text-sm font-medium"
            aria-live="polite"
        >
            {{ compactWeekRangeLabel }}
        </p>

        <UiPopover v-model:open="calendarOpen">
            <UiPopoverTrigger>
                <UiButton
                    type="button"
                    variant="outline"
                    size="sm"
                    :disabled="isLoading"
                    aria-label="Wybierz tydzień w kalendarzu (poniedziałek do niedzieli)"
                >
                    Wybierz tydzień
                </UiButton>
            </UiPopoverTrigger>
            <UiPopoverContent class="w-auto p-0" align="end">
                <UiCalendar
                    multiple
                    fixed-weeks
                    :week-starts-on="1"
                    :min-value="minValue"
                    :max-value="maxValue"
                    :disable-days-outside-current-view="false"
                    :model-value="calendarSelectedModel"
                    locale="pl-PL"
                    @update:model-value="emit('calendarUpdate', $event)"
                />
            </UiPopoverContent>
        </UiPopover>
    </div>
</template>
