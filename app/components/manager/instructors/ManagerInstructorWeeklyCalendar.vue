<script setup lang="ts">
import {
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    Clock3,
    SlidersHorizontal,
} from 'lucide-vue-next';

const props = withDefaults(
    defineProps<{
        instructorId: string;
        compact?: boolean;
    }>(),
    {
        compact: false,
    },
);

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
    earliestSlotLabel,
    busiestDay,
    slotsForDate,
    loadWeek,
    slotTopPx,
    handlePrevWeek,
    handleNextWeek,
    handleCalendarUpdate,
    handleKeyDownWeekNav,
} = useManagerInstructorWeeklyCalendar(() => props.instructorId);
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
                        Kalendarz dostępnych okien do rezerwacji jazd.
                    </UiCardDescription>
                </div>
            </div>

            <div
                class="flex min-w-0 flex-wrap items-center gap-2"
                role="toolbar"
                aria-label="Nawigacja tygodnia kalendarza slotów"
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
                title="Nie udało się wczytać slotów"
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
                        :aria-label="`Terminarz slotów, ${weekRangeLabel}`"
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
                                                Dostępny
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
                                        Brak slotów
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
                            :label="`Najwięcej dostępności: ${busiestDay.label}`"
                            tone="success"
                            subtle
                        />
                    </div>
                </div>
            </div>
        </UiCardContent>
    </UiCard>
</template>
