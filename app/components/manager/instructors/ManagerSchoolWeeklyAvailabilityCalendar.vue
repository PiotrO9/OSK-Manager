<script setup lang="ts">
import type { CalendarDate, DateValue } from '@internationalized/date';
import { ChevronLeft, ChevronRight } from 'lucide-vue-next';
import { toDate } from 'reka-ui/date';
import { useCoursesApi } from '~/composables/useCoursesApi';
import { useSchoolAvailabilitySlotsApi } from '~/composables/useSchoolAvailabilitySlotsApi';
import type { CourseListItem } from '~/types/course';
import type { SchoolAvailabilitySlotsQueryFilters } from '~/types/schoolAvailabilityFilters';
import type {
    LessonBookingAggregatedSlot,
    LessonBookingInstructorOption,
    LessonBookingSlotContext,
} from '~/types/lessonBooking';
import type { SchoolAvailabilitySlot } from '~/types/schoolAvailabilitySlots';
import { getApiFetchErrorMessage } from '~/utils/apiFetchErrorMessage';
import {
    formatDateOnly,
    getMonday,
    WEEK_PICKER_CALENDAR_MAX,
    WEEK_PICKER_CALENDAR_MIN,
    weekCalendarDatesFromMonday,
    weekRangeFromMonday,
} from '~/utils/weeklyCalendarDates';

const props = defineProps<{
    schoolId: string;
}>();

const { addToast } = useAppToast();

const isSlotChoiceOpen = ref(false);
const isBookingOpen = ref(false);
const isTheoryCreateOpen = ref(false);
const isStudentPickerOpen = ref(false);
const eventForPicker = ref<{ id: string; capacity: number | null } | null>(
    null,
);
const activeSlotCtx = ref<LessonBookingSlotContext | null>(null);

const courses = ref<CourseListItem[]>([]);

const { fetchList: fetchCoursesList } = useCoursesApi();

async function loadSchoolCourses(): Promise<void> {
    const sid = props.schoolId.trim();

    if (!sid) {
        courses.value = [];

        return;
    }

    courses.value = await fetchCoursesList(sid).catch(() => []);
}

function buildFiltersPayload(): SchoolAvailabilitySlotsQueryFilters {
    return {
        limit: 500,
        sort: 'startTime',
    };
}

/** Oś czasu: 7:00–19:00 (12 h × 60 px). */
const BASE_HOUR = 7;
const END_HOUR = 19;
const GRID_HEIGHT_PX = (END_HOUR - BASE_HOUR) * 60;
const PX_PER_MINUTE = 1;

function timeToMinutes(time: string): number | null {
    const parts = time.trim().split(':').map(Number);

    if (parts.length < 2) {
        return null;
    }

    const h = parts[0];
    const m = parts[1];

    if (
        h === undefined ||
        m === undefined ||
        !Number.isFinite(h) ||
        !Number.isFinite(m)
    ) {
        return null;
    }

    return h * 60 + m;
}

function isSlotInsideTimeline(slot: LessonBookingAggregatedSlot): boolean {
    const startMin = timeToMinutes(slot.startTime);
    const endMin = timeToMinutes(slot.endTime);
    const baseMin = BASE_HOUR * 60;
    const endBoundaryMin = END_HOUR * 60;

    if (startMin === null || endMin === null) {
        return false;
    }

    return startMin >= baseMin && endMin <= endBoundaryMin && endMin > startMin;
}

function slotTopPx(startTime: string): number {
    const startMin = timeToMinutes(startTime);

    if (startMin === null) {
        return 0;
    }

    const baseMin = BASE_HOUR * 60;

    return (startMin - baseMin) * PX_PER_MINUTE;
}

const weekStart = ref<Date>(getMonday(new Date()));
const slots = ref<SchoolAvailabilitySlot[]>([]);
const errorMessage = ref<string | null>(null);
const isCalendarOpen = ref(false);

const calendarSelected = ref<CalendarDate[]>(
    weekCalendarDatesFromMonday(getMonday(new Date())),
);

const { fetchSlots, isLoading } = useSchoolAvailabilitySlotsApi();

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

function buildAggregatedSlots(
    raw: readonly SchoolAvailabilitySlot[],
): LessonBookingAggregatedSlot[] {
    const byKey = new Map<string, LessonBookingInstructorOption[]>();

    for (const s of raw) {
        const key = `${s.date}|${s.startTime}|${s.endTime}`;
        const opt: LessonBookingInstructorOption = {
            id: s.instructorId,
            firstName: s.instructorFirstName,
            lastName: s.instructorLastName,
        };

        const prev = byKey.get(key);

        if (prev) {
            if (!prev.some((x) => x.id === opt.id)) {
                prev.push(opt);
            }
        } else {
            byKey.set(key, [opt]);
        }
    }

    const out: LessonBookingAggregatedSlot[] = [];

    for (const [key, availableInstructors] of byKey) {
        const parts = key.split('|');
        const date = parts[0] ?? '';
        const startTime = parts[1] ?? '';
        const endTime = parts[2] ?? '';

        if (!date || !startTime || !endTime) {
            continue;
        }

        availableInstructors.sort((a, b) =>
            `${a.lastName} ${a.firstName}`.localeCompare(
                `${b.lastName} ${b.firstName}`,
                'pl',
            ),
        );

        out.push({
            date,
            startTime,
            endTime,
            instructorCount: availableInstructors.length,
            availableInstructors,
        });
    }

    return out.sort((a, b) => {
        const byDate = a.date.localeCompare(b.date);

        if (byDate !== 0) {
            return byDate;
        }

        return a.startTime.localeCompare(b.startTime);
    });
}

const aggregatedSlotsFlat = computed((): LessonBookingAggregatedSlot[] =>
    buildAggregatedSlots(slots.value).filter(isSlotInsideTimeline),
);

const aggregatedSlotsByDate = computed(() => {
    const map = new Map<string, LessonBookingAggregatedSlot[]>();

    for (const a of aggregatedSlotsFlat.value) {
        if (!map.has(a.date)) {
            map.set(a.date, []);
        }

        map.get(a.date)!.push(a);
    }

    for (const arr of map.values()) {
        arr.sort((x, y) => x.startTime.localeCompare(y.startTime));
    }

    return map;
});

function aggregatedSlotsForDate(
    dateStr: string,
): LessonBookingAggregatedSlot[] {
    return aggregatedSlotsByDate.value.get(dateStr) ?? [];
}

function handleSlotClick(slot: LessonBookingAggregatedSlot): void {
    const sid = props.schoolId.trim();

    if (!sid) {
        return;
    }

    activeSlotCtx.value = {
        date: slot.date,
        startTime: slot.startTime,
        endTime: slot.endTime,
        schoolId: sid,
        availableInstructors: slot.availableInstructors,
    };
    isSlotChoiceOpen.value = true;
}

function handlePickLessonFromChoice(): void {
    isBookingOpen.value = true;
}

function handlePickTheoryFromChoice(): void {
    isTheoryCreateOpen.value = true;
}

function handleTheoryEventCreated(payload: {
    eventId: string;
    capacity: number | null;
}): void {
    eventForPicker.value = {
        id: payload.eventId,
        capacity: payload.capacity,
    };
    isStudentPickerOpen.value = true;
}

watch(isStudentPickerOpen, (open) => {
    if (!open) {
        eventForPicker.value = null;
        void loadWeek();
    }
});

function handleBookingBooked(): void {
    void loadWeek();
    addToast({
        title: 'Kalendarz odświeżony',
        description: 'Sloty zostały ponownie wczytane.',
        variant: 'success',
    });
}

async function loadWeek(): Promise<void> {
    const sid = props.schoolId.trim();

    if (!sid) {
        slots.value = [];
        errorMessage.value = null;

        return;
    }

    const seq = ++fetchSeq;

    errorMessage.value = null;

    const { dateFrom, dateTo } = weekRangeFromMonday(weekStart.value);

    try {
        const { slots: data } = await fetchSlots(
            sid,
            dateFrom,
            dateTo,
            buildFiltersPayload(),
        );

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
    () => props.schoolId,
    () => {
        void loadSchoolCourses();
    },
    { immediate: true },
);

watch(
    [weekStart, () => props.schoolId],
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
