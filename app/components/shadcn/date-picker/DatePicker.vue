<script setup lang="ts">
import type { CalendarDate, DateValue } from '@internationalized/date';
import { getLocalTimeZone } from '@internationalized/date';
import { Calendar as CalendarIcon } from 'lucide-vue-next';
import { computed, ref, watch } from 'vue';
import { cn } from '@/lib/utils';
import {
    dateValueToIsoDateString,
    isoDateStringToCalendarDate,
} from '~/utils/weeklyCalendarDates';

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
        /** Minimalna data (`YYYY-MM-DD`). */
        min?: string;
        /** Maksymalna data (`YYYY-MM-DD`). */
        max?: string;
        /** Pokaż przycisk czyszczenia (np. opcjonalne daty w pojeździe). */
        clearable?: boolean;
        triggerClass?: string;
    }>(),
    {
        id: undefined,
        placeholder: 'Wybierz datę',
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
    'update:modelValue': [value: string];
}>();

const isOpen = ref(false);

const calendarSelected = ref<CalendarDate | undefined>(undefined);

function syncCalendarFromModel(): void {
    calendarSelected.value = isoDateStringToCalendarDate(props.modelValue);
}

watch(
    () => props.modelValue,
    () => {
        syncCalendarFromModel();
    },
    { immediate: true },
);

const displayLabel = computed(() => {
    const parsed = isoDateStringToCalendarDate(props.modelValue);

    if (!parsed) {
        return '';
    }

    return new Intl.DateTimeFormat(props.locale, {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(parsed.toDate(getLocalTimeZone()));
});

const minValueCal = computed(() => {
    const t = props.min?.trim();

    return t && t.length > 0 ? isoDateStringToCalendarDate(t) : undefined;
});

const maxValueCal = computed(() => {
    const t = props.max?.trim();

    return t && t.length > 0 ? isoDateStringToCalendarDate(t) : undefined;
});

function handleCalendarUpdate(value: DateValue | undefined): void {
    if (value === undefined) {
        return;
    }

    emit('update:modelValue', dateValueToIsoDateString(value));
    isOpen.value = false;
}

function handleClear(): void {
    emit('update:modelValue', '');
    isOpen.value = false;
}

watch(isOpen, (open) => {
    if (open) {
        syncCalendarFromModel();
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
        <UiPopoverContent class="w-auto p-0" align="start">
            <UiCalendar
                :model-value="calendarSelected"
                :locale="locale"
                :min-value="minValueCal"
                :max-value="maxValueCal"
                @update:model-value="handleCalendarUpdate"
            />
            <div
                v-if="clearable && modelValue.trim().length > 0"
                class="border-border flex justify-center border-t p-2"
            >
                <UiButton
                    type="button"
                    variant="ghost"
                    size="sm"
                    class="text-muted-foreground w-full"
                    :disabled="disabled"
                    @click="handleClear"
                >
                    Wyczyść
                </UiButton>
            </div>
        </UiPopoverContent>
    </UiPopover>
</template>
