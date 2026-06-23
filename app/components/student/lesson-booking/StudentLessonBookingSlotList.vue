<script setup lang="ts">
import { Clock, UserRound } from 'lucide-vue-next';
import type { SchoolAvailabilitySlot } from '~/types/schoolAvailabilitySlots';

const props = defineProps<{
    slots: SchoolAvailabilitySlot[];
    isLoading: boolean;
    errorMessage: string | null;
    selectedCourseId: string;
    bookingSlotKey: string | null;
    weekStartDate: string;
}>();

const emit = defineEmits<{
    book: [slot: SchoolAvailabilitySlot];
}>();

interface SlotGroup {
    date: string;
    label: string;
    shortLabel: string;
    isToday: boolean;
    slots: SchoolAvailabilitySlot[];
}

interface ScheduleCell {
    key: string;
    date: string;
    hour: number;
    slots: SchoolAvailabilitySlot[];
}

interface ScheduleRow {
    hour: number;
    label: string;
    cells: ScheduleCell[];
}

function formatDateLabel(date: string): string {
    const d = new Date(`${date}T00:00:00`);

    if (Number.isNaN(d.getTime())) {
        return date;
    }

    return new Intl.DateTimeFormat('pl-PL', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
    }).format(d);
}

function formatShortDayLabel(date: string): string {
    const d = new Date(`${date}T00:00:00`);

    if (Number.isNaN(d.getTime())) {
        return date;
    }

    return new Intl.DateTimeFormat('pl-PL', {
        weekday: 'short',
        day: '2-digit',
        month: '2-digit',
    }).format(d);
}

function addDays(date: string, offset: number): string {
    const d = new Date(`${date}T00:00:00`);

    if (Number.isNaN(d.getTime())) {
        return date;
    }

    d.setDate(d.getDate() + offset);

    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');

    return `${y}-${m}-${day}`;
}

function hourFromTime(value: string): number | null {
    const match = /^(\d{2}):(\d{2})$/.exec(value.trim());

    if (!match) {
        return null;
    }

    const hour = Number(match[1]);

    return Number.isFinite(hour) ? hour : null;
}

function instructorName(slot: SchoolAvailabilitySlot): string {
    return `${slot.instructorFirstName} ${slot.instructorLastName}`.trim();
}

function slotKey(slot: SchoolAvailabilitySlot): string {
    return `${slot.date}|${slot.startTime}|${slot.endTime}|${slot.instructorId}`;
}

const groups = computed<SlotGroup[]>(() => {
    const byDate = new Map<string, SchoolAvailabilitySlot[]>();

    for (const slot of props.slots) {
        const list = byDate.get(slot.date) ?? [];

        list.push(slot);
        byDate.set(slot.date, list);
    }

    return weekDays.value.map((day) => {
        const slots = byDate.get(day) ?? [];

        return {
            date: day,
            label: formatDateLabel(day),
            shortLabel: formatShortDayLabel(day),
            isToday: day === todayIso.value,
            slots: [...slots].sort((a, b) => {
                const byTime = a.startTime.localeCompare(b.startTime);

                if (byTime !== 0) {
                    return byTime;
                }

                return instructorName(a).localeCompare(instructorName(b));
            }),
        };
    });
});

const nonEmptyGroups = computed(() =>
    groups.value.filter((group) => group.slots.length > 0),
);

const todayIso = computed(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');

    return `${y}-${m}-${day}`;
});

const weekDays = computed(() =>
    Array.from({ length: 7 }, (_value, index) =>
        addDays(props.weekStartDate, index),
    ),
);

const scheduleStartHour = computed(() => {
    const starts = props.slots
        .map((slot) => hourFromTime(slot.startTime))
        .filter((hour): hour is number => hour !== null);

    return Math.min(7, ...starts);
});

const scheduleEndHour = computed(() => {
    const ends = props.slots
        .map((slot) => hourFromTime(slot.endTime))
        .filter((hour): hour is number => hour !== null);

    return Math.max(18, ...ends);
});

const scheduleGridColumns = computed(
    () => `64px repeat(${weekDays.value.length}, minmax(82px, 1fr))`,
);

const scheduleRows = computed<ScheduleRow[]>(() => {
    const rows: ScheduleRow[] = [];

    for (
        let hour = scheduleStartHour.value;
        hour <= scheduleEndHour.value;
        hour += 1
    ) {
        rows.push({
            hour,
            label: `${String(hour).padStart(2, '0')}:00`,
            cells: weekDays.value.map((date) => ({
                key: `${date}-${hour}`,
                date,
                hour,
                slots: props.slots
                    .filter(
                        (slot) =>
                            slot.date === date &&
                            hourFromTime(slot.startTime) === hour,
                    )
                    .sort((a, b) => {
                        const byTime = a.startTime.localeCompare(b.startTime);

                        if (byTime !== 0) {
                            return byTime;
                        }

                        return instructorName(a).localeCompare(
                            instructorName(b),
                        );
                    }),
            })),
        });
    }

    return rows;
});

const bestDayLabel = computed(() => {
    const best = groups.value
        .filter((group) => group.slots.length > 0)
        .sort((a, b) => b.slots.length - a.slots.length)[0];

    if (!best) {
        return '';
    }

    return `Najwięcej dostępności: ${best.label}`;
});
</script>

<template>
    <section class="space-y-4">
        <p v-if="!selectedCourseId" class="text-muted-foreground text-sm">
            Wybierz kurs, żeby zobaczyć dostępne terminy.
        </p>

        <ErrorState
            v-else-if="errorMessage"
            title="Nie udało się wczytać terminów"
            :description="errorMessage"
        />

        <div v-else-if="isLoading" class="space-y-3" role="status">
            <UiSkeleton class="h-16 rounded-xl" />
            <UiSkeleton class="h-16 rounded-xl" />
            <UiSkeleton class="h-16 rounded-xl" />
        </div>

        <EmptyState
            v-else-if="slots.length === 0"
            title="Brak wolnych terminów"
            description="W tym tygodniu nie ma dostępnych slotów dla wybranego kursu."
        />

        <div v-else class="space-y-3">
            <div class="hidden overflow-hidden rounded-2xl border md:block">
                <div class="overflow-x-auto">
                    <div class="min-w-[700px]">
                        <div
                            class="bg-muted/40 border-border grid border-b"
                            :style="{
                                gridTemplateColumns: scheduleGridColumns,
                            }"
                        >
                            <div
                                class="text-muted-foreground flex h-16 items-end px-3 pb-3 text-xs font-semibold"
                            >
                                Godz.
                            </div>
                            <div
                                v-for="group in groups"
                                :key="group.date"
                                class="border-border flex flex-col items-center justify-center border-l px-2 py-3 text-center"
                                :class="
                                    group.isToday
                                        ? 'bg-sky-50 text-sky-900'
                                        : ''
                                "
                            >
                                <p class="text-xs font-extrabold capitalize">
                                    {{ group.shortLabel }}
                                </p>
                                <p
                                    v-if="group.isToday"
                                    class="text-xs font-semibold text-sky-700"
                                >
                                    dziś
                                </p>
                            </div>
                        </div>

                        <div
                            v-for="row in scheduleRows"
                            :key="row.hour"
                            class="border-border grid min-h-24 border-b last:border-b-0"
                            :style="{
                                gridTemplateColumns: scheduleGridColumns,
                            }"
                        >
                            <div
                                class="text-muted-foreground flex items-start justify-end px-3 py-3 text-xs font-semibold"
                            >
                                {{ row.label }}
                            </div>
                            <div
                                v-for="cell in row.cells"
                                :key="cell.key"
                                class="border-border min-h-24 space-y-2 border-l p-2"
                            >
                                <button
                                    v-for="slot in cell.slots"
                                    :key="slotKey(slot)"
                                    type="button"
                                    class="w-full rounded-xl border border-sky-300 bg-sky-50 p-2 text-left text-sky-950 shadow-sm transition-colors hover:bg-sky-100 disabled:cursor-not-allowed disabled:opacity-60"
                                    :disabled="
                                        bookingSlotKey !== null &&
                                        bookingSlotKey !== slotKey(slot)
                                    "
                                    @click="emit('book', slot)"
                                >
                                    <span class="block text-sm font-extrabold">
                                        {{
                                            bookingSlotKey === slotKey(slot)
                                                ? 'Rezerwowanie'
                                                : 'Dostępny'
                                        }}
                                    </span>
                                    <span
                                        class="mt-0.5 block truncate text-xs font-semibold text-sky-700"
                                    >
                                        {{ instructorName(slot) }}
                                    </span>
                                    <span class="mt-0.5 block text-xs">
                                        {{ slot.startTime }}-{{ slot.endTime }}
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="space-y-4 md:hidden">
                <div
                    v-for="group in nonEmptyGroups"
                    :key="group.date"
                    class="space-y-2"
                >
                    <h3
                        class="text-foreground text-sm font-semibold capitalize"
                    >
                        {{ group.label }}
                    </h3>

                    <article
                        v-for="slot in group.slots"
                        :key="slotKey(slot)"
                        class="border-border flex flex-col gap-3 rounded-xl border p-3"
                    >
                        <div class="min-w-0 space-y-1">
                            <div
                                class="text-foreground flex items-center gap-2 text-sm font-medium"
                            >
                                <Clock
                                    class="size-4 shrink-0"
                                    aria-hidden="true"
                                />
                                <span>
                                    {{ slot.startTime }} - {{ slot.endTime }}
                                </span>
                            </div>
                            <div
                                class="text-muted-foreground flex items-center gap-2 text-sm"
                            >
                                <UserRound
                                    class="size-4 shrink-0"
                                    aria-hidden="true"
                                />
                                <span class="truncate">
                                    {{ instructorName(slot) }}
                                </span>
                            </div>
                        </div>

                        <UiButton
                            type="button"
                            size="sm"
                            class="w-full"
                            :disabled="
                                bookingSlotKey !== null &&
                                bookingSlotKey !== slotKey(slot)
                            "
                            @click="emit('book', slot)"
                        >
                            {{
                                bookingSlotKey === slotKey(slot)
                                    ? 'Rezerwowanie'
                                    : 'Zarezerwuj'
                            }}
                        </UiButton>
                    </article>
                </div>
            </div>

            <div v-if="bestDayLabel" class="flex justify-end">
                <UiBadge
                    variant="outline"
                    class="rounded-full border-emerald-200 bg-emerald-50 px-3 py-1.5 text-emerald-700"
                >
                    {{ bestDayLabel }}
                </UiBadge>
            </div>
        </div>
    </section>
</template>
