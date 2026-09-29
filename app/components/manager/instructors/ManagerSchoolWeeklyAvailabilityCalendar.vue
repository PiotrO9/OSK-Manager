<script setup lang="ts">
import { CalendarClock, RefreshCw, UsersRound } from 'lucide-vue-next';
import type { ManagerSchoolAvailabilitySlotLayout } from '~/utils/schools/managerSchoolWeeklyAvailabilityCalendar';

const props = defineProps<{
    schoolId: string;
}>();

const {
    BASE_HOUR,
    END_HOUR,
    GRID_HEIGHT_PX,
    WEEK_PICKER_CALENDAR_MIN,
    WEEK_PICKER_CALENDAR_MAX,
    isSlotChoiceOpen,
    isBookingOpen,
    isTheoryCreateOpen,
    isStudentPickerOpen,
    eventForPicker,
    activeSlotCtx,
    courses,
    errorMessage,
    isCalendarOpen,
    calendarSelected,
    isLoading,
    hourLabels,
    weekDays,
    weekRangeLabel,
    aggregatedSlotsFlat,
    aggregatedSlotsForDate,
    mobileSlots,
    selectedMobileDate,
    selectMobileDate,
    slotLayoutsForDate,
    slotHeightPx,
    slotTopPx,
    reload,
    handleSlotClick,
    handlePickLessonFromChoice,
    handlePickTheoryFromChoice,
    handleTheoryEventCreated,
    handleBookingBooked,
    handlePrevWeek,
    handleNextWeek,
    handleCalendarUpdate,
    handleKeyDownWeekNav,
} = useManagerSchoolWeeklyAvailabilityCalendar(() => props.schoolId);

function getInstructorCountLabel(instructorCount: number): string {
    return `${instructorCount} ${
        instructorCount === 1 ? 'instruktor' : 'instruktorów'
    }`;
}

function formatMobileDayLabel(dateStr: string): string {
    const date = new Date(`${dateStr}T12:00:00`);

    if (Number.isNaN(date.getTime())) return dateStr;

    return new Intl.DateTimeFormat('pl-PL', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
    }).format(date);
}

function formatInstructorNames(
    slot: (typeof mobileSlots.value)[number],
): string {
    const names = slot.availableInstructors.map(
        (instructor) => `${instructor.firstName} ${instructor.lastName}`,
    );

    if (names.length <= 2) return names.join(', ');

    return `${names.slice(0, 2).join(', ')} +${names.length - 2}`;
}

function layoutStyle(layout: ManagerSchoolAvailabilitySlotLayout) {
    const gap = 4;
    const width = 100 / layout.laneCount;

    return {
        top: `${slotTopPx(layout.slot.startTime)}px`,
        height: `${slotHeightPx(layout.slot.startTime, layout.slot.endTime)}px`,
        left: `calc(${layout.lane * width}% + ${gap}px)`,
        width: `calc(${width}% - ${gap * 2}px)`,
    };
}

function handleBackToChoice(): void {
    isBookingOpen.value = false;
    isTheoryCreateOpen.value = false;
    isSlotChoiceOpen.value = true;
}
</script>

<template>
    <div class="space-y-0">
        <ManagerSchoolAvailabilityWeekToolbar
            v-model:open="isCalendarOpen"
            :is-loading="isLoading"
            :week-range-label="weekRangeLabel"
            :calendar-selected="calendarSelected"
            :calendar-min="WEEK_PICKER_CALENDAR_MIN"
            :calendar-max="WEEK_PICKER_CALENDAR_MAX"
            @prev-week="handlePrevWeek"
            @next-week="handleNextWeek"
            @calendar-update="handleCalendarUpdate"
            @week-nav-key-down="handleKeyDownWeekNav"
        />

        <div
            v-if="errorMessage"
            class="border-destructive/30 bg-destructive/5 mx-4 mb-4 flex flex-col gap-3 rounded-xl border p-4 text-sm md:mx-5 md:flex-row md:items-center md:justify-between"
            role="alert"
        >
            <p class="text-destructive">{{ errorMessage }}</p>
            <UiButton
                type="button"
                variant="outline"
                size="sm"
                class="min-h-11 shrink-0"
                :disabled="isLoading"
                @click="reload"
            >
                <RefreshCw class="size-4" aria-hidden="true" />
                Spróbuj ponownie
            </UiButton>
        </div>

        <div
            class="bg-muted/30 text-muted-foreground border-border flex flex-wrap items-center gap-2 border-y px-4 py-2 text-xs font-medium md:px-5"
            role="status"
            aria-live="polite"
        >
            <span class="hidden md:inline">
                Oś godzin: {{ BASE_HOUR }}:00–{{ END_HOUR }}:00
            </span>
            <UiBadge v-if="isLoading" variant="secondary">Ładowanie…</UiBadge>
            <UiBadge v-else-if="!errorMessage" variant="outline">
                Wolne terminy: {{ aggregatedSlotsFlat.length }}
            </UiBadge>
        </div>

        <div class="md:hidden">
            <div
                class="border-border grid grid-cols-7 border-b"
                role="tablist"
                aria-label="Wybierz dzień tygodnia"
            >
                <button
                    v-for="day in weekDays"
                    :key="day.dateStr"
                    type="button"
                    role="tab"
                    class="focus-visible:ring-ring relative flex min-h-14 min-w-0 flex-col items-center justify-center gap-0.5 px-0.5 text-center focus-visible:z-10 focus-visible:ring-2 focus-visible:outline-none"
                    :class="
                        selectedMobileDate === day.dateStr
                            ? 'bg-primary-50 text-primary-800'
                            : 'text-muted-foreground hover:bg-muted/50'
                    "
                    :aria-selected="selectedMobileDate === day.dateStr"
                    :aria-label="formatMobileDayLabel(day.dateStr)"
                    @click="selectMobileDate(day.dateStr)"
                >
                    <span class="text-[10px] font-semibold uppercase">
                        {{ day.header.split(',')[0] }}
                    </span>
                    <span class="text-xs font-bold tabular-nums">
                        {{ day.date.getDate() }}
                    </span>
                    <span
                        v-if="day.isToday"
                        class="bg-primary absolute bottom-1 size-1 rounded-full"
                        aria-label="Dzisiaj"
                    />
                </button>
            </div>

            <div class="p-4">
                <h3 class="text-foreground text-sm font-bold capitalize">
                    {{ formatMobileDayLabel(selectedMobileDate) }}
                </h3>

                <div
                    v-if="isLoading && mobileSlots.length === 0"
                    class="mt-3 space-y-2"
                    role="status"
                    aria-label="Wczytywanie wolnych terminów"
                >
                    <UiSkeleton class="h-20 w-full" />
                    <UiSkeleton class="h-20 w-full" />
                </div>

                <EmptyState
                    v-else-if="mobileSlots.length === 0"
                    class="mt-3"
                    title="Brak wolnych terminów"
                    description="Wybierz inny dzień lub przejdź do kolejnego tygodnia."
                />

                <ul v-else class="mt-3 space-y-2">
                    <li
                        v-for="slot in mobileSlots"
                        :key="`${slot.date}-${slot.startTime}-${slot.endTime}`"
                    >
                        <button
                            type="button"
                            class="border-border bg-background hover:border-primary/40 hover:bg-primary-50/30 focus-visible:ring-ring flex min-h-20 w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors focus-visible:ring-2 focus-visible:outline-none"
                            :disabled="isLoading"
                            @click="handleSlotClick(slot)"
                        >
                            <span
                                class="bg-primary-50 text-primary-700 flex size-11 shrink-0 items-center justify-center rounded-xl"
                            >
                                <CalendarClock
                                    class="size-5"
                                    aria-hidden="true"
                                />
                            </span>
                            <span class="min-w-0 flex-1">
                                <span
                                    class="text-foreground block font-bold tabular-nums"
                                >
                                    {{ slot.startTime }}–{{ slot.endTime }}
                                </span>
                                <span
                                    class="text-muted-foreground mt-0.5 block truncate text-sm"
                                >
                                    {{ formatInstructorNames(slot) }}
                                </span>
                            </span>
                            <span
                                class="text-primary-700 flex shrink-0 items-center gap-1 text-xs font-semibold"
                            >
                                <UsersRound
                                    class="size-3.5"
                                    aria-hidden="true"
                                />
                                {{ slot.instructorCount }}
                            </span>
                        </button>
                    </li>
                </ul>
            </div>
        </div>

        <div
            class="border-border relative hidden overflow-x-auto bg-white md:block dark:bg-transparent"
        >
            <div class="relative min-w-[720px]">
                <div
                    v-if="isLoading"
                    class="bg-background/80 absolute inset-0 z-20 flex items-center justify-center backdrop-blur-[1px]"
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
                    :aria-label="`Wolne terminy instruktorów, ${weekRangeLabel}`"
                >
                    <div
                        class="border-border bg-muted/20 flex w-14 shrink-0 flex-col border-r"
                        aria-hidden="true"
                    >
                        <div class="border-border h-12 shrink-0 border-b" />
                        <div
                            class="flex flex-col"
                            :style="{ height: `${GRID_HEIGHT_PX}px` }"
                        >
                            <div
                                v-for="hour in hourLabels"
                                :key="hour"
                                class="text-muted-foreground flex h-[60px] items-start justify-end pr-2 text-xs tabular-nums"
                            >
                                {{ String(hour).padStart(2, '0') }}:00
                            </div>
                        </div>
                    </div>

                    <div class="grid min-w-0 flex-1 grid-cols-7">
                        <div
                            v-for="day in weekDays"
                            :key="day.dateStr"
                            class="border-border flex min-w-0 flex-col border-r last:border-r-0"
                            role="gridcell"
                        >
                            <div
                                class="border-border flex h-12 shrink-0 flex-col items-center justify-center border-b px-1 text-center"
                                :class="
                                    day.isToday
                                        ? 'bg-primary-50'
                                        : 'bg-white dark:bg-transparent'
                                "
                            >
                                <span
                                    class="text-foreground text-xs font-semibold capitalize"
                                >
                                    {{ day.header }}
                                </span>
                                <span
                                    v-if="day.isToday"
                                    class="text-primary mt-0.5 text-[10px] font-bold"
                                >
                                    dzisiaj
                                </span>
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
                                        v-for="hour in hourLabels"
                                        :key="hour"
                                        class="border-border/50 h-[60px] border-b border-dashed"
                                    />
                                </div>

                                <button
                                    v-for="layout in slotLayoutsForDate(
                                        day.dateStr,
                                    )"
                                    :key="`${layout.slot.date}-${layout.slot.startTime}-${layout.slot.endTime}`"
                                    type="button"
                                    class="border-primary bg-primary-50/95 text-primary-800 hover:bg-primary-100 focus-visible:ring-ring absolute cursor-pointer overflow-hidden rounded-lg border border-l-4 px-1.5 py-1 text-left text-[10px] leading-tight shadow-sm transition-colors focus-visible:z-10 focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed"
                                    :style="layoutStyle(layout)"
                                    :aria-label="`Wybierz termin ${layout.slot.startTime}–${layout.slot.endTime}, ${getInstructorCountLabel(layout.slot.instructorCount)}`"
                                    :disabled="isLoading"
                                    @click="handleSlotClick(layout.slot)"
                                >
                                    <span class="block font-bold tabular-nums">
                                        {{ layout.slot.startTime }}–{{
                                            layout.slot.endTime
                                        }}
                                    </span>
                                    <span
                                        class="text-primary-700 mt-0.5 block truncate"
                                    >
                                        {{
                                            getInstructorCountLabel(
                                                layout.slot.instructorCount,
                                            )
                                        }}
                                    </span>
                                </button>

                                <div
                                    v-if="
                                        aggregatedSlotsForDate(day.dateStr)
                                            .length === 0 &&
                                        !isLoading &&
                                        !errorMessage
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

        <ManagerAvailabilitySlotChoiceDialog
            v-model:open="isSlotChoiceOpen"
            :slot-ctx="activeSlotCtx"
            @pick-lesson="handlePickLessonFromChoice"
            @pick-theory-block="handlePickTheoryFromChoice"
        />

        <ManagerTheoryEventCreateDialog
            v-model:open="isTheoryCreateOpen"
            :slot-ctx="activeSlotCtx"
            :school-id="schoolId"
            show-back
            @created="handleTheoryEventCreated"
            @back="handleBackToChoice"
        />

        <ManagerLessonBookingDialog
            v-model:open="isBookingOpen"
            :slot-ctx="activeSlotCtx"
            :school-courses="courses"
            show-back
            @booked="handleBookingBooked"
            @back="handleBackToChoice"
        />

        <ManagerEventStudentPickerDialog
            v-model:open="isStudentPickerOpen"
            :event-id="eventForPicker?.id ?? ''"
            :capacity="eventForPicker?.capacity ?? null"
            :school-id="schoolId"
        />
    </div>
</template>
