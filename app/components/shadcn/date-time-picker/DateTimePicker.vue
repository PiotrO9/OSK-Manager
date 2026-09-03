<script setup lang="ts">
import type { CalendarDate, DateValue } from '@internationalized/date';
import { getLocalTimeZone, today } from '@internationalized/date';
import { Calendar as CalendarIcon } from 'lucide-vue-next';
import { computed, nextTick, ref, shallowRef, watch } from 'vue';
import { cn } from '@/lib/utils';
import {
    buildDatetimeLocal,
    dateValueToIsoDateString,
    formatDatetimeLocalPl,
    isoDateStringToCalendarDate,
    parseDatetimeLocalParts,
} from '~/utils/date/weeklyCalendarDates';

defineOptions({
    name: 'UiDateTimePicker',
});

const props = withDefaults(
    defineProps<{
        modelValue: string;
        id?: string;
        disabled?: boolean;
        placeholder?: string;
        ariaInvalid?: boolean;
        ariaDescribedby?: string;
        ariaRequired?: boolean;
        /** Minimalna data (`YYYY-MM-DD`) dla kalendarza. */
        minDate?: string;
        /** Maksymalna data (`YYYY-MM-DD`) dla kalendarza. */
        maxDate?: string;
        /**
         * Dozwolone godziny (0–23). Puste lub brak — pełny zakres.
         * Np. przy edycji eventu z `freeWindows`.
         */
        hourOptions?: number[];
        /**
         * Dozwolone minuty (0–59). Puste lub brak — pełny zakres.
         * Np. przy edycji eventu z `freeWindows`.
         */
        minuteOptions?: number[];
        clearable?: boolean;
        /** Przycisk ustawiający dzisiejszą datę (bez zmiany godziny). */
        showTodayButton?: boolean;
        triggerClass?: string;
    }>(),
    {
        id: undefined,
        placeholder: 'Wybierz datę i godzinę',
        ariaInvalid: false,
        ariaDescribedby: undefined,
        ariaRequired: false,
        minDate: undefined,
        maxDate: undefined,
        hourOptions: undefined,
        minuteOptions: undefined,
        clearable: false,
        showTodayButton: true,
        triggerClass: undefined,
    },
);

const emit = defineEmits<{
    'update:modelValue': [value: string];
}>();

const DEFAULT_HOUR_OPTIONS: number[] = Array.from({ length: 24 }, (_, i) => i);

const DEFAULT_MINUTE_OPTIONS: number[] = Array.from(
    { length: 60 },
    (_, i) => i,
);

const isOpen = ref(false);

const calendarSelected = shallowRef<CalendarDate | undefined>(undefined);
const hour = ref(9);
const minute = ref(0);

const effectiveHourOptions = computed(() => {
    const h = props.hourOptions;

    if (h === undefined || h.length === 0) {
        return DEFAULT_HOUR_OPTIONS;
    }

    return [...new Set(h)].sort((a, b) => a - b);
});

const effectiveMinuteOptions = computed(() => {
    const m = props.minuteOptions;

    if (m === undefined || m.length === 0) {
        return DEFAULT_MINUTE_OPTIONS;
    }

    return [...new Set(m)].sort((a, b) => a - b);
});

function ensureCalendarDate(): CalendarDate {
    if (calendarSelected.value) {
        return calendarSelected.value;
    }

    const t = today(getLocalTimeZone());

    calendarSelected.value = t;

    return t;
}

function emitFromParts(): void {
    const d = ensureCalendarDate();

    emit('update:modelValue', buildDatetimeLocal(d, hour.value, minute.value));
}

function clampSelectionToEffectiveOptions(): void {
    const hours = effectiveHourOptions.value;
    const mins = effectiveMinuteOptions.value;

    if (!hours.includes(hour.value)) {
        hour.value = hours[0] ?? 0;
    }

    if (!mins.includes(minute.value)) {
        minute.value = mins[0] ?? 0;
    }
}

function syncFromModel(): void {
    const p = parseDatetimeLocalParts(props.modelValue);

    if (p) {
        calendarSelected.value = p.date;
        hour.value = p.hour;
        minute.value = p.minute;
        clampSelectionToEffectiveOptions();
        const next = buildDatetimeLocal(p.date, hour.value, minute.value);

        if (next !== props.modelValue.trim()) {
            emit('update:modelValue', next);
        }

        return;
    }

    calendarSelected.value = undefined;
    hour.value = 9;
    minute.value = 0;
}

watch(
    () => props.modelValue,
    () => {
        syncFromModel();
    },
    { immediate: true },
);

watch(
    () => {
        const h = props.hourOptions;
        const m = props.minuteOptions;

        return {
            hKey:
                h === undefined || h.length === 0
                    ? ''
                    : [...new Set(h)].sort((a, b) => a - b).join(','),
            mKey:
                m === undefined || m.length === 0
                    ? ''
                    : [...new Set(m)].sort((a, b) => a - b).join(','),
        };
    },
    () => {
        void nextTick(() => {
            if (!parseDatetimeLocalParts(props.modelValue)) {
                return;
            }

            const prev = buildDatetimeLocal(
                ensureCalendarDate(),
                hour.value,
                minute.value,
            );

            clampSelectionToEffectiveOptions();
            const next = buildDatetimeLocal(
                ensureCalendarDate(),
                hour.value,
                minute.value,
            );

            if (prev !== next) {
                emit('update:modelValue', next);
            }
        });
    },
);

const displayLabel = computed(() => formatDatetimeLocalPl(props.modelValue));

function handleCalendarUpdate(value: DateValue | undefined): void {
    if (value === undefined) {
        return;
    }

    const iso = dateValueToIsoDateString(value);
    const cd = isoDateStringToCalendarDate(iso);

    if (!cd) {
        return;
    }

    calendarSelected.value = cd;
    emitFromParts();
}

function handleHourChange(event: Event): void {
    const raw = (event.target as HTMLSelectElement).value;
    const h = Number.parseInt(raw, 10);

    if (!Number.isFinite(h) || h < 0 || h > 23) {
        return;
    }

    hour.value = h;
    emitFromParts();

    void nextTick(() => {
        const mins = effectiveMinuteOptions.value;

        if (!mins.includes(minute.value)) {
            minute.value = mins[0] ?? 0;
            emitFromParts();
        }
    });
}

function handleMinuteChange(event: Event): void {
    const raw = (event.target as HTMLSelectElement).value;
    const m = Number.parseInt(raw, 10);

    if (!Number.isFinite(m) || m < 0 || m > 59) {
        return;
    }

    minute.value = m;
    emitFromParts();
}

function handleToday(): void {
    const t = today(getLocalTimeZone());

    calendarSelected.value = t;
    emitFromParts();
}

function handleClear(): void {
    emit('update:modelValue', '');
    isOpen.value = false;
}

const minValueCal = computed(() => {
    const t = props.minDate?.trim();

    return t && t.length > 0 ? isoDateStringToCalendarDate(t) : undefined;
});

const maxValueCal = computed(() => {
    const t = props.maxDate?.trim();

    return t && t.length > 0 ? isoDateStringToCalendarDate(t) : undefined;
});

watch(isOpen, (open) => {
    if (!open) {
        return;
    }

    if (props.modelValue.trim().length === 0) {
        calendarSelected.value = today(getLocalTimeZone());
        hour.value = 9;
        minute.value = 0;

        return;
    }

    void nextTick(() => {
        if (!parseDatetimeLocalParts(props.modelValue)) {
            return;
        }

        const prev = buildDatetimeLocal(
            ensureCalendarDate(),
            hour.value,
            minute.value,
        );

        clampSelectionToEffectiveOptions();
        const next = buildDatetimeLocal(
            ensureCalendarDate(),
            hour.value,
            minute.value,
        );

        if (prev !== next) {
            emit('update:modelValue', next);
        }
    });
});
</script>

<template>
    <UiPopover v-model:open="isOpen">
        <UiPopoverTrigger>
            <UiButton
                :id="id"
                type="button"
                variant="outline"
                :disabled="disabled"
                :aria-invalid="ariaInvalid ? true : undefined"
                :aria-required="ariaRequired ? true : undefined"
                :aria-describedby="ariaDescribedby"
                :data-empty="displayLabel.length === 0"
                :class="
                    cn(
                        'data-[empty=true]:text-muted-foreground w-full max-w-lg justify-start text-left font-normal',
                        triggerClass,
                    )
                "
            >
                <CalendarIcon
                    class="size-4 shrink-0 opacity-70"
                    aria-hidden="true"
                />
                <span v-if="displayLabel.length > 0">{{ displayLabel }}</span>
                <span v-else>{{ placeholder }}</span>
            </UiButton>
        </UiPopoverTrigger>
        <UiPopoverContent
            class="w-auto max-w-[min(100vw-2rem,28rem)] overflow-hidden p-0"
            align="start"
        >
            <div class="sm:divide-border flex flex-col sm:flex-row sm:divide-x">
                <div class="min-w-0 flex-1">
                    <UiCalendar
                        :model-value="calendarSelected"
                        locale="pl-PL"
                        :min-value="minValueCal"
                        :max-value="maxValueCal"
                        @update:model-value="handleCalendarUpdate"
                    />
                </div>
                <div
                    class="border-border flex flex-col justify-center gap-2 border-t p-3 sm:w-38 sm:border-t-0"
                >
                    <div class="grid grid-cols-2 gap-2">
                        <div class="space-y-1">
                            <label
                                class="text-muted-foreground block text-center text-xs font-medium"
                                :for="id ? `${id}-hour` : undefined"
                            >
                                Godz.
                            </label>
                            <select
                                :id="id ? `${id}-hour` : undefined"
                                class="border-input bg-background ring-offset-background focus-visible:ring-ring h-9 w-full rounded-md border px-2 text-sm shadow-xs focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                :value="hour"
                                :disabled="disabled"
                                aria-label="Godzina"
                                @change="handleHourChange"
                            >
                                <option
                                    v-for="h in effectiveHourOptions"
                                    :key="h"
                                    :value="h"
                                >
                                    {{ String(h).padStart(2, '0') }}
                                </option>
                            </select>
                        </div>
                        <div class="space-y-1">
                            <label
                                class="text-muted-foreground block text-center text-xs font-medium"
                                :for="id ? `${id}-minute` : undefined"
                            >
                                Min.
                            </label>
                            <select
                                :id="id ? `${id}-minute` : undefined"
                                class="border-input bg-background ring-offset-background focus-visible:ring-ring h-9 w-full rounded-md border px-2 text-sm shadow-xs focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                :value="minute"
                                :disabled="disabled"
                                aria-label="Minuta"
                                @change="handleMinuteChange"
                            >
                                <option
                                    v-for="m in effectiveMinuteOptions"
                                    :key="m"
                                    :value="m"
                                >
                                    {{ String(m).padStart(2, '0') }}
                                </option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
            <div
                v-if="
                    showTodayButton ||
                    (clearable && modelValue.trim().length > 0)
                "
                class="border-border flex flex-wrap items-center justify-start gap-2 border-t px-2 py-2"
            >
                <UiButton
                    v-if="showTodayButton"
                    type="button"
                    variant="ghost"
                    size="sm"
                    class="text-muted-foreground"
                    :disabled="disabled"
                    @click="handleToday"
                >
                    Dzisiaj
                </UiButton>
                <UiButton
                    v-if="clearable && modelValue.trim().length > 0"
                    type="button"
                    variant="ghost"
                    size="sm"
                    class="text-muted-foreground"
                    :disabled="disabled"
                    @click="handleClear"
                >
                    Wyczyść
                </UiButton>
            </div>
        </UiPopoverContent>
    </UiPopover>
</template>
