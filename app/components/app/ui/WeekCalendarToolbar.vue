<script setup lang="ts">
import type { DateValue } from '@internationalized/date';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-vue-next';

const props = withDefaults(
    defineProps<{
        isLoading: boolean;
        compactWeekRangeLabel: string;
        calendarSelectedModel: DateValue[];
        minValue: DateValue;
        maxValue: DateValue;
        compact?: boolean;
        ariaLabel?: string;
        previousDisabled?: boolean;
        nextDisabled?: boolean;
    }>(),
    {
        compact: false,
        ariaLabel: 'Nawigacja tygodnia kalendarza',
        previousDisabled: false,
        nextDisabled: false,
    },
);

const emit = defineEmits<{
    previous: [event: MouseEvent];
    next: [event: MouseEvent];
    previousKeydown: [event: KeyboardEvent];
    nextKeydown: [event: KeyboardEvent];
    calendarUpdate: [value: DateValue[] | DateValue | undefined];
}>();

const calendarOpen = defineModel<boolean>('calendarOpen', { required: true });

const spacedWeekRangeLabel = computed(() =>
    props.compactWeekRangeLabel.replace(
        /(\d)\s*[-–]\s*(\d)/,
        '$1\u202f–\u202f$2',
    ),
);
</script>

<template>
    <div
        class="grid items-center sm:grid-cols-[1fr_auto_1fr]"
        :class="props.compact ? 'gap-2' : 'gap-3'"
        role="toolbar"
        :aria-label="props.ariaLabel"
    >
        <div
            class="border-border bg-background inline-flex w-full items-center justify-self-center overflow-hidden rounded-lg border shadow-xs sm:col-start-2 sm:w-auto"
            :class="props.compact ? 'h-9' : 'h-10'"
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

        <div class="w-full justify-self-end sm:col-start-3 sm:w-auto">
            <UiPopover v-model:open="calendarOpen">
                <UiPopoverTrigger as-child>
                    <UiButton
                        type="button"
                        variant="outline"
                        size="sm"
                        class="w-full justify-center sm:w-auto"
                        :disabled="props.isLoading"
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
                        :min-value="props.minValue"
                        :max-value="props.maxValue"
                        :disable-days-outside-current-view="false"
                        :model-value="props.calendarSelectedModel"
                        locale="pl-PL"
                        @update:model-value="emit('calendarUpdate', $event)"
                    />
                </UiPopoverContent>
            </UiPopover>
        </div>
    </div>
</template>
