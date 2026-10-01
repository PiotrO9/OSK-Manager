<script setup lang="ts">
import type { CalendarDate, DateValue } from '@internationalized/date';
import type { SchoolAvailabilitySlot } from '~/types/schools/schoolAvailabilitySlots';
import {
    buildManagerInstructorWeekDays,
    getManagerInstructorSlotHeightPx,
    getManagerInstructorSlotTopPx,
    getManagerInstructorVisibleHourRange,
} from '~/utils/instructors/managerInstructorWeeklyCalendar';
import {
    connectStudentLessonBookingAdjacentSlots,
    getStudentLessonBookingInstructorName,
} from '~/utils/student/studentLessonBookingPage';
import { getStudentLessonBookingSlotKey } from '~/composables/lessons/useStudentLessonBookingPage';

const props = defineProps<{
    slots: SchoolAvailabilitySlot[];
    weekStart: Date;
    isLoading: boolean;
    errorMessage: string | null;
    selectedCourseId: string;
    bookingSlotKey: string | null;
    isWeekBeyondBookingWindow: boolean;
    weekRangeCompactLabel: string;
    calendarSelected: CalendarDate[];
    calendarOpen: boolean;
    isPrevWeekDisabled: boolean;
    isNextWeekDisabled: boolean;
    calendarMin: CalendarDate;
    calendarMax: CalendarDate;
    truncatedLabel: string | null;
}>();

const emit = defineEmits<{
    retry: [];
    book: [slot: SchoolAvailabilitySlot];
    prevWeek: [];
    nextWeek: [];
    calendarUpdate: [value: DateValue | DateValue[] | undefined];
    keyDownWeekNav: [event: KeyboardEvent, direction: 'prev' | 'next'];
    'update:calendarOpen': [value: boolean];
}>();

const calendarOpenModel = computed({
    get: () => props.calendarOpen,
    set: (value: boolean) => emit('update:calendarOpen', value),
});

const weekDays = computed(() => buildManagerInstructorWeekDays(props.weekStart));

const visibleHourRange = computed(() =>
    getManagerInstructorVisibleHourRange(props.slots),
);

const baseHour = computed(() => visibleHourRange.value.baseHour);
const endHour = computed(() => visibleHourRange.value.endHour);
const gridHeightPx = computed(() => (endHour.value - baseHour.value) * 60);

const hourLabels = computed(() =>
    Array.from({ length: endHour.value - baseHour.value }, (_, index) =>
        baseHour.value + index,
    ),
);

const mobileDays = computed(() =>
    weekDays.value
        .map((day) => ({
            day,
            slots: connectStudentLessonBookingAdjacentSlots(
                props.slots.filter((slot) => slot.date === day.dateStr),
            ),
        }))
        .filter((entry) => entry.slots.length > 0),
);

function slotsForDate(dateStr: string): SchoolAvailabilitySlot[] {
    return props.slots.filter((slot) => slot.date === dateStr);
}

function slotTopPx(startTime: string): number {
    return getManagerInstructorSlotTopPx(startTime, baseHour.value);
}

function slotHeightPx(slot: SchoolAvailabilitySlot): number {
    return getManagerInstructorSlotHeightPx(slot);
}

function slotKey(slot: SchoolAvailabilitySlot): string {
    return getStudentLessonBookingSlotKey(slot);
}

function isSlotDisabled(slot: SchoolAvailabilitySlot): boolean {
    return (
        props.bookingSlotKey !== null &&
        props.bookingSlotKey !== slotKey(slot)
    );
}

function handleBook(slot: SchoolAvailabilitySlot): void {
    emit('book', slot);
}

function slotAriaLabel(slot: SchoolAvailabilitySlot): string {
    const day = weekDays.value.find((entry) => entry.dateStr === slot.date);
    const dayLabel = day?.header ?? slot.date;

    return `Zarezerwuj termin ${dayLabel}, ${slot.startTime}–${slot.endTime}, instruktor ${getStudentLessonBookingInstructorName(slot)}`;
}
</script>

<template>
    <WeekCalendarPanel
        title="Dostępne terminy"
        description="Wybierz termin i potwierdź rezerwację jazdy."
        heading-id="student-booking-week-heading"
    >
        <WeekCalendarToolbar
            v-model:calendar-open="calendarOpenModel"
            :is-loading="isLoading"
            :compact-week-range-label="weekRangeCompactLabel"
            :calendar-selected-model="calendarSelected"
            :min-value="calendarMin"
            :max-value="calendarMax"
            compact
            :previous-disabled="isPrevWeekDisabled"
            :next-disabled="isNextWeekDisabled"
            aria-label="Nawigacja tygodnia rezerwacji jazdy"
            @previous="emit('prevWeek')"
            @next="emit('nextWeek')"
            @previous-keydown="emit('keyDownWeekNav', $event, 'prev')"
            @next-keydown="emit('keyDownWeekNav', $event, 'next')"
            @calendar-update="emit('calendarUpdate', $event)"
        />

        <p v-if="!selectedCourseId" class="text-muted-foreground px-2 text-sm">
            Wybierz kurs, aby zobaczyć wolne terminy w wybranym tygodniu.
        </p>

        <ErrorState
            v-else-if="errorMessage"
            class="mx-2"
            title="Nie udało się wczytać terminów"
            :description="errorMessage"
            @retry="emit('retry')"
        />

        <div
            v-else-if="isWeekBeyondBookingWindow"
            class="border-border bg-muted/20 mx-2 rounded-xl border px-4 py-8 text-center"
            role="status"
        >
            <p class="text-foreground text-sm font-semibold">
                Ten tydzień jest poza oknem rezerwacji
            </p>
            <p class="text-muted-foreground mt-1 text-xs">
                Wybierz wcześniejszy tydzień lub wróć do bieżącego.
            </p>
        </div>

        <template v-else-if="selectedCourseId">
            <p
                v-if="truncatedLabel"
                class="text-muted-foreground mx-2 text-xs leading-relaxed"
                role="status"
            >
                {{ truncatedLabel }}
            </p>

            <div class="sr-only" role="status">
                Oś godzin: {{ baseHour }}:00–{{ endHour }}:00. Wolnych terminów:
                {{ slots.length }}.
            </div>

            <div class="space-y-4 px-2 pb-2 sm:hidden">
                <div
                    v-if="isLoading"
                    class="space-y-3"
                    role="status"
                    aria-live="polite"
                >
                    <span class="sr-only">Ładowanie wolnych terminów</span>
                    <UiSkeleton class="h-6 w-32" />
                    <UiSkeleton class="h-14 w-full" />
                    <UiSkeleton class="h-14 w-full" />
                </div>

                <div
                    v-else-if="mobileDays.length === 0"
                    class="border-border bg-muted/20 rounded-xl border px-4 py-8 text-center"
                    role="status"
                >
                    <p class="text-foreground text-sm font-semibold">
                        Brak wolnych terminów w tym tygodniu
                    </p>
                    <p class="text-muted-foreground mt-1 text-xs">
                        Sprawdź kolejny tydzień lub wybierz inny kurs.
                    </p>
                    <UiButton
                        type="button"
                        variant="outline"
                        size="sm"
                        class="mt-4"
                        :disabled="isNextWeekDisabled"
                        @click="emit('nextWeek')"
                    >
                        Następny tydzień
                    </UiButton>
                </div>

                <section
                    v-for="entry in mobileDays"
                    v-else
                    :key="entry.day.dateStr"
                    class="space-y-2"
                    :aria-label="entry.day.header"
                >
                    <h3
                        class="text-foreground text-sm font-semibold capitalize"
                    >
                        {{ entry.day.header }}
                        <span
                            v-if="entry.day.isToday"
                            class="text-primary ml-1"
                        >
                            · dziś
                        </span>
                    </h3>

                    <div class="flex flex-col gap-2">
                        <article
                            v-for="connected in entry.slots"
                            :key="slotKey(connected.slot as SchoolAvailabilitySlot)"
                            class="border-border bg-card flex items-center justify-between gap-3 rounded-xl border px-3 py-2.5"
                        >
                            <div class="min-w-0">
                                <p
                                    class="text-foreground text-sm font-semibold tabular-nums"
                                >
                                    {{ connected.slot.startTime }}–{{
                                        connected.slot.endTime
                                    }}
                                </p>
                                <p class="text-muted-foreground truncate text-xs">
                                    {{
                                        getStudentLessonBookingInstructorName(
                                            connected.slot as SchoolAvailabilitySlot,
                                        )
                                    }}
                                </p>
                            </div>
                            <UiButton
                                type="button"
                                size="sm"
                                :disabled="
                                    isSlotDisabled(
                                        connected.slot as SchoolAvailabilitySlot,
                                    )
                                "
                                :aria-busy="
                                    bookingSlotKey ===
                                    slotKey(
                                        connected.slot as SchoolAvailabilitySlot,
                                    )
                                "
                                :aria-label="
                                    slotAriaLabel(
                                        connected.slot as SchoolAvailabilitySlot,
                                    )
                                "
                                @click="
                                    handleBook(
                                        connected.slot as SchoolAvailabilitySlot,
                                    )
                                "
                            >
                                {{
                                    bookingSlotKey ===
                                    slotKey(
                                        connected.slot as SchoolAvailabilitySlot,
                                    )
                                        ? 'Rezerwowanie…'
                                        : 'Rezerwuj'
                                }}
                            </UiButton>
                        </article>
                    </div>
                </section>
            </div>

            <div
                class="border-border bg-card relative hidden overflow-x-auto rounded-xl border sm:mx-2 sm:block"
            >
                <div class="relative min-w-[560px]">
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
                        :aria-label="`Terminarz wolnych terminów, ${weekRangeCompactLabel}`"
                    >
                        <WeekCalendarHourGutter
                            :hour-labels="hourLabels"
                            :grid-height-px="gridHeightPx"
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
                                />

                                <div
                                    class="border-border bg-card relative border-b"
                                    :style="{ height: `${gridHeightPx}px` }"
                                >
                                    <div
                                        class="pointer-events-none absolute inset-0 flex flex-col"
                                        aria-hidden="true"
                                    >
                                        <div
                                            v-for="hour in hourLabels"
                                            :key="hour"
                                            class="border-border/50 h-[60px] border-b border-dashed"
                                        />
                                    </div>

                                    <button
                                        v-for="slot in slotsForDate(day.dateStr)"
                                        :key="slotKey(slot)"
                                        type="button"
                                        class="student-booking-slot-block focus-visible:ring-ring absolute inset-x-1.5 box-border cursor-pointer rounded-lg border border-primary/30 bg-primary/10 px-2 py-1 text-left text-xs leading-tight text-foreground shadow-sm transition-colors hover:bg-primary/15 hover:shadow-lg focus-visible:shadow-lg focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60"
                                        :style="{
                                            top: `${slotTopPx(slot.startTime)}px`,
                                            '--student-booking-slot-height': `${slotHeightPx(slot)}px`,
                                        }"
                                        :disabled="isSlotDisabled(slot)"
                                        :aria-busy="bookingSlotKey === slotKey(slot)"
                                        :aria-label="slotAriaLabel(slot)"
                                        @click="handleBook(slot)"
                                    >
                                        <span class="block font-semibold">
                                            {{
                                                bookingSlotKey === slotKey(slot)
                                                    ? 'Rezerwowanie…'
                                                    : 'Wolny termin'
                                            }}
                                        </span>
                                        <span class="block truncate">
                                            {{
                                                getStudentLessonBookingInstructorName(
                                                    slot,
                                                )
                                            }}
                                        </span>
                                        <span
                                            class="block truncate tabular-nums opacity-90"
                                        >
                                            {{ slot.startTime }}–{{ slot.endTime }}
                                        </span>
                                    </button>

                                    <div
                                        v-if="
                                            slotsForDate(day.dateStr).length ===
                                                0 && !isLoading
                                        "
                                        class="text-muted-foreground absolute inset-0 flex items-center justify-center p-2 text-center text-xs"
                                    >
                                        Brak terminów
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div
                v-if="!isLoading && slots.length === 0"
                class="border-border bg-muted/20 mx-2 hidden rounded-xl border px-4 py-8 text-center sm:block"
                role="status"
            >
                <p class="text-foreground text-sm font-semibold">
                    Brak wolnych terminów w tym tygodniu
                </p>
                <p class="text-muted-foreground mt-1 text-xs">
                    Sprawdź kolejny tydzień lub wybierz inny kurs.
                </p>
                <UiButton
                    type="button"
                    variant="outline"
                    size="sm"
                    class="mt-4"
                    :disabled="isNextWeekDisabled"
                    @click="emit('nextWeek')"
                >
                    Następny tydzień
                </UiButton>
            </div>
        </template>
    </WeekCalendarPanel>
</template>

<style scoped>
.student-booking-slot-block {
    height: var(--student-booking-slot-height);
    min-height: var(--student-booking-slot-height);
}

.student-booking-slot-block:hover,
.student-booking-slot-block:focus-visible {
    z-index: 30;
    height: auto;
    min-height: var(--student-booking-slot-height);
}

.student-booking-slot-block:hover .truncate,
.student-booking-slot-block:focus-visible .truncate {
    text-overflow: clip;
    white-space: normal;
    overflow-wrap: anywhere;
}
</style>
