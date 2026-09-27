<script setup lang="ts">
import type { DateValue } from '@internationalized/date';
import { getLocalTimeZone, today } from '@internationalized/date';
import {
    Calendar as CalendarIcon,
    ChevronDown,
    RotateCcw,
    X,
} from 'lucide-vue-next';
import { computed, shallowRef } from 'vue';
import { cn } from '@/lib/utils';
import {
    dateValueToIsoDateString,
    isoDateStringToCalendarDate,
} from '~/utils/date/weeklyCalendarDates';

defineOptions({
    name: 'UiDatePicker',
});

const props = withDefaults(
    defineProps<{
        modelValue: string;
        id?: string;
        disabled?: boolean;
        placeholder?: string;
        locale?: string;
        ariaInvalid?: boolean;
        ariaDescribedby?: string;
        min?: string;
        max?: string;
        isDateDisabled?: (date: DateValue) => boolean;
        clearable?: boolean;
        showTodayButton?: boolean;
        triggerClass?: string;
        open?: boolean;
    }>(),
    {
        id: undefined,
        disabled: false,
        placeholder: 'Wybierz datę',
        locale: 'pl-PL',
        ariaInvalid: false,
        ariaDescribedby: undefined,
        min: undefined,
        max: undefined,
        isDateDisabled: undefined,
        clearable: false,
        showTodayButton: true,
        triggerClass: undefined,
        open: undefined,
    },
);

const emit = defineEmits<{
    'update:modelValue': [value: string];
    'update:open': [value: boolean];
}>();

const internalOpen = shallowRef(false);
const isOpen = computed({
    get: () => props.open ?? internalOpen.value,
    set: (value: boolean) => {
        internalOpen.value = value;
        emit('update:open', value);
    },
});

const selectedDate = computed(() =>
    isoDateStringToCalendarDate(props.modelValue),
);

const calendarValue = computed<DateValue | undefined>(() => selectedDate.value);

const displayLabel = computed(() => {
    if (!selectedDate.value) {
        return '';
    }

    return new Intl.DateTimeFormat(props.locale, {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(selectedDate.value.toDate(getLocalTimeZone()));
});

const minValueCal = computed(() => {
    const t = props.min?.trim();

    return t && t.length > 0 ? isoDateStringToCalendarDate(t) : undefined;
});

const maxValueCal = computed(() => {
    const t = props.max?.trim();

    return t && t.length > 0 ? isoDateStringToCalendarDate(t) : undefined;
});

function handleDateUpdate(value: DateValue | DateValue[] | undefined): void {
    if (!value || Array.isArray(value)) {
        return;
    }

    const iso = dateValueToIsoDateString(value);

    if (
        (props.min && iso < props.min) ||
        (props.max && iso > props.max) ||
        props.isDateDisabled?.(value)
    )
        return;

    emit('update:modelValue', iso);
    isOpen.value = false;
}

function handleClear(): void {
    emit('update:modelValue', '');
    isOpen.value = false;
}

function handleToday(): void {
    handleDateUpdate(today(getLocalTimeZone()));
}

const isTodayDisabled = computed(() => {
    const value = today(getLocalTimeZone());
    const iso = dateValueToIsoDateString(value);

    return Boolean(
        (props.min && iso < props.min) ||
        (props.max && iso > props.max) ||
        props.isDateDisabled?.(value),
    );
});
</script>

<template>
    <UiPopover v-model:open="isOpen">
        <UiPopoverTrigger as-child>
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
        </UiPopoverTrigger>

        <UiPopoverContent
            align="start"
            class="date-picker-panel bg-popover text-popover-foreground max-h-[min(32rem,var(--reka-popover-content-available-height))] w-[22rem] overflow-y-auto rounded-lg border p-0 shadow-lg"
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
                        Wybierz datę
                    </p>
                    <p class="text-muted-foreground mt-0.5 text-xs">
                        {{ displayLabel || placeholder }}
                    </p>
                </div>
            </div>

            <div class="p-3">
                <UiCalendar
                    fixed-weeks
                    :week-starts-on="1"
                    :min-value="minValueCal"
                    :max-value="maxValueCal"
                    :is-date-disabled="isDateDisabled"
                    :disable-days-outside-current-view="false"
                    :model-value="calendarValue"
                    :locale="locale"
                    :disabled="disabled"
                    class="date-picker-calendar"
                    @update:model-value="handleDateUpdate"
                />
            </div>

            <div
                class="border-border bg-background flex flex-wrap items-center justify-between gap-2 border-t px-3 py-2"
            >
                <UiButton
                    v-if="showTodayButton"
                    type="button"
                    variant="ghost"
                    size="sm"
                    class="h-8 font-semibold"
                    :disabled="disabled || isTodayDisabled"
                    @click="handleToday"
                >
                    Dzisiaj
                </UiButton>
                <UiButton
                    v-if="clearable && modelValue.trim().length > 0"
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
                    Pojedynczy dzień
                </div>
            </div>
        </UiPopoverContent>
    </UiPopover>
</template>

<style scoped>
.date-picker-panel {
    animation-duration: 180ms;
}

.date-picker-calendar {
    width: 100%;
}

.date-picker-calendar :deep([data-slot='calendar']) {
    width: 100%;
}

.date-picker-calendar :deep([data-slot='calendar-grid']) {
    width: 100%;
}

.date-picker-calendar :deep([data-slot='calendar-cell-trigger']) {
    border-radius: 0.45rem;
    transition:
        background-color 180ms ease,
        color 180ms ease,
        box-shadow 180ms ease;
}

.date-picker-calendar :deep([data-today]):not([data-selected]) {
    background: var(--accent);
    color: var(--accent-foreground);
}

.date-picker-calendar :deep([data-selected]) {
    background: var(--primary);
    color: var(--primary-foreground);
}

.date-picker-calendar :deep([data-disabled]),
.date-picker-calendar :deep([data-outside-view]) {
    color: var(--muted-foreground);
    opacity: 0.5;
}

.date-picker-calendar :deep([data-disabled]) {
    cursor: not-allowed;
}

@media (prefers-reduced-motion: reduce) {
    .date-picker-calendar :deep([data-slot='calendar-cell-trigger']) {
        transition: none;
    }
}
</style>
