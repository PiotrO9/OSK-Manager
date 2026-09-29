<script setup lang="ts">
import type { CalendarDate, DateValue } from '@internationalized/date';

defineProps<{
    isLoading: boolean;
    weekRangeLabel: string;
    calendarSelected: CalendarDate[];
    calendarMin: DateValue;
    calendarMax: DateValue;
}>();

const emit = defineEmits<{
    prevWeek: [];
    nextWeek: [];
    calendarUpdate: [value: DateValue | DateValue[] | undefined];
    weekNavKeyDown: [event: KeyboardEvent, direction: 'prev' | 'next'];
}>();

const open = defineModel<boolean>('open', { required: true });
</script>

<template>
    <div class="border-border border-b px-4 py-4 md:px-5">
        <WeekCalendarToolbar
            v-model:calendar-open="open"
            :is-loading="isLoading"
            :compact-week-range-label="weekRangeLabel"
            :calendar-selected-model="calendarSelected"
            :min-value="calendarMin"
            :max-value="calendarMax"
            compact
            aria-label="Nawigacja tygodnia kalendarza slotów szkoły"
            @previous="emit('prevWeek')"
            @next="emit('nextWeek')"
            @previous-keydown="emit('weekNavKeyDown', $event, 'prev')"
            @next-keydown="emit('weekNavKeyDown', $event, 'next')"
            @calendar-update="emit('calendarUpdate', $event)"
        />
    </div>
</template>
