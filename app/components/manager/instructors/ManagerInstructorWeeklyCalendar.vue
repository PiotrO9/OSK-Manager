<script setup lang="ts">
import type { CalendarDate, DateValue } from '@internationalized/date';
import {
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    Clock3,
    SlidersHorizontal,
} from 'lucide-vue-next';
import { toDate } from 'reka-ui/date';
import { useInstructorSlotsApi } from '~/composables/useInstructorSlotsApi';
import type { AvailabilitySlot } from '~/types/instructorSlots';
import { getApiFetchErrorMessage } from '~/utils/apiFetchErrorMessage';
import {
    formatDateOnly,
    getMonday,
    WEEK_PICKER_CALENDAR_MAX,
    WEEK_PICKER_CALENDAR_MIN,
    weekCalendarDatesFromMonday,
    weekRangeFromMonday,
} from '~/utils/weeklyCalendarDates';

const props = withDefaults(
    defineProps<{
        instructorId: string;
        compact?: boolean;
    }>(),
    {
        compact: false,
    },
);

const BASE_HOUR = 7;
const END_HOUR = 19;
const GRID_HEIGHT_PX = 720;
const PX_PER_MINUTE = 1;

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

const calendarSelected = ref<CalendarDate[]>(
    weekCalendarDatesFromMonday(getMonday(new Date())),
);

const { fetchSlots, isLoading } = useInstructorSlotsApi(
    () => props.instructorId,
);

let fetchSeq = 0;

const hourLabels = computed(() =>
    Array.from({ length: END_HOUR - BASE_HOUR }, (_, i) => BASE_HOUR + i),
);

const weekDays = computed(() => {
    const out: {
        date: Date;
        dateStr: string;
        header: string;
        shortHeader: string;
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
            shortHeader: d.toLocaleDateString('pl-PL', {
                weekday: 'short',
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

    return `${weekStart.value.toLocaleDateString('pl-PL', opts)} - ${end.toLocaleDateString('pl-PL', opts)}`;
});

const weekRangeCompactLabel = computed(() => {
    const end = new Date(
        weekStart.value.getFullYear(),
        weekStart.value.getMonth(),
        weekStart.value.getDate() + 6,
    );

    const startDay = weekStart.value.toLocaleDateString('pl-PL', {
        day: '2-digit',
    });
    const endLabel = end.toLocaleDateString('pl-PL', {
        day: '2-digit',
        month: 'long',
    });

    return `${startDay}-${endLabel}`;
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

const totalSlots = computed(() => slots.value.length);

const earliestSlotLabel = computed(() => {
    const first = slots.value
        .map((slot) => slot.startTime)
        .filter((time) => time.trim().length > 0)
        .sort((a, b) => a.localeCompare(b))[0];

    return first ?? '-';
});

const busiestDay = computed(() => {
    const sorted = weekDays.value
        .map((day) => ({
            label: day.shortHeader,
            count: slotsForDate(day.dateStr).length,
        }))
        .sort((a, b) => b.count - a.count);

    const first = sorted[0];

    if (!first || first.count === 0) {
        return null;
    }

    return first;
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
            'Nie udalo sie pobrac slotow.',
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
    calendarSelected.value = weekCalendarDatesFromMonday(w);
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

function handleCalendarUpdate(
    value: DateValue | DateValue[] | undefined,
): void {
    if (value === undefined) {
        return;
    }

    const arr = Array.isArray(value) ? value : [value];

    if (arr.length === 0) {
        return;
    }

    let anchor = arr[0]!;

    for (const v of arr) {
        if (toDate(v).getTime() > toDate(anchor).getTime()) {
            anchor = v;
        }
    }

    const monday = getMonday(toDate(anchor));

    weekStart.value = monday;
    calendarSelected.value = weekCalendarDatesFromMonday(monday);
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
    <UiCard
        :class="
            props.compact
                ? 'overflow-hidden rounded-none border-0 shadow-none'
                : 'overflow-hidden rounded-2xl shadow-sm'
        "
    >
        <UiCardHeader
            v-if="!props.compact"
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
                        Kalendarz dostepnych okien do rezerwacji jazd.
                    </UiCardDescription>
                </div>
            </div>

            <div
                class="flex min-w-0 flex-wrap items-center gap-2"
                role="toolbar"
                aria-label="Nawigacja tygodnia kalendarza slotow"
            >
                <UiPopover v-model:open="isCalendarOpen">
                    <UiPopoverTrigger>
                        <UiButton
                            type="button"
                            variant="outline"
                            class="h-10 rounded-xl px-4 font-semibold shadow-sm"
                            :disabled="isLoading"
                            aria-label="Wybierz tydzien w kalendarzu"
                        >
                            <CalendarDays
                                class="mr-2 size-4"
                                aria-hidden="true"
                            />
                            {{ weekRangeCompactLabel }}
                        </UiButton>
                    </UiPopoverTrigger>
                    <UiPopoverContent class="w-auto p-0" align="end">
                        <UiCalendar
                            multiple
                            fixed-weeks
                            :week-starts-on="1"
                            :min-value="WEEK_PICKER_CALENDAR_MIN"
                            :max-value="WEEK_PICKER_CALENDAR_MAX"
                            :disable-days-outside-current-view="false"
                            :model-value="calendarSelected"
                            locale="pl-PL"
                            @update:model-value="handleCalendarUpdate"
                        />
                    </UiPopoverContent>
                </UiPopover>

                <UiButton
                    type="button"
                    variant="outline"
                    class="h-10 rounded-xl px-4 font-semibold shadow-sm"
                    aria-label="Poprzedni tydzien"
                    :disabled="isLoading"
                    @click="handlePrevWeek"
                    @keydown="handleKeyDownWeekNav($event, 'prev')"
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
                    @click="handleNextWeek"
                    @keydown="handleKeyDownWeekNav($event, 'next')"
                >
                    Nastepny
                    <ChevronRight class="ml-2 size-4" aria-hidden="true" />
                </UiButton>
            </div>
        </UiCardHeader>

        <UiCardContent class="p-0">
            <div
                v-if="!props.compact"
                class="border-border border-b p-4 md:p-5"
            >
                <div class="grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
                    <div
                        class="border-border bg-background flex min-w-0 flex-wrap items-center gap-2 rounded-xl border px-3 py-2"
                        role="status"
                        aria-live="polite"
                    >
                        <span
                            class="text-foreground flex items-center gap-2 text-sm font-semibold"
                        >
                            <SlidersHorizontal
                                class="size-4 text-sky-700"
                                aria-hidden="true"
                            />
                            Filtry zapytania API
                        </span>
                        <StatusBadge
                            label="Ten instruktor"
                            tone="info"
                            subtle
                        />
                        <StatusBadge
                            :label="`${BASE_HOUR}:00-${END_HOUR}:00`"
                            tone="neutral"
                            subtle
                        />
                        <StatusBadge
                            label="Sortuj: godzina"
                            tone="neutral"
                            subtle
                        />
                    </div>

                    <div
                        class="border-border bg-background grid grid-cols-3 overflow-hidden rounded-xl border"
                    >
                        <div class="border-border border-r px-3 py-2">
                            <p class="text-muted-foreground text-xs">
                                Okna w tygodniu
                            </p>
                            <p class="text-foreground text-lg font-extrabold">
                                {{ totalSlots }}
                            </p>
                        </div>
                        <div class="border-border border-r px-3 py-2">
                            <p class="text-muted-foreground text-xs">
                                Najblizszy slot
                            </p>
                            <p class="text-foreground text-lg font-extrabold">
                                {{ earliestSlotLabel }}
                            </p>
                        </div>
                        <div class="px-3 py-2">
                            <p class="text-muted-foreground text-xs">Zakres</p>
                            <p class="text-foreground text-lg font-extrabold">
                                60 min
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <ErrorState
                v-if="errorMessage"
                class="m-4 md:m-5"
                title="Nie udalo sie wczytac slotow"
                :description="errorMessage"
                @retry="loadWeek"
            />

            <div
                v-else
                class="border-border relative overflow-x-auto bg-white"
                :class="props.compact ? 'border-0' : ''"
            >
                <div
                    v-if="!props.compact"
                    class="bg-muted/20 text-muted-foreground border-border flex min-w-[820px] items-center gap-2 border-b px-4 py-3 text-xs"
                    role="status"
                >
                    <Clock3 class="size-4 text-sky-700" aria-hidden="true" />
                    <span class="font-semibold">
                        Os godzin: {{ BASE_HOUR }}:00-{{ END_HOUR }}:00
                    </span>
                    <StatusBadge
                        :label="`Okien: ${totalSlots}`"
                        tone="info"
                        subtle
                    />
                    <UiBadge v-if="isLoading" variant="secondary">
                        Ladowanie
                    </UiBadge>
                    <span class="sr-only">{{ weekRangeLabel }}</span>
                </div>

                <div
                    class="relative"
                    :class="props.compact ? 'min-w-[560px]' : 'min-w-[820px]'"
                >
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
                        :aria-label="`Terminarz slotow, ${weekRangeLabel}`"
                    >
                        <div
                            class="border-border flex shrink-0 flex-col border-r bg-white"
                            :class="props.compact ? 'w-12' : 'w-14'"
                            aria-hidden="true"
                        >
                            <div
                                class="border-border flex shrink-0 items-end border-b pr-2"
                                :class="props.compact ? 'h-10' : 'h-12'"
                            />
                            <div
                                class="flex flex-col"
                                :style="{ height: `${GRID_HEIGHT_PX}px` }"
                            >
                                <div
                                    v-for="h in hourLabels"
                                    :key="h"
                                    class="text-muted-foreground flex h-[60px] items-start justify-end pt-2 pr-2 text-xs"
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
                                    class="border-border flex shrink-0 flex-col items-center justify-center border-b px-1 text-center"
                                    :class="[
                                        props.compact ? 'h-10' : 'h-12',
                                        day.isToday
                                            ? 'bg-sky-50 font-semibold text-sky-800'
                                            : 'bg-white',
                                    ]"
                                >
                                    <span
                                        class="text-foreground text-xs font-bold capitalize"
                                    >
                                        {{ day.header }}
                                    </span>
                                    <span
                                        v-if="day.isToday"
                                        class="text-[11px] font-bold text-sky-700"
                                    >
                                        dzis
                                    </span>
                                </div>

                                <div
                                    class="border-border relative border-b bg-white"
                                    :style="{ height: `${GRID_HEIGHT_PX}px` }"
                                >
                                    <div
                                        class="pointer-events-none absolute inset-0 flex flex-col"
                                        aria-hidden="true"
                                    >
                                        <div
                                            v-for="n in 12"
                                            :key="n"
                                            class="border-border/60 h-[60px] border-b"
                                        />
                                    </div>

                                    <template
                                        v-for="slot in slotsForDate(
                                            day.dateStr,
                                        )"
                                        :key="`${slot.date}-${slot.startTime}`"
                                    >
                                        <div
                                            class="absolute right-1.5 left-1.5 overflow-hidden rounded-lg border border-sky-400 bg-sky-50 px-2 py-1 text-xs leading-tight text-sky-950 shadow-sm shadow-sky-100 transition-colors hover:bg-sky-100"
                                            :style="{
                                                top: `${slotTopPx(slot.startTime)}px`,
                                                height: '48px',
                                            }"
                                            :title="`${slot.startTime} - ${slot.endTime}`"
                                            role="group"
                                            :aria-label="`Wolny slot ${slot.startTime} do ${slot.endTime}`"
                                        >
                                            <span class="block font-extrabold">
                                                Dostepny
                                            </span>
                                            <span class="block truncate">
                                                {{ slot.startTime }}-{{
                                                    slot.endTime
                                                }}
                                            </span>
                                        </div>
                                    </template>

                                    <div
                                        v-if="
                                            slotsForDate(day.dateStr).length ===
                                                0 && !isLoading
                                        "
                                        class="text-muted-foreground absolute inset-0 flex items-center justify-center p-2 text-center text-xs"
                                    >
                                        Brak slotow
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div
                        v-if="busiestDay"
                        class="pointer-events-none absolute right-4 bottom-4"
                    >
                        <StatusBadge
                            :label="`Najwiecej dostepnosci: ${busiestDay.label}`"
                            tone="success"
                            subtle
                        />
                    </div>
                </div>
            </div>
        </UiCardContent>
    </UiCard>
</template>
