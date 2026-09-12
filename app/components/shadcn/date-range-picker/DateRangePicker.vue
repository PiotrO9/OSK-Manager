<script setup lang="ts">
import type { DateValue } from '@internationalized/date';
import type { DateRange } from 'reka-ui';
import {
    Calendar as CalendarIcon,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    RotateCcw,
    X,
} from 'lucide-vue-next';
import {
    DateRangePickerCalendar,
    DateRangePickerCell,
    DateRangePickerCellTrigger,
    DateRangePickerContent,
    DateRangePickerGrid,
    DateRangePickerGridBody,
    DateRangePickerGridHead,
    DateRangePickerGridRow,
    DateRangePickerHeadCell,
    DateRangePickerHeader,
    DateRangePickerHeading,
    DateRangePickerNext,
    DateRangePickerPrev,
    DateRangePickerRoot,
    DateRangePickerTrigger,
} from 'reka-ui';
import { computed, shallowRef } from 'vue';
import { cn } from '@/lib/utils';
import {
    dateValueToIsoDateString,
    isoDateStringToCalendarDate,
} from '~/utils/date/weeklyCalendarDates';

export interface UiDateRangePickerValue {
    start: string;
    end: string;
}

interface DateRangePreset {
    key: string;
    label: string;
    isVisible: boolean;
    getRange: () => UiDateRangePickerValue;
}

defineOptions({
    name: 'UiDateRangePicker',
});

const props = withDefaults(
    defineProps<{
        modelValue: UiDateRangePickerValue;
        id?: string;
        disabled?: boolean;
        placeholder?: string;
        locale?: string;
        ariaInvalid?: boolean;
        ariaDescribedby?: string;
        min?: string;
        max?: string;
        clearable?: boolean;
        triggerClass?: string;
    }>(),
    {
        id: undefined,
        disabled: false,
        placeholder: 'Wybierz zakres dat',
        locale: 'pl-PL',
        ariaInvalid: false,
        ariaDescribedby: undefined,
        min: undefined,
        max: undefined,
        clearable: false,
        triggerClass: undefined,
    },
);

const emit = defineEmits<{
    'update:modelValue': [value: UiDateRangePickerValue];
}>();

const isOpen = shallowRef(false);

const rangeValue = computed<DateRange>(() => ({
    start: isoDateStringToCalendarDate(props.modelValue.start),
    end: isoDateStringToCalendarDate(props.modelValue.end),
}));

const minValueCal = computed(() => {
    const t = props.min?.trim();

    return t && t.length > 0 ? isoDateStringToCalendarDate(t) : undefined;
});

const maxValueCal = computed(() => {
    const t = props.max?.trim();

    return t && t.length > 0 ? isoDateStringToCalendarDate(t) : undefined;
});

const displayLabel = computed(() => {
    const start = rangeValue.value.start;
    const end = rangeValue.value.end;

    if (!start && !end) {
        return '';
    }

    if (start && !end) {
        return `Od ${formatDateLabel(start)}`;
    }

    if (!start && end) {
        return `Do ${formatDateLabel(end)}`;
    }

    return formatDateRangeLabel(start!, end!);
});

const visiblePresets = computed(() =>
    dateRangePresets.filter((preset) => preset.isVisible),
);

function formatDateLabel(value: DateValue): string {
    return new Intl.DateTimeFormat(props.locale, {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    }).format(value.toDate('Europe/Warsaw'));
}

function formatDateRangeLabel(start: DateValue, end: DateValue): string {
    const startDate = start.toDate('Europe/Warsaw');
    const endDate = end.toDate('Europe/Warsaw');
    const sameYear = startDate.getFullYear() === endDate.getFullYear();
    const sameMonth = sameYear && startDate.getMonth() === endDate.getMonth();

    if (sameMonth) {
        const month = new Intl.DateTimeFormat(props.locale, {
            month: 'long',
        }).format(endDate);

        return `${startDate.getDate()}-${endDate.getDate()} ${month} ${endDate.getFullYear()}`;
    }

    return `${formatDateLabel(start)} - ${formatDateLabel(end)}`;
}

function emitRange(range: DateRange): void {
    const start = range.start ? dateValueToIsoDateString(range.start) : '';
    const end = range.end ? dateValueToIsoDateString(range.end) : '';

    emit('update:modelValue', { start, end });

    if (start.length > 0 && end.length > 0) {
        isOpen.value = false;
    }
}

function handleClear(): void {
    emit('update:modelValue', { start: '', end: '' });
    isOpen.value = false;
}

function applyPreset(preset: DateRangePreset): void {
    emit('update:modelValue', preset.getRange());
}

function formatDateOnlyLocal(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');

    return `${y}-${m}-${d}`;
}

function addDays(date: Date, days: number): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

function startOfWeek(date: Date): Date {
    const day = date.getDay();
    const diff = day === 0 ? -6 : 1 - day;

    return addDays(date, diff);
}

function startOfMonth(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

function makeRange(start: Date, end: Date): UiDateRangePickerValue {
    return {
        start: formatDateOnlyLocal(start),
        end: formatDateOnlyLocal(end),
    };
}

const dateRangePresets: DateRangePreset[] = [
    {
        key: 'next-3-days',
        label: '3 dni',
        isVisible: true,
        getRange: () => {
            const start = new Date();

            return makeRange(start, addDays(start, 2));
        },
    },
    {
        key: 'this-month',
        label: 'Ten miesiąc',
        isVisible: true,
        getRange: () => {
            const now = new Date();

            return makeRange(startOfMonth(now), endOfMonth(now));
        },
    },
    {
        key: 'week-to-date',
        label: 'Od początku tygodnia',
        isVisible: false,
        getRange: () => {
            const now = new Date();

            return makeRange(startOfWeek(now), now);
        },
    },
    {
        key: 'month-to-date',
        label: 'Od początku miesiąca',
        isVisible: false,
        getRange: () => {
            const now = new Date();

            return makeRange(startOfMonth(now), now);
        },
    },
    {
        key: 'last-7-days',
        label: 'Ostatnie 7 dni',
        isVisible: false,
        getRange: () => {
            const end = new Date();

            return makeRange(addDays(end, -6), end);
        },
    },
];
</script>

<template>
    <DateRangePickerRoot
        v-model:open="isOpen"
        :model-value="rangeValue"
        :min-value="minValueCal"
        :max-value="maxValueCal"
        :locale="locale"
        :disabled="disabled"
        :week-starts-on="1"
        fixed-weeks
        @update:model-value="emitRange"
    >
        <DateRangePickerTrigger as-child>
            <UiButton
                :id="id"
                type="button"
                variant="outline"
                :disabled="disabled"
                :aria-invalid="ariaInvalid ? true : undefined"
                :aria-describedby="ariaDescribedby"
                :data-empty="displayLabel.length === 0"
                :class="
                    cn(
                        'data-[empty=true]:text-muted-foreground w-full max-w-lg justify-between text-left font-normal',
                        triggerClass,
                    )
                "
            >
                <span class="flex min-w-0 items-center gap-2">
                    <CalendarIcon
                        class="size-4 shrink-0 opacity-70"
                        aria-hidden="true"
                    />
                    <span class="min-w-0 truncate">
                        {{
                            displayLabel.length > 0 ? displayLabel : placeholder
                        }}
                    </span>
                </span>
                <ChevronDown
                    class="text-muted-foreground size-4 shrink-0"
                    aria-hidden="true"
                />
            </UiButton>
        </DateRangePickerTrigger>

        <DateRangePickerContent
            align="start"
            class="date-range-picker-panel bg-popover text-popover-foreground max-h-[min(32rem,var(--reka-popover-content-available-height))] w-[22rem] overflow-y-auto rounded-lg border p-0 shadow-lg"
            :collision-padding="12"
            :side-offset="8"
        >
            <div
                class="border-border bg-muted/25 flex items-start gap-3 border-b px-4 py-3"
            >
                <div
                    class="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-lg"
                    aria-hidden="true"
                >
                    <CalendarIcon class="size-4" />
                </div>
                <div class="min-w-0">
                    <p class="text-foreground text-sm font-bold">
                        Wybierz zakres
                    </p>
                    <p class="text-muted-foreground mt-0.5 text-xs">
                        {{ displayLabel || 'Najpierw start, potem koniec' }}
                    </p>
                </div>
            </div>

            <DateRangePickerCalendar
                #default="{ weekDays, grid }"
                class="date-range-picker-calendar p-3"
            >
                <DateRangePickerHeader class="relative">
                    <DateRangePickerPrev
                        aria-label="Poprzedni miesiąc"
                        class="border-input bg-background hover:bg-accent hover:text-accent-foreground absolute top-0 left-0 inline-flex size-8 items-center justify-center rounded-md border text-sm shadow-xs transition-colors"
                    >
                        <ChevronLeft class="size-4" aria-hidden="true" />
                    </DateRangePickerPrev>
                    <DateRangePickerHeading
                        class="text-center text-sm font-semibold"
                    />
                    <DateRangePickerNext
                        aria-label="Następny miesiąc"
                        class="border-input bg-background hover:bg-accent hover:text-accent-foreground absolute top-0 right-0 inline-flex size-8 items-center justify-center rounded-md border text-sm shadow-xs transition-colors"
                    >
                        <ChevronRight class="size-4" aria-hidden="true" />
                    </DateRangePickerNext>
                </DateRangePickerHeader>

                <div class="mt-4 flex flex-col gap-y-4">
                    <DateRangePickerGrid
                        v-for="month in grid"
                        :key="month.value.toString()"
                        class="w-full border-collapse space-y-1"
                    >
                        <DateRangePickerGridHead>
                            <DateRangePickerGridRow class="flex">
                                <DateRangePickerHeadCell
                                    v-for="day in weekDays"
                                    :key="day"
                                    class="text-muted-foreground w-10 rounded-md text-[0.8rem] font-normal"
                                >
                                    {{ day }}
                                </DateRangePickerHeadCell>
                            </DateRangePickerGridRow>
                        </DateRangePickerGridHead>
                        <DateRangePickerGridBody>
                            <DateRangePickerGridRow
                                v-for="(weekDates, index) in month.rows"
                                :key="`weekDate-${index}`"
                                class="mt-2 flex w-full"
                            >
                                <DateRangePickerCell
                                    v-for="weekDate in weekDates"
                                    :key="weekDate.toString()"
                                    :date="weekDate"
                                    class="date-range-picker-cell relative size-10 p-0 text-center text-sm"
                                >
                                    <DateRangePickerCellTrigger
                                        :day="weekDate"
                                        :month="month.value"
                                        as="button"
                                        class="date-range-picker-day hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring relative z-10 inline-flex size-10 cursor-pointer items-center justify-center rounded-md text-sm font-normal transition-colors outline-none focus-visible:ring-2 disabled:pointer-events-none"
                                    />
                                </DateRangePickerCell>
                            </DateRangePickerGridRow>
                        </DateRangePickerGridBody>
                    </DateRangePickerGrid>
                </div>
            </DateRangePickerCalendar>

            <div
                class="border-border bg-background flex flex-wrap items-center justify-between gap-2 border-t px-3 py-2"
            >
                <div class="flex flex-wrap gap-2">
                    <UiButton
                        v-for="preset in visiblePresets"
                        :key="preset.key"
                        type="button"
                        variant="ghost"
                        size="sm"
                        class="h-8 font-semibold"
                        :disabled="disabled"
                        @click="applyPreset(preset)"
                    >
                        {{ preset.label }}
                    </UiButton>
                </div>
                <UiButton
                    v-if="clearable && displayLabel.length > 0"
                    type="button"
                    variant="ghost"
                    size="sm"
                    class="text-muted-foreground h-8 font-semibold"
                    :disabled="disabled"
                    @click="handleClear"
                >
                    <X class="size-4" aria-hidden="true" />
                    Wyczyść
                </UiButton>
                <div
                    v-else
                    class="text-muted-foreground flex items-center gap-1 text-xs font-medium"
                >
                    <RotateCcw class="size-3.5" aria-hidden="true" />
                    Dowolna długość
                </div>
            </div>
        </DateRangePickerContent>
    </DateRangePickerRoot>
</template>

<style scoped>
.date-range-picker-panel {
    animation-duration: 180ms;
}

.date-range-picker-cell::before {
    position: absolute;
    top: 0.25rem;
    right: 0;
    bottom: 0.25rem;
    left: 0;
    z-index: 0;
    background: color-mix(in srgb, var(--primary) 13%, transparent);
    content: '';
    opacity: 0;
    transition:
        background-color 180ms ease,
        opacity 180ms ease;
}

.date-range-picker-cell:has(.date-range-picker-day[data-highlighted])::before,
.date-range-picker-cell:has(.date-range-picker-day[data-selected])::before {
    opacity: 1;
}

.date-range-picker-cell:has(
        .date-range-picker-day[data-selection-start]
    )::before,
.date-range-picker-cell:first-child::before {
    left: 0.25rem;
    border-top-left-radius: 999px;
    border-bottom-left-radius: 999px;
}

.date-range-picker-cell:has(.date-range-picker-day[data-selection-end])::before,
.date-range-picker-cell:last-child::before {
    right: 0.25rem;
    border-top-right-radius: 999px;
    border-bottom-right-radius: 999px;
}

.date-range-picker-day[data-today]:not([data-selected]) {
    background: var(--accent);
    color: var(--accent-foreground);
}

.date-range-picker-day[data-highlighted] {
    background: transparent;
    color: var(--foreground);
}

.date-range-picker-day[data-selection-start],
.date-range-picker-day[data-selection-end] {
    background: var(--primary);
    color: var(--primary-foreground);
    box-shadow: 0 8px 18px color-mix(in srgb, var(--primary) 20%, transparent);
}

.date-range-picker-day[data-selected]:not([data-selection-start]):not(
        [data-selection-end]
    ) {
    background: transparent;
    color: var(--foreground);
}

.date-range-picker-day[data-disabled],
.date-range-picker-day[data-outside-view] {
    color: var(--muted-foreground);
    opacity: 0.5;
}

.date-range-picker-day[data-disabled] {
    cursor: not-allowed;
}

@media (prefers-reduced-motion: reduce) {
    .date-range-picker-cell::before,
    .date-range-picker-day {
        transition: none;
    }
}
</style>
