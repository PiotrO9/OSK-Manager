<script setup lang="ts">
import type { DateValue } from '@internationalized/date';
import { CalendarDays } from 'lucide-vue-next';

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
</script>

<template>
    <div
        class="grid items-center sm:grid-cols-[1fr_auto_1fr]"
        :class="props.compact ? 'gap-2' : 'gap-3'"
        role="toolbar"
        :aria-label="props.ariaLabel"
    >
        <WeekCalendarRangeNavigation
            :is-loading="props.isLoading"
            :compact-week-range-label="props.compactWeekRangeLabel"
            :compact="props.compact"
            :previous-disabled="props.previousDisabled"
            :next-disabled="props.nextDisabled"
            @previous="emit('previous', $event)"
            @next="emit('next', $event)"
            @previous-keydown="emit('previousKeydown', $event)"
            @next-keydown="emit('nextKeydown', $event)"
        />

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
