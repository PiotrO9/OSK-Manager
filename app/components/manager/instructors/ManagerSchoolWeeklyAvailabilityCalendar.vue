<script setup lang="ts">
import { ChevronLeft, ChevronRight } from 'lucide-vue-next';

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
    slotTopPx,
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
</script>

<template>
    <div class="space-y-0">
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
                    @click="handlePrevWeek"
                    @keydown="handleKeyDownWeekNav($event, 'prev')"
                >
                    <ChevronLeft class="size-4" aria-hidden="true" />
                    Poprzedni
                </button>
                <button
                    type="button"
                    class="text-foreground hover:bg-muted/60 focus-visible:ring-ring inline-flex h-9 items-center gap-1 px-3 text-xs font-semibold transition focus-visible:ring-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
                    aria-label="Następny tydzień"
                    :disabled="isLoading"
                    @click="handleNextWeek"
                    @keydown="handleKeyDownWeekNav($event, 'next')"
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

            <UiPopover v-model:open="isCalendarOpen">
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
                        :min-value="WEEK_PICKER_CALENDAR_MIN"
                        :max-value="WEEK_PICKER_CALENDAR_MAX"
                        :disable-days-outside-current-view="false"
                        :model-value="calendarSelected"
                        locale="pl-PL"
                        @update:model-value="handleCalendarUpdate"
                    />
                </UiPopoverContent>
            </UiPopover>
        </div>

        <p
            v-if="errorMessage"
            class="text-destructive px-4 pb-3 text-sm md:px-5"
            role="alert"
            aria-live="polite"
        >
            {{ errorMessage }}
        </p>

        <div
            class="border-border relative overflow-x-auto border-t bg-white dark:bg-transparent"
        >
            <div
                class="bg-muted/30 text-muted-foreground border-border flex min-w-[720px] flex-wrap items-center gap-2 border-b px-4 py-2 text-xs font-medium md:px-5"
                role="status"
            >
                <span>Oś godzin: {{ BASE_HOUR }}:00-{{ END_HOUR }}:00</span>
                <UiBadge v-if="isLoading" variant="secondary"
                    >Ładowanie…</UiBadge
                >
                <UiBadge v-else-if="!errorMessage" variant="outline">
                    Okien: {{ aggregatedSlotsFlat.length }}
                </UiBadge>
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
                    :aria-label="`Terminarz dostępności instruktorów, ${weekRangeLabel}`"
                >
                    <div
                        class="border-border bg-muted/20 flex w-14 shrink-0 flex-col border-r"
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
                                        ? 'bg-primary-50 text-primary-900 font-semibold'
                                        : 'bg-white dark:bg-transparent'
                                "
                            >
                                <span
                                    class="text-foreground text-xs font-semibold capitalize"
                                >
                                    {{ day.header }}
                                </span>
                                <UiBadge
                                    v-if="day.isToday"
                                    variant="secondary"
                                    class="mt-1 h-4 px-1.5 text-[10px]"
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
                                    v-for="slot in aggregatedSlotsForDate(
                                        day.dateStr,
                                    )"
                                    :key="`${slot.date}-${slot.startTime}-${slot.endTime}`"
                                >
                                    <button
                                        type="button"
                                        class="border-primary bg-primary-50/90 text-primary-800 hover:bg-primary-100 focus-visible:ring-ring absolute right-1 left-1 overflow-hidden rounded-lg border border-l-4 px-2 py-1 text-left text-xs leading-tight shadow-sm transition focus-visible:ring-2 focus-visible:outline-none"
                                        :style="{
                                            top: `${slotTopPx(slot.startTime)}px`,
                                            height: '52px',
                                        }"
                                        :title="`Dostępny slot ${slot.startTime}-${slot.endTime} (${slot.instructorCount} instr.)`"
                                        :aria-label="`Wybierz akcję w slocie ${slot.startTime}-${slot.endTime}, instruktorów: ${slot.instructorCount}`"
                                        :disabled="isLoading"
                                        @click="handleSlotClick(slot)"
                                    >
                                        <span class="block font-semibold">
                                            Dostępny
                                        </span>
                                        <span
                                            v-if="slot.instructorCount > 1"
                                            class="text-primary-700 block truncate text-[10px]"
                                        >
                                            {{ slot.instructorCount }}
                                            instruktorów
                                        </span>
                                        <span
                                            class="text-primary-700/80 block truncate text-[10px]"
                                        >
                                            {{ slot.startTime }}-{{
                                                slot.endTime
                                            }}
                                        </span>
                                    </button>
                                </template>

                                <div
                                    v-if="
                                        aggregatedSlotsForDate(day.dateStr)
                                            .length === 0 &&
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
            @created="handleTheoryEventCreated"
        />

        <ManagerLessonBookingDialog
            v-model:open="isBookingOpen"
            :slot-ctx="activeSlotCtx"
            :school-courses="courses"
            @booked="handleBookingBooked"
        />

        <ManagerEventStudentPickerDialog
            v-model:open="isStudentPickerOpen"
            :event-id="eventForPicker?.id ?? ''"
            :capacity="eventForPicker?.capacity ?? null"
            :school-id="schoolId"
        />
    </div>
</template>
