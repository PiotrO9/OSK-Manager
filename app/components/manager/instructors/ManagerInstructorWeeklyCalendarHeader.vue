<script setup lang="ts">
import type { DateValue } from '@internationalized/date';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-vue-next';

defineProps<{
    isLoading: boolean;
    isCalendarOpen: boolean;
    calendarSelected: DateValue[];
    weekRangeCompactLabel: string;
    calendarMin: DateValue;
    calendarMax: DateValue;
}>();

defineEmits<{
    'update:isCalendarOpen': [open: boolean];
    calendarUpdate: [value: DateValue | DateValue[] | undefined];
    prevWeek: [];
    nextWeek: [];
    keyDownWeekNav: [event: KeyboardEvent, direction: 'prev' | 'next'];
}>();
</script>

<template>
    <UiCardHeader
        class="border-border flex flex-col gap-4 border-b p-4 md:flex-row md:items-center md:justify-between md:p-5"
    >
        <div class="flex min-w-0 gap-3">
            <div
                class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-700"
                aria-hidden="true"
            >
                <CalendarDays class="size-5" />
            </div>

            <div class="min-w-0">
                <UiCardTitle class="text-xl font-extrabold">
                    Wolne sloty instruktora
                </UiCardTitle>
                <UiCardDescription class="mt-1">
                    Kalendarz dostępnych okien do rezerwacji jazd.
                </UiCardDescription>
            </div>
        </div>

        <div
            class="flex min-w-0 flex-wrap items-center gap-2"
            role="toolbar"
            aria-label="Nawigacja tygodnia kalendarza slotów"
        >
            <UiPopover
                :open="isCalendarOpen"
                @update:open="$emit('update:isCalendarOpen', $event)"
            >
                <UiPopoverTrigger>
                    <UiButton
                        type="button"
                        variant="outline"
                        class="h-10 rounded-xl px-4 font-semibold shadow-sm"
                        :disabled="isLoading"
                        aria-label="Wybierz tydzien w kalendarzu"
                    >
                        <CalendarDays class="mr-2 size-4" aria-hidden="true" />
                        {{ weekRangeCompactLabel }}
                    </UiButton>
                </UiPopoverTrigger>
                <UiPopoverContent class="w-auto p-0" align="end">
                    <UiCalendar
                        multiple
                        fixed-weeks
                        :week-starts-on="1"
                        :min-value="calendarMin"
                        :max-value="calendarMax"
                        :disable-days-outside-current-view="false"
                        :model-value="calendarSelected"
                        locale="pl-PL"
                        @update:model-value="$emit('calendarUpdate', $event)"
                    />
                </UiPopoverContent>
            </UiPopover>

            <UiButton
                type="button"
                variant="outline"
                class="h-10 rounded-xl px-4 font-semibold shadow-sm"
                aria-label="Poprzedni tydzien"
                :disabled="isLoading"
                @click="$emit('prevWeek')"
                @keydown="$emit('keyDownWeekNav', $event, 'prev')"
            >
                <ChevronLeft class="mr-2 size-4" aria-hidden="true" />
                Poprzedni
            </UiButton>

            <UiButton
                type="button"
                variant="outline"
                class="h-10 rounded-xl px-4 font-semibold shadow-sm"
                aria-label="Nastepny tydzien"
                :disabled="isLoading"
                @click="$emit('nextWeek')"
                @keydown="$emit('keyDownWeekNav', $event, 'next')"
            >
                Nastepny
                <ChevronRight class="ml-2 size-4" aria-hidden="true" />
            </UiButton>
        </div>
    </UiCardHeader>
</template>
