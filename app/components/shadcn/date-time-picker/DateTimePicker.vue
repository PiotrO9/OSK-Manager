<script setup lang="ts">
import type { CalendarDate } from '@internationalized/date';
import { getLocalTimeZone, today } from '@internationalized/date';
import { computed, nextTick, shallowRef, watch } from 'vue';
import { cn } from '@/lib/utils';
import UiDatePicker from '~/components/shadcn/date-picker/DatePicker.vue';
import UiTimePicker from '~/components/shadcn/time-picker/TimePicker.vue';
import {
    buildDatetimeLocal,
    dateValueToIsoDateString,
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
        minDate?: string;
        maxDate?: string;
        hourOptions?: number[];
        minuteOptions?: number[];
        clearable?: boolean;
        showTodayButton?: boolean;
        triggerClass?: string;
    }>(),
    {
        id: undefined,
        disabled: false,
        placeholder: 'Wybierz datę',
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

const datePickerOpen = shallowRef(false);
const timePickerOpen = shallowRef(false);
const timeValue = shallowRef('09:00');

const parsedDatetime = computed(() =>
    parseDatetimeLocalParts(props.modelValue),
);

const dateValue = computed(() => {
    if (!parsedDatetime.value) {
        return '';
    }

    return dateValueToIsoDateString(parsedDatetime.value.date);
});

function syncTimeFromModel(): void {
    const parsed = parseDatetimeLocalParts(props.modelValue);

    if (!parsed) {
        timeValue.value = '09:00';

        return;
    }

    timeValue.value = `${String(parsed.hour).padStart(2, '0')}:${String(
        parsed.minute,
    ).padStart(2, '0')}`;
}

function parseTime(value: string): { hour: number; minute: number } {
    const [hourRaw = '9', minuteRaw = '0'] = value.split(':');
    const hour = Number.parseInt(hourRaw, 10);
    const minute = Number.parseInt(minuteRaw, 10);

    return {
        hour: Number.isFinite(hour) ? hour : 9,
        minute: Number.isFinite(minute) ? minute : 0,
    };
}

function emitFromParts(date: CalendarDate, time: string): void {
    const { hour, minute } = parseTime(time);

    emit('update:modelValue', buildDatetimeLocal(date, hour, minute));
}

async function handleDateUpdate(value: string): Promise<void> {
    const date = isoDateStringToCalendarDate(value);

    datePickerOpen.value = false;
    timePickerOpen.value = false;

    if (!date) {
        emit('update:modelValue', '');

        return;
    }

    emitFromParts(date, timeValue.value);

    if (!props.disabled) {
        await nextTick();
        window.setTimeout(() => {
            timePickerOpen.value = true;
        }, 40);
    }
}

function handleTimeUpdate(value: string): void {
    timeValue.value = value;

    const date = parsedDatetime.value?.date ?? today(getLocalTimeZone());

    emitFromParts(date, value);
}

watch(
    () => props.modelValue,
    () => {
        syncTimeFromModel();
    },
    { immediate: true },
);
</script>

<template>
    <div
        :class="
            cn(
                'grid w-full max-w-lg grid-cols-[minmax(0,1fr)_8.75rem] gap-2',
                triggerClass,
            )
        "
    >
        <UiDatePicker
            :id="id"
            v-model:open="datePickerOpen"
            :model-value="dateValue"
            :disabled="disabled"
            :placeholder="placeholder"
            :aria-invalid="ariaInvalid"
            :aria-describedby="ariaDescribedby"
            :min="minDate"
            :max="maxDate"
            :clearable="clearable"
            :show-today-button="showTodayButton"
            trigger-class="h-10 max-w-none"
            @update:model-value="handleDateUpdate"
        />
        <UiTimePicker
            :id="id ? `${id}-time` : undefined"
            v-model:open="timePickerOpen"
            :model-value="timeValue"
            label="Godzina terminu"
            context-label="Termin"
            trigger-class="h-10 max-w-none"
            :disabled="disabled"
            :invalid="ariaInvalid"
            :describedby="ariaDescribedby"
            :hour-options="hourOptions"
            :minute-options="minuteOptions"
            @update:model-value="handleTimeUpdate"
        />
    </div>
</template>
