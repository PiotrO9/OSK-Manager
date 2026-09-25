<script setup lang="ts">
import type { AvailabilitySlot } from '~/types/instructors/instructorSlots';
import {
    connectManagerInstructorAdjacentSlots,
    groupManagerInstructorSlotRuns,
} from '~/utils/instructors/managerInstructorWeeklyCalendar';

const props = withDefaults(
    defineProps<{
        instructorId: string;
        compact?: boolean;
        refreshKey?: number;
        showCompactHeader?: boolean;
        bookable?: boolean;
    }>(),
    {
        compact: false,
        refreshKey: 0,
        showCompactHeader: false,
        bookable: false,
    },
);

const emit = defineEmits<{
    selectSlot: [slot: AvailabilitySlot];
}>();

const {
    BASE_HOUR,
    END_HOUR,
    GRID_HEIGHT_PX,
    WEEK_PICKER_CALENDAR_MIN,
    WEEK_PICKER_CALENDAR_MAX,
    errorMessage,
    isCalendarOpen,
    calendarSelected,
    isLoading,
    hourLabels,
    weekDays,
    weekRangeLabel,
    weekRangeCompactLabel,
    totalSlots,
    busiestDay,
    slotsForDate,
    loadWeek,
    slotTopPx,
    slotHeightPx,
    handlePrevWeek,
    handleNextWeek,
    handleCalendarUpdate,
    handleKeyDownWeekNav,
} = useManagerInstructorWeeklyCalendar(() => props.instructorId);

const displaySlotsByDate = computed(
    () =>
        new Map(
            weekDays.value.map((day) => [
                day.dateStr,
                connectManagerInstructorAdjacentSlots(
                    slotsForDate(day.dateStr),
                ).map((entry) =>
                    props.compact
                        ? { ...entry, joinsPrevious: false, joinsNext: false }
                        : entry,
                ),
            ]),
        ),
);

function displaySlotsForDate(dateStr: string) {
    return displaySlotsByDate.value.get(dateStr) ?? [];
}

function compactSlotsForDate(dateStr: string) {
    return props.compact ? displaySlotsForDate(dateStr) : [];
}

const mobileDays = computed(() =>
    weekDays.value
        .map((day) => ({ day, slots: displaySlotsForDate(day.dateStr) }))
        .filter((entry) => entry.slots.length > 0),
);

const slotRunsByDate = computed(
    () =>
        new Map(
            weekDays.value.map((day) => [
                day.dateStr,
                groupManagerInstructorSlotRuns(slotsForDate(day.dateStr)),
            ]),
        ),
);

function slotRunsForDate(dateStr: string) {
    return slotRunsByDate.value.get(dateStr) ?? [];
}

watch(
    () => props.refreshKey,
    () => {
        void loadWeek();
    },
);
</script>

<template>
    <WeekCalendarPanel
        title="Wolne sloty instruktora"
        description="Kalendarz dostępnych okien do rezerwacji jazd."
        heading-id="instructor-slots-week-heading"
        :embedded="props.compact"
        :hide-header="props.compact && !props.showCompactHeader"
    >
        <template v-if="props.compact && props.showCompactHeader" #header>
            <ManagerInstructorWeeklyCalendarHeader
                v-model:is-calendar-open="isCalendarOpen"
                :is-loading="isLoading"
                :calendar-selected="calendarSelected"
                :week-range-compact-label="weekRangeCompactLabel"
                :calendar-min="WEEK_PICKER_CALENDAR_MIN"
                :calendar-max="WEEK_PICKER_CALENDAR_MAX"
                @calendar-update="handleCalendarUpdate"
                @prev-week="handlePrevWeek"
                @next-week="handleNextWeek"
                @key-down-week-nav="handleKeyDownWeekNav"
            />
        </template>

        <WeekCalendarToolbar
            v-if="!props.compact"
            v-model:calendar-open="isCalendarOpen"
            :is-loading="isLoading"
            :compact-week-range-label="weekRangeCompactLabel"
            :calendar-selected-model="calendarSelected"
            :min-value="WEEK_PICKER_CALENDAR_MIN"
            :max-value="WEEK_PICKER_CALENDAR_MAX"
            compact
            aria-label="Nawigacja tygodnia wolnych slotów instruktora"
            @previous="handlePrevWeek"
            @next="handleNextWeek"
            @previous-keydown="handleKeyDownWeekNav($event, 'prev')"
            @next-keydown="handleKeyDownWeekNav($event, 'next')"
            @calendar-update="handleCalendarUpdate"
        />

        <div class="sr-only" role="status">
            Oś godzin: {{ BASE_HOUR }}:00–{{ END_HOUR }}:00. Okien:
            {{ totalSlots }}.
        </div>

        <ErrorState
            v-if="errorMessage"
            :class="props.compact ? 'm-4 md:m-5' : 'm-2'"
            title="Nie udało się wczytać slotów"
            :description="errorMessage"
            @retry="loadWeek"
        />

        <ManagerInstructorMobileSlotsList
            v-else-if="!props.compact"
            :days="mobileDays"
            :bookable="props.bookable"
            :is-loading="isLoading"
            @select-slot="emit('selectSlot', $event)"
        />

        <div
            v-if="!errorMessage"
            class="border-border relative overflow-x-auto"
            :class="
                props.compact
                    ? 'bg-background border-0'
                    : 'bg-card hidden rounded-2xl border sm:block'
            "
        >
            <div
                class="relative"
                :class="props.compact ? 'min-w-[680px]' : 'min-w-[560px]'"
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
                    :aria-label="`Terminarz slotów, ${weekRangeLabel}`"
                >
                    <WeekCalendarHourGutter
                        :hour-labels="hourLabels"
                        :grid-height-px="GRID_HEIGHT_PX"
                        :compact="props.compact"
                    />

                    <div class="grid min-w-0 flex-1 grid-cols-7">
                        <div
                            v-for="day in weekDays"
                            :key="day.dateStr"
                            class="border-border flex min-w-0 flex-col border-r last:border-r-0"
                        >
                            <WeekCalendarDayHeader
                                :label="day.header"
                                :is-today="day.isToday"
                                :compact="props.compact"
                            />

                            <div
                                class="border-border relative border-b"
                                :class="
                                    props.compact ? 'bg-background' : 'bg-card'
                                "
                                :style="{ height: `${GRID_HEIGHT_PX}px` }"
                            >
                                <div
                                    class="pointer-events-none absolute inset-0 flex flex-col"
                                    aria-hidden="true"
                                >
                                    <div
                                        v-for="h in hourLabels"
                                        :key="h"
                                        class="border-border/50 h-[60px] border-b border-dashed"
                                    />
                                </div>

                                <ManagerInstructorSlotRun
                                    v-for="run in props.compact
                                        ? []
                                        : slotRunsForDate(day.dateStr)"
                                    :key="`${run.date}-${run.startTime}-${run.endTime}`"
                                    :run="run"
                                    :base-hour="BASE_HOUR"
                                    :bookable="props.bookable"
                                    :is-loading="isLoading"
                                    @select-slot="emit('selectSlot', $event)"
                                />

                                <template
                                    v-for="connected in compactSlotsForDate(
                                        day.dateStr,
                                    )"
                                    :key="`${connected.slot.date}-${connected.slot.startTime}-${connected.slot.endTime}`"
                                >
                                    <button
                                        v-if="props.bookable"
                                        type="button"
                                        class="focus-visible:ring-ring absolute right-1.5 left-1.5 cursor-pointer overflow-hidden border border-sky-400 bg-sky-50 px-2 py-1 text-left text-xs leading-tight text-sky-950 transition-colors hover:bg-sky-100 focus-visible:z-10 focus-visible:ring-2 focus-visible:outline-none"
                                        :class="[
                                            connected.joinsPrevious
                                                ? 'rounded-t-none border-t-0'
                                                : 'rounded-t-lg',
                                            connected.joinsNext
                                                ? 'rounded-b-none'
                                                : 'rounded-b-lg shadow-sm shadow-sky-100',
                                        ]"
                                        :style="{
                                            top: `${slotTopPx(connected.slot.startTime)}px`,
                                            height: `${slotHeightPx(connected.slot)}px`,
                                        }"
                                        :title="`Zarezerwuj jazdę ${connected.slot.startTime}-${connected.slot.endTime}`"
                                        :aria-label="`Zarezerwuj jazdę ${connected.slot.date}, ${connected.slot.startTime} do ${connected.slot.endTime}`"
                                        :disabled="isLoading"
                                        @click="
                                            emit('selectSlot', connected.slot)
                                        "
                                    >
                                        <span
                                            v-if="!connected.joinsPrevious"
                                            class="block font-extrabold"
                                        >
                                            Wolny
                                        </span>
                                        <span class="block truncate">
                                            {{ connected.slot.startTime }}-{{
                                                connected.slot.endTime
                                            }}
                                        </span>
                                    </button>
                                    <div
                                        v-else
                                        class="absolute right-1.5 left-1.5 overflow-hidden border border-sky-400 bg-sky-50 px-2 py-1 text-xs leading-tight text-sky-950 shadow-sky-100 transition-colors hover:bg-sky-100"
                                        :class="[
                                            connected.joinsPrevious
                                                ? 'rounded-t-none border-t-0'
                                                : 'rounded-t-lg',
                                            connected.joinsNext
                                                ? 'rounded-b-none'
                                                : 'rounded-b-lg shadow-sm',
                                        ]"
                                        :style="{
                                            top: `${slotTopPx(connected.slot.startTime)}px`,
                                            height: `${slotHeightPx(connected.slot)}px`,
                                        }"
                                        :title="`${connected.slot.startTime} - ${connected.slot.endTime}`"
                                        role="group"
                                        :aria-label="`Wolny slot ${connected.slot.startTime} do ${connected.slot.endTime}`"
                                    >
                                        <span
                                            v-if="!connected.joinsPrevious"
                                            class="block font-extrabold"
                                        >
                                            Wolny
                                        </span>
                                        <span class="block truncate">
                                            {{ connected.slot.startTime }}-{{
                                                connected.slot.endTime
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
                                    Brak wolnych terminów
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div
                    v-if="busiestDay && props.compact"
                    class="pointer-events-none absolute right-4 bottom-4"
                >
                    <StatusBadge
                        :label="`Najwięcej dostępności: ${busiestDay.label}`"
                        tone="success"
                        subtle
                    />
                </div>
            </div>
        </div>
    </WeekCalendarPanel>
</template>
