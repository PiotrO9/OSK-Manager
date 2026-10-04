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
    getStudentLessonBookingSlotDurationHours,
    getStudentLessonBookingInstructorName,
    positionStudentLessonBookingOverlappingSlots,
    type StudentLessonBookingPositionedSlot,
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
    availableSlotsLabel: string;
    remainingCourseHours: number | null;
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

const weekDays = computed(() =>
    buildManagerInstructorWeekDays(props.weekStart),
);

const visibleHourRange = computed(() =>
    getManagerInstructorVisibleHourRange(props.slots),
);

const baseHour = computed(() => visibleHourRange.value.baseHour);
const endHour = computed(() => visibleHourRange.value.endHour);
const gridHeightPx = computed(() => (endHour.value - baseHour.value) * 60);

const hourLabels = computed(() =>
    Array.from(
        { length: endHour.value - baseHour.value },
        (_, index) => baseHour.value + index,
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

const selectedMobileDate = shallowRef('');

const selectedMobileDay = computed(
    () =>
        mobileDays.value.find(
            (entry) => entry.day.dateStr === selectedMobileDate.value,
        ) ?? mobileDays.value[0],
);

const positionedSlotsByDate = computed(() => {
    const result = new Map<string, StudentLessonBookingPositionedSlot[]>();

    for (const day of weekDays.value) {
        result.set(
            day.dateStr,
            positionStudentLessonBookingOverlappingSlots(
                props.slots.filter((slot) => slot.date === day.dateStr),
            ),
        );
    }

    return result;
});

function slotsForDate(dateStr: string): SchoolAvailabilitySlot[] {
    return props.slots.filter((slot) => slot.date === dateStr);
}

function positionedSlotsForDate(
    dateStr: string,
): StudentLessonBookingPositionedSlot[] {
    return positionedSlotsByDate.value.get(dateStr) ?? [];
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

function isSlotHoursInsufficient(slot: SchoolAvailabilitySlot): boolean {
    if (props.remainingCourseHours === null) {
        return false;
    }

    return (
        getStudentLessonBookingSlotDurationHours(slot) >
        props.remainingCourseHours
    );
}

function isSlotDisabled(slot: SchoolAvailabilitySlot): boolean {
    return (
        isSlotHoursInsufficient(slot) ||
        (props.bookingSlotKey !== null &&
            props.bookingSlotKey !== slotKey(slot))
    );
}

function positionedSlotStyle(item: StudentLessonBookingPositionedSlot) {
    const laneWidth = 100 / item.laneCount;

    return {
        top: `${slotTopPx(item.slot.startTime)}px`,
        left: `calc(${item.laneIndex * laneWidth}% + 0.375rem)`,
        width: `calc(${laneWidth}% - 0.75rem)`,
        '--student-booking-slot-height': `${slotHeightPx(item.slot)}px`,
    };
}

function handleBook(slot: SchoolAvailabilitySlot): void {
    emit('book', slot);
}

function slotAriaLabel(slot: SchoolAvailabilitySlot): string {
    const day = weekDays.value.find((entry) => entry.dateStr === slot.date);
    const dayLabel = day?.header ?? slot.date;

    const description = `termin ${dayLabel}, ${slot.startTime}–${slot.endTime}, instruktor ${getStudentLessonBookingInstructorName(slot)}`;

    return isSlotHoursInsufficient(slot)
        ? `${description}. Brak wystarczającej liczby godzin na kursie.`
        : `Zarezerwuj ${description}`;
}

watch(
    mobileDays,
    (days) => {
        if (
            !days.some(
                (entry) => entry.day.dateStr === selectedMobileDate.value,
            )
        ) {
            selectedMobileDate.value = days[0]?.day.dateStr ?? '';
        }
    },
    { immediate: true },
);
</script>

<template>
    <WeekCalendarPanel
        title="Dostępne terminy"
        description="Wybierz termin i potwierdź rezerwację jazdy."
        heading-id="student-booking-week-heading"
    >
        <template #actions>
            <UiBadge variant="outline" class="rounded-md px-2.5 py-1">
                {{ availableSlotsLabel }}
            </UiBadge>
        </template>

        <div class="bg-card sticky top-0 z-20 rounded-lg py-0.5 sm:static">
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
        </div>

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

            <div
                v-if="isLoading"
                class="space-y-3 px-2 pb-2"
                role="status"
                aria-live="polite"
            >
                <span class="sr-only">Ładowanie wolnych terminów</span>
                <UiSkeleton class="h-9 w-full" />
                <UiSkeleton class="h-20 w-full" />
                <UiSkeleton class="h-20 w-full" />
            </div>

            <div
                v-else-if="slots.length === 0"
                class="border-border bg-muted/20 mx-2 rounded-xl border px-4 py-8 text-center"
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

            <template v-else>
                <div class="space-y-4 px-2 pb-2 sm:hidden">
                    <div
                        class="flex scrollbar-none gap-2 overflow-x-auto pb-1"
                        role="tablist"
                        aria-label="Dni z dostępnymi terminami"
                    >
                        <button
                            v-for="entry in mobileDays"
                            :key="entry.day.dateStr"
                            type="button"
                            role="tab"
                            class="border-border bg-background flex shrink-0 items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium"
                            :class="
                                selectedMobileDate === entry.day.dateStr
                                    ? 'border-primary bg-primary/10 text-primary'
                                    : 'text-muted-foreground'
                            "
                            :aria-selected="
                                selectedMobileDate === entry.day.dateStr
                            "
                            @click="selectedMobileDate = entry.day.dateStr"
                        >
                            <span class="capitalize">{{
                                entry.day.header
                            }}</span>
                            <span
                                class="bg-muted text-foreground rounded px-1.5 py-0.5 text-xs tabular-nums"
                            >
                                {{ entry.slots.length }}
                            </span>
                        </button>
                    </div>

                    <section
                        v-if="selectedMobileDay"
                        class="space-y-2"
                        :aria-label="selectedMobileDay.day.header"
                    >
                        <h3 class="text-foreground text-sm font-semibold">
                            <span class="capitalize">
                                {{ selectedMobileDay.day.header }}
                            </span>
                            <span
                                v-if="selectedMobileDay.day.isToday"
                                class="text-primary ml-1"
                            >
                                · dziś
                            </span>
                        </h3>

                        <div class="flex flex-col gap-2">
                            <article
                                v-for="connected in selectedMobileDay.slots"
                                :key="
                                    slotKey(
                                        connected.slot as SchoolAvailabilitySlot,
                                    )
                                "
                                class="border-border bg-card flex items-center justify-between gap-3 rounded-xl border px-3 py-2.5"
                                :class="
                                    isSlotHoursInsufficient(
                                        connected.slot as SchoolAvailabilitySlot,
                                    )
                                        ? 'bg-muted/30'
                                        : ''
                                "
                            >
                                <div class="min-w-0">
                                    <p
                                        class="text-foreground text-sm font-semibold tabular-nums"
                                    >
                                        {{ connected.slot.startTime }}–{{
                                            connected.slot.endTime
                                        }}
                                    </p>
                                    <p
                                        class="text-muted-foreground truncate text-xs"
                                    >
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
                                    :variant="
                                        isSlotHoursInsufficient(
                                            connected.slot as SchoolAvailabilitySlot,
                                        )
                                            ? 'outline'
                                            : 'default'
                                    "
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
                                            : isSlotHoursInsufficient(
                                                    connected.slot as SchoolAvailabilitySlot,
                                                )
                                              ? 'Brak godzin'
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
                    <div class="relative min-w-[900px]">
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
                                            v-for="item in positionedSlotsForDate(
                                                day.dateStr,
                                            )"
                                            :key="slotKey(item.slot)"
                                            type="button"
                                            class="student-booking-slot-block focus-visible:ring-ring absolute box-border cursor-pointer overflow-hidden rounded-lg border px-2 py-1 text-left text-xs leading-tight shadow-sm transition-[background-color,box-shadow] hover:z-30 hover:shadow-lg focus-visible:z-30 focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed"
                                            :class="
                                                isSlotHoursInsufficient(
                                                    item.slot,
                                                )
                                                    ? 'border-border bg-muted text-muted-foreground'
                                                    : 'border-primary/30 bg-primary/10 text-foreground hover:bg-primary/15'
                                            "
                                            :style="positionedSlotStyle(item)"
                                            :disabled="
                                                isSlotDisabled(item.slot)
                                            "
                                            :aria-busy="
                                                bookingSlotKey ===
                                                slotKey(item.slot)
                                            "
                                            :aria-label="
                                                slotAriaLabel(item.slot)
                                            "
                                            @click="handleBook(item.slot)"
                                        >
                                            <span
                                                class="block truncate font-semibold tabular-nums"
                                            >
                                                {{ item.slot.startTime }}–{{
                                                    item.slot.endTime
                                                }}
                                            </span>
                                            <span class="block truncate">
                                                {{
                                                    getStudentLessonBookingInstructorName(
                                                        item.slot,
                                                    )
                                                }}
                                            </span>
                                        </button>

                                        <div
                                            v-if="
                                                slotsForDate(day.dateStr)
                                                    .length === 0
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
            </template>
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
