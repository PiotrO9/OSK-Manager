<script setup lang="ts">
import { CalendarDate, type DateValue } from '@internationalized/date';
import { ChevronLeft, ChevronRight } from 'lucide-vue-next';
import { toDate } from 'reka-ui/date';
import { useInstructorSlotsApi } from '~/composables/useInstructorSlotsApi';
import type { AvailabilitySlot } from '~/types/instructorSlots';
import { getApiFetchErrorMessage } from '~/utils/apiFetchErrorMessage';

const props = defineProps<{
    instructorId: string;
}>();

/** Oś czasu: 7:00–19:00 (12 h × 60 px). */
const BASE_HOUR = 7;
const GRID_HEIGHT_PX = 720;
const PX_PER_MINUTE = 1;

function formatDateOnly(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');

    return `${y}-${m}-${day}`;
}

function getMonday(d: Date): Date {
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;

    return new Date(d.getFullYear(), d.getMonth(), d.getDate() + diff);
}

function dateToCalendarDate(d: Date): CalendarDate {
    return new CalendarDate(d.getFullYear(), d.getMonth() + 1, d.getDate());
}

function weekRangeFromMonday(monday: Date): {
    dateFrom: string;
    dateTo: string;
} {
    const start = new Date(
        monday.getFullYear(),
        monday.getMonth(),
        monday.getDate(),
    );
    const end = new Date(
        monday.getFullYear(),
        monday.getMonth(),
        monday.getDate() + 6,
    );

    return {
        dateFrom: formatDateOnly(start),
        dateTo: formatDateOnly(end),
    };
}

function slotTopPx(startTime: string): number {
    const parts = startTime.trim().split(':').map(Number);

    if (parts.length < 2) {
        return 0;
    }

    const h = parts[0];
    const m = parts[1];

    if (
        h === undefined ||
        m === undefined ||
        !Number.isFinite(h) ||
        !Number.isFinite(m)
    ) {
        return 0;
    }

    const startMin = h * 60 + m;
    const baseMin = BASE_HOUR * 60;

    return (startMin - baseMin) * PX_PER_MINUTE;
}

const weekStart = ref<Date>(getMonday(new Date()));
const slots = ref<AvailabilitySlot[]>([]);
const errorMessage = ref<string | null>(null);
const isCalendarOpen = ref(false);

const calendarSelected = ref<DateValue>(
    dateToCalendarDate(getMonday(new Date())),
);

const { fetchSlots, isLoading } = useInstructorSlotsApi(
    () => props.instructorId,
);

let fetchSeq = 0;

const hourLabels = computed(() =>
    Array.from({ length: 12 }, (_, i) => BASE_HOUR + i),
);

const weekDays = computed(() => {
    const out: {
        date: Date;
        dateStr: string;
        header: string;
        isToday: boolean;
    }[] = [];

    const start = new Date(
        weekStart.value.getFullYear(),
        weekStart.value.getMonth(),
        weekStart.value.getDate(),
    );

    const todayStr = formatDateOnly(new Date());

    for (let i = 0; i < 7; i += 1) {
        const d = new Date(
            start.getFullYear(),
            start.getMonth(),
            start.getDate() + i,
        );
        const dateStr = formatDateOnly(d);

        out.push({
            date: d,
            dateStr,
            header: d.toLocaleDateString('pl-PL', {
                weekday: 'short',
                day: 'numeric',
                month: 'numeric',
            }),
            isToday: dateStr === todayStr,
        });
    }

    return out;
});

const weekRangeLabel = computed(() => {
    const end = new Date(
        weekStart.value.getFullYear(),
        weekStart.value.getMonth(),
        weekStart.value.getDate() + 6,
    );

    const opts: Intl.DateTimeFormatOptions = {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    };

    return `${weekStart.value.toLocaleDateString('pl-PL', opts)} – ${end.toLocaleDateString('pl-PL', opts)}`;
});

const slotsByDate = computed(() => {
    const map = new Map<string, AvailabilitySlot[]>();

    for (const s of slots.value) {
        if (!map.has(s.date)) {
            map.set(s.date, []);
        }

        map.get(s.date)!.push(s);
    }

    for (const arr of map.values()) {
        arr.sort((a, b) => a.startTime.localeCompare(b.startTime));
    }

    return map;
});

function slotsForDate(dateStr: string): AvailabilitySlot[] {
    return slotsByDate.value.get(dateStr) ?? [];
}

async function loadWeek(): Promise<void> {
    const id = props.instructorId.trim();

    if (!id) {
        slots.value = [];
        errorMessage.value = null;

        return;
    }

    const seq = ++fetchSeq;

    errorMessage.value = null;

    const { dateFrom, dateTo } = weekRangeFromMonday(weekStart.value);

    try {
        const data = await fetchSlots(dateFrom, dateTo);

        if (seq !== fetchSeq) {
            return;
        }

        slots.value = data;
    } catch (err: unknown) {
        if (seq !== fetchSeq) {
            return;
        }

        slots.value = [];
        errorMessage.value = getApiFetchErrorMessage(
            err,
            'Nie udało się pobrać slotów.',
        );
    }
}

watch(
    [weekStart, () => props.instructorId],
    () => {
        void loadWeek();
    },
    { immediate: true },
);

watch(weekStart, (w) => {
    calendarSelected.value = dateToCalendarDate(w);
});

function handlePrevWeek(): void {
    const d = new Date(weekStart.value);

    d.setDate(d.getDate() - 7);
    weekStart.value = d;
}

function handleNextWeek(): void {
    const d = new Date(weekStart.value);

    d.setDate(d.getDate() + 7);
    weekStart.value = d;
}

function handleCalendarUpdate(value: DateValue | undefined): void {
    if (value === undefined) {
        return;
    }

    weekStart.value = getMonday(toDate(value));
    isCalendarOpen.value = false;
}

function handleKeyDownWeekNav(
    event: KeyboardEvent,
    direction: 'prev' | 'next',
): void {
    if (event.key !== 'Enter' && event.key !== ' ') {
        return;
    }

    event.preventDefault();

    if (direction === 'prev') {
        handlePrevWeek();
    } else {
        handleNextWeek();
    }
}
</script>

<template>
    <div class="space-y-4">
        <div
            class="flex flex-wrap items-center justify-between gap-3"
            role="toolbar"
            aria-label="Nawigacja tygodnia kalendarza slotów"
        >
            <div class="flex flex-wrap items-center gap-2">
                <UiButton
                    type="button"
                    variant="ghost"
                    size="sm"
                    class="inline-flex items-center gap-1"
                    aria-label="Poprzedni tydzień"
                    :disabled="isLoading"
                    @click="handlePrevWeek"
                    @keydown="handleKeyDownWeekNav($event, 'prev')"
                >
                    <ChevronLeft class="size-4" aria-hidden="true" />
                    Poprzedni
                </UiButton>
                <UiButton
                    type="button"
                    variant="ghost"
                    size="sm"
                    class="inline-flex items-center gap-1"
                    aria-label="Następny tydzień"
                    :disabled="isLoading"
                    @click="handleNextWeek"
                    @keydown="handleKeyDownWeekNav($event, 'next')"
                >
                    Następny
                    <ChevronRight class="size-4" aria-hidden="true" />
                </UiButton>
            </div>

            <p
                class="text-foreground min-w-0 flex-1 text-center text-sm font-medium"
                aria-live="polite"
            >
                {{ weekRangeLabel }}
            </p>

            <UiPopover v-model:open="isCalendarOpen">
                <UiPopoverTrigger>
                    <UiButton
                        type="button"
                        variant="outline"
                        size="sm"
                        :disabled="isLoading"
                        aria-label="Wybierz tydzień w kalendarzu"
                    >
                        Wybierz tydzień
                    </UiButton>
                </UiPopoverTrigger>
                <UiPopoverContent class="w-auto p-0" align="end">
                    <UiCalendar
                        :model-value="calendarSelected"
                        locale="pl-PL"
                        @update:model-value="handleCalendarUpdate"
                    />
                </UiPopoverContent>
            </UiPopover>
        </div>

        <p
            v-if="errorMessage"
            class="text-destructive text-sm"
            role="alert"
            aria-live="polite"
        >
            {{ errorMessage }}
        </p>

        <div class="border-border relative overflow-x-auto rounded-xl border">
            <div
                class="bg-muted/30 text-muted-foreground border-border flex min-w-[720px] items-center gap-2 border-b px-3 py-2 text-xs"
                role="status"
            >
                <span>Oś godzin: {{ BASE_HOUR }}:00–19:00</span>
                <UiBadge v-if="isLoading" variant="secondary"
                    >Ładowanie…</UiBadge
                >
            </div>

            <div class="relative min-w-[720px]">
                <div
                    v-if="isLoading"
                    class="bg-background/80 absolute inset-0 z-10 flex items-center justify-center backdrop-blur-[1px]"
                    role="status"
                    aria-live="polite"
                >
                    <div class="flex w-full max-w-md flex-col gap-2 p-4">
                        <UiSkeleton class="h-8 w-full" />
                        <UiSkeleton class="h-32 w-full" />
                        <UiSkeleton class="h-32 w-full" />
                    </div>
                </div>

                <div
                    class="flex"
                    role="grid"
                    :aria-label="`Terminarz slotów, ${weekRangeLabel}`"
                >
                    <div
                        class="border-border flex w-12 shrink-0 flex-col border-r"
                        aria-hidden="true"
                    >
                        <div
                            class="border-border flex h-12 shrink-0 items-end border-b pr-2"
                        />
                        <div
                            class="flex flex-col"
                            :style="{ height: `${GRID_HEIGHT_PX}px` }"
                        >
                            <div
                                v-for="h in hourLabels"
                                :key="h"
                                class="text-muted-foreground flex h-[60px] items-start justify-end pr-2 text-xs"
                            >
                                {{ String(h).padStart(2, '0') }}:00
                            </div>
                        </div>
                    </div>

                    <div class="grid min-w-0 flex-1 grid-cols-7">
                        <div
                            v-for="day in weekDays"
                            :key="day.dateStr"
                            class="border-border flex min-w-0 flex-col border-r last:border-r-0"
                        >
                            <div
                                class="border-border flex h-12 shrink-0 flex-col items-center justify-center border-b px-1 text-center"
                                :class="
                                    day.isToday
                                        ? 'bg-primary/10 font-semibold'
                                        : ''
                                "
                            >
                                <span
                                    class="text-foreground text-xs font-medium capitalize"
                                >
                                    {{ day.header }}
                                </span>
                                <UiBadge
                                    v-if="day.isToday"
                                    variant="secondary"
                                    class="mt-1"
                                >
                                    dziś
                                </UiBadge>
                            </div>

                            <div
                                class="border-border relative border-b"
                                :style="{ height: `${GRID_HEIGHT_PX}px` }"
                            >
                                <div
                                    class="pointer-events-none absolute inset-0 flex flex-col"
                                    aria-hidden="true"
                                >
                                    <div
                                        v-for="n in 12"
                                        :key="n"
                                        class="border-border/50 h-[60px] border-b border-dashed"
                                    />
                                </div>

                                <template
                                    v-for="slot in slotsForDate(day.dateStr)"
                                    :key="`${slot.date}-${slot.startTime}`"
                                >
                                    <div
                                        class="bg-primary/15 border-primary text-primary absolute right-1 left-1 overflow-hidden rounded-md border px-1 py-0.5 text-xs shadow-sm"
                                        :style="{
                                            top: `${slotTopPx(slot.startTime)}px`,
                                            height: '60px',
                                        }"
                                        :title="`${slot.startTime} – ${slot.endTime}`"
                                        role="group"
                                        :aria-label="`Wolny slot ${slot.startTime} do ${slot.endTime}`"
                                    >
                                        <span class="font-medium">
                                            {{ slot.startTime }}–{{
                                                slot.endTime
                                            }}
                                        </span>
                                    </div>
                                </template>

                                <div
                                    v-if="
                                        slotsForDate(day.dateStr).length ===
                                            0 &&
                                        !isLoading &&
                                        !errorMessage
                                    "
                                    class="text-muted-foreground absolute inset-0 flex items-center justify-center p-2 text-center text-xs"
                                >
                                    Brak slotów
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
