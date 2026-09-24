<script setup lang="ts">
import type { DateValue } from '@internationalized/date';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-vue-next';

defineProps<{
    isLoading: boolean;
    compactWeekRangeLabel: string;
    calendarSelectedModel: DateValue[];
    minValue: DateValue;
    maxValue: DateValue;
    compact?: boolean;
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
        :class="
            compact
                ? 'grid items-center gap-2 sm:grid-cols-[1fr_auto_1fr]'
                : 'grid items-center gap-3 sm:grid-cols-[1fr_auto_1fr]'
        "
        role="toolbar"
        aria-label="Nawigacja tygodnia harmonogramu lekcji"
    >
        <div
            :class="
                compact
                    ? 'border-border bg-background inline-flex h-9 w-full items-center justify-self-center overflow-hidden rounded-lg border shadow-xs sm:col-start-2 sm:w-auto'
                    : 'border-border bg-background inline-flex h-10 w-full items-center justify-self-center overflow-hidden rounded-lg border shadow-xs sm:col-start-2 sm:w-auto'
            "
        >
            <UiButton
                type="button"
                variant="ghost"
                size="sm"
                class="border-border h-full shrink-0 rounded-none border-r px-2.5"
                aria-label="Poprzedni tydzień"
                :disabled="isLoading"
                @click="emit('previous', $event)"
                @keydown="emit('previousKeydown', $event)"
            >
                <ChevronLeft class="size-4" aria-hidden="true" />
            </UiButton>
            <p
                class="text-foreground min-w-36 px-3 text-center text-sm font-semibold whitespace-nowrap"
                :class="compact ? 'sm:min-w-44' : 'sm:min-w-48'"
                aria-live="polite"
            >
                {{ compactWeekRangeLabel }}
            </p>
            <UiButton
                type="button"
                variant="ghost"
                size="sm"
                class="border-border h-full shrink-0 rounded-none border-l px-2.5"
                aria-label="Następny tydzień"
                :disabled="isLoading"
                @click="emit('next', $event)"
                @keydown="emit('nextKeydown', $event)"
            >
                <ChevronRight class="size-4" aria-hidden="true" />
            </UiButton>
        </div>

        <div class="w-full justify-self-end sm:col-start-3 sm:w-auto">
            <UiPopover v-model:open="calendarOpen">
                <UiPopoverTrigger as-child>
                    <UiButton
                        type="button"
                        variant="outline"
                        size="sm"
                        class="w-full justify-center sm:w-auto"
                        :disabled="isLoading"
                        aria-label="Wybierz tydzień w kalendarzu (poniedziałek do niedzieli)"
                    >
                        <CalendarDays class="size-4" aria-hidden="true" />
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
    </div>
</template>
