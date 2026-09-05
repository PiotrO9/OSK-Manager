<script setup lang="ts">
import type { CalendarDate, DateValue } from '@internationalized/date';
import { ChevronLeft, ChevronRight } from 'lucide-vue-next';

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
    <div
        class="border-border flex flex-col gap-3 border-b px-4 py-4 md:flex-row md:items-center md:justify-between md:px-5"
        role="toolbar"
        aria-label="Nawigacja tygodnia kalendarza slotów szkoły"
    >
        <div
            class="border-border inline-flex w-fit overflow-hidden rounded-xl border bg-white shadow-xs dark:bg-transparent"
        >
            <button
                type="button"
                class="text-foreground hover:bg-muted/60 focus-visible:ring-ring inline-flex h-9 items-center gap-1 border-r px-3 text-xs font-semibold transition focus-visible:ring-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
                aria-label="Poprzedni tydzień"
                :disabled="isLoading"
                @click="emit('prevWeek')"
                @keydown="emit('weekNavKeyDown', $event, 'prev')"
            >
                <ChevronLeft class="size-4" aria-hidden="true" />
                Poprzedni
            </button>
            <button
                type="button"
                class="text-foreground hover:bg-muted/60 focus-visible:ring-ring inline-flex h-9 items-center gap-1 px-3 text-xs font-semibold transition focus-visible:ring-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
                aria-label="Następny tydzień"
                :disabled="isLoading"
                @click="emit('nextWeek')"
                @keydown="emit('weekNavKeyDown', $event, 'next')"
            >
                Następny
                <ChevronRight class="size-4" aria-hidden="true" />
            </button>
        </div>

        <p
            class="border-border bg-muted/30 text-foreground min-w-0 rounded-xl border px-4 py-2 text-center text-xs font-semibold md:min-w-64"
            aria-live="polite"
        >
            {{ weekRangeLabel }}
        </p>

        <UiPopover v-model:open="open">
            <UiPopoverTrigger>
                <button
                    type="button"
                    class="border-border bg-card text-foreground hover:bg-muted/60 focus-visible:ring-ring inline-flex h-9 items-center rounded-xl border px-3 text-sm font-semibold shadow-xs transition focus-visible:ring-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
                    :disabled="isLoading"
                    aria-label="Wybierz tydzień w kalendarzu (poniedziałek do niedzieli)"
                >
                    Wybierz tydzień
                </button>
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
                    @update:model-value="emit('calendarUpdate', $event)"
                />
            </UiPopoverContent>
        </UiPopover>
    </div>
</template>
