<script setup lang="ts">
import type { CalendarDate, DateValue } from '@internationalized/date';
import { getLocalTimeZone, today } from '@internationalized/date';
import { Calendar as CalendarIcon } from 'lucide-vue-next';
import { computed, ref, watch } from 'vue';
import { cn } from '@/lib/utils';
import {
    buildDatetimeLocal,
    dateValueToIsoDateString,
    formatDatetimeLocalPl,
    isoDateStringToCalendarDate,
    parseDatetimeLocalParts,
} from '~/utils/weeklyCalendarDates';

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
        clearable?: boolean;
        /** Przycisk ustawiający dzisiejszą datę (bez zmiany godziny). */
        showTodayButton?: boolean;
        triggerClass?: string;
    }>(),
    {
        placeholder: 'Wybierz datę i godzinę',
        ariaInvalid: false,
        ariaRequired: false,
        clearable: false,
        showTodayButton: true,
    },
);

const emit = defineEmits<{
    'update:modelValue': [value: string];
}>();

const isOpen = ref(false);

const calendarSelected = ref<CalendarDate | undefined>(undefined);
const hour = ref(9);
const minute = ref(0);

const hourOptions = computed(() => Array.from({ length: 24 }, (_, i) => i));

const minuteOptions = computed(() => Array.from({ length: 60 }, (_, i) => i));

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

function syncFromModel(): void {
    const p = parseDatetimeLocalParts(props.modelValue);

    if (p) {
        calendarSelected.value = p.date;
        hour.value = p.hour;
        minute.value = p.minute;

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
    }
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
                                    v-for="h in hourOptions"
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
                                    v-for="m in minuteOptions"
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
