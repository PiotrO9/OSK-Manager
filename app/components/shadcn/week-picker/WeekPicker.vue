<script setup lang="ts">
import type { DateValue } from '@internationalized/date';
import { getLocalTimeZone, today } from '@internationalized/date';
import { CalendarDays, ChevronDown, RotateCcw } from 'lucide-vue-next';
import { cn } from '@/lib/utils';

defineOptions({
    name: 'UiWeekPicker',
});

withDefaults(
    defineProps<{
        modelValue: DateValue[];
        weekRangeLabel: string;
        minValue: DateValue;
        maxValue: DateValue;
        disabled?: boolean;
        triggerClass?: string;
    }>(),
    {
        disabled: false,
        triggerClass: undefined,
    },
);

const emit = defineEmits<{
    calendarUpdate: [value: DateValue | DateValue[] | undefined];
}>();

const open = defineModel<boolean>('open', { required: true });

function selectCurrentWeek(): void {
    emit('calendarUpdate', today(getLocalTimeZone()));
}
</script>

<template>
    <UiPopover v-model:open="open">
        <UiPopoverTrigger as-child>
            <UiButton
                type="button"
                variant="outline"
                class="h-10 rounded-lg px-3 font-semibold shadow-xs"
                :class="cn('min-w-[9.5rem] justify-between', triggerClass)"
                :disabled="disabled"
                aria-label="Wybierz tydzień w kalendarzu"
            >
                <span class="flex min-w-0 items-center gap-2">
                    <CalendarDays
                        class="text-muted-foreground size-4 shrink-0"
                        aria-hidden="true"
                    />
                    <span class="min-w-0 truncate tabular-nums">
                        {{ weekRangeLabel }}
                    </span>
                </span>
                <ChevronDown
                    class="text-muted-foreground size-4 shrink-0"
                    aria-hidden="true"
                />
            </UiButton>
        </UiPopoverTrigger>

        <UiPopoverContent
            align="center"
            class="week-picker-panel max-h-[min(29rem,var(--reka-popover-content-available-height))] w-[22rem] overflow-y-auto rounded-lg p-0 shadow-lg"
            :collision-padding="12"
            side="left"
            :side-offset="8"
            sticky="always"
        >
            <div
                class="border-border bg-muted/25 flex items-start gap-3 border-b px-4 py-3"
            >
                <div
                    class="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-lg"
                    aria-hidden="true"
                >
                    <CalendarDays class="size-4" />
                </div>
                <div class="min-w-0">
                    <p class="text-foreground text-sm font-bold">
                        Wybierz tydzień
                    </p>
                    <p class="text-muted-foreground mt-0.5 text-xs">
                        {{ weekRangeLabel }}
                    </p>
                </div>
            </div>

            <div class="p-3">
                <UiCalendar
                    multiple
                    fixed-weeks
                    :week-starts-on="1"
                    :min-value="minValue"
                    :max-value="maxValue"
                    :disable-days-outside-current-view="false"
                    :model-value="modelValue"
                    locale="pl-PL"
                    class="week-picker-calendar"
                    @update:model-value="emit('calendarUpdate', $event)"
                />
            </div>

            <div
                class="border-border bg-background flex items-center justify-between gap-2 border-t px-3 py-2"
            >
                <p class="text-muted-foreground text-xs font-medium">
                    Poniedziałek - niedziela
                </p>
                <UiButton
                    type="button"
                    variant="ghost"
                    size="sm"
                    class="h-8 font-semibold"
                    :disabled="disabled"
                    @click="selectCurrentWeek"
                >
                    <RotateCcw class="size-4" aria-hidden="true" />
                    Ten tydzień
                </UiButton>
            </div>
        </UiPopoverContent>
    </UiPopover>
</template>

<style scoped>
.week-picker-panel {
    animation-duration: 180ms;
}

.week-picker-calendar {
    width: 100%;
}

.week-picker-calendar :deep([data-slot='calendar']) {
    width: 100%;
}

.week-picker-calendar :deep([data-slot='calendar-grid']) {
    width: 100%;
}

.week-picker-calendar :deep([data-slot='calendar-cell-trigger']) {
    border-radius: 0.45rem;
    transition:
        background-color 150ms ease,
        color 150ms ease,
        box-shadow 150ms ease;
}

.week-picker-calendar :deep([data-selected]) {
    box-shadow: inset 0 0 0 1px
        color-mix(in srgb, var(--primary) 24%, transparent);
}

@media (prefers-reduced-motion: reduce) {
    .week-picker-calendar :deep([data-slot='calendar-cell-trigger']) {
        transition: none;
    }
}
</style>
