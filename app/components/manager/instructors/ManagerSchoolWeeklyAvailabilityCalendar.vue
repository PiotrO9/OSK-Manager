<script setup lang="ts">
import type { CalendarDate, DateValue } from '@internationalized/date';
import { ChevronLeft, ChevronRight, Filter } from 'lucide-vue-next';
import { toDate } from 'reka-ui/date';
import { useCoursesApi } from '~/composables/useCoursesApi';
import { useInstructorsApi } from '~/composables/useInstructorsApi';
import { useSchoolAvailabilitySlotsApi } from '~/composables/useSchoolAvailabilitySlotsApi';
import type { CourseListItem } from '~/types/course';
import {
    formatInstructorDisplayName,
    type InstructorListItem,
} from '~/types/instructor';
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

/** Dni tygodnia API: 0=niedz. … 6=sob. (UTC). Kolejność UI: pon–nd. */
const WEEKDAY_CHOICES: { value: number; label: string }[] = [
    { value: 1, label: 'Pon' },
    { value: 2, label: 'Wt' },
    { value: 3, label: 'Śr' },
    { value: 4, label: 'Czw' },
    { value: 5, label: 'Pt' },
    { value: 6, label: 'Sob' },
    { value: 0, label: 'Nd' },
];

function createEmptyFilterForm() {
    return {
        instructorIds: [] as string[],
        timeFrom: '',
        timeTo: '',
        weekdays: [] as number[],
        slotDurationMinutes: null as number | null,
        courseId: '',
        lessonType: '' as '' | 'THEORY' | 'PRACTICE',
        sort: 'startTime' as 'startTime' | 'instructorName',
        excludeMyLessons: false,
    };
}

const filterForm = ref(createEmptyFilterForm());
const filtersPanelOpen = ref(false);
const instructors = ref<InstructorListItem[]>([]);
const courses = ref<CourseListItem[]>([]);
const instructorsLoadError = ref<string | null>(null);

const { fetchList: fetchInstructorsList, isListLoading: isInstructorsLoading } =
    useInstructorsApi();
const { fetchList: fetchCoursesList, isListLoading: isCoursesLoading } =
    useCoursesApi();

async function loadFilterOptions(): Promise<void> {
    const sid = props.schoolId.trim();

    if (!sid) {
        instructors.value = [];
        courses.value = [];
        instructorsLoadError.value = null;

        return;
    }

    instructorsLoadError.value = null;

    const settled = await Promise.allSettled([
        fetchInstructorsList(sid),
        fetchCoursesList(sid),
    ]);

    const instRes = settled[0];
    const courseRes = settled[1];

    instructors.value = instRes.status === 'fulfilled' ? instRes.value : [];
    courses.value = courseRes.status === 'fulfilled' ? courseRes.value : [];

    if (instRes.status === 'rejected' && courseRes.status === 'rejected') {
        instructorsLoadError.value = getApiFetchErrorMessage(
            instRes.reason,
            'Nie udało się wczytać list do filtrów.',
        );
    } else if (instRes.status === 'rejected') {
        instructorsLoadError.value = getApiFetchErrorMessage(
            instRes.reason,
            'Nie udało się wczytać listy instruktorów.',
        );
    } else if (courseRes.status === 'rejected') {
        instructorsLoadError.value = getApiFetchErrorMessage(
            courseRes.reason,
            'Nie udało się wczytać listy kursów.',
        );
    }
}

function buildFiltersPayload(): SchoolAvailabilitySlotsQueryFilters {
    const form = filterForm.value;
    const out: SchoolAvailabilitySlotsQueryFilters = {
        limit: 500,
        sort: form.sort,
    };

    if (form.instructorIds.length > 0) {
        out.instructorIds = [...form.instructorIds];
    }

    const tf = form.timeFrom.trim();
    const tt = form.timeTo.trim();

    if (tf && tt) {
        out.timeFrom = tf;
        out.timeTo = tt;
    }

    const wd = form.weekdays;

    if (wd.length > 0 && wd.length < 7) {
        out.weekdays = [...wd].sort((a, b) => a - b);
    }

    if (
        form.slotDurationMinutes !== null &&
        form.slotDurationMinutes >= 15 &&
        form.slotDurationMinutes <= 240
    ) {
        out.slotDurationMinutes = form.slotDurationMinutes;
    }

    const cid = form.courseId.trim();

    if (cid) {
        out.courseId = cid;
    }

    if (form.lessonType === 'THEORY' || form.lessonType === 'PRACTICE') {
        out.lessonType = form.lessonType;
    }

    if (form.excludeMyLessons) {
        out.excludeMyLessons = true;
    }

    return out;
}

function handleToggleInstructor(id: string, checked: boolean): void {
    const arr = filterForm.value.instructorIds;
    const idx = arr.indexOf(id);

    if (checked && idx === -1) {
        arr.push(id);
    }

    if (!checked && idx !== -1) {
        arr.splice(idx, 1);
    }
}

function handleInstructorCheckboxChange(id: string, event: Event): void {
    const el = event.target as HTMLInputElement;

    handleToggleInstructor(id, el.checked);
}

function handleToggleWeekday(value: number, checked: boolean): void {
    const arr = filterForm.value.weekdays;
    const idx = arr.indexOf(value);

    if (checked && idx === -1) {
        arr.push(value);
    }

    if (!checked && idx !== -1) {
        arr.splice(idx, 1);
    }
}

function handleWeekdayCheckboxChange(value: number, event: Event): void {
    const el = event.target as HTMLInputElement;

    handleToggleWeekday(value, el.checked);
}

function handleSlotDurationInput(event: Event): void {
    const el = event.target as HTMLInputElement;
    const raw = el.value.trim();

    if (raw === '') {
        filterForm.value.slotDurationMinutes = null;

        return;
    }

    const n = Number.parseInt(raw, 10);

    filterForm.value.slotDurationMinutes = Number.isFinite(n) ? n : null;
}

function handleApplyFilters(): void {
    void loadWeek();
}

function handleResetFilters(): void {
    filterForm.value = createEmptyFilterForm();
    void loadWeek();
}

/** Oś czasu: 7:00–19:00 (12 h × 60 px). */
const BASE_HOUR = 7;
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
    buildAggregatedSlots(slots.value),
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

function handleEventStudentsAssigned(): void {
    void loadWeek();
}

watch(isStudentPickerOpen, (open) => {
    if (!open) {
        eventForPicker.value = null;
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
        void loadFilterOptions();
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
    <div class="space-y-4">
        <div
            class="flex flex-wrap items-center justify-between gap-3"
            role="toolbar"
            aria-label="Nawigacja tygodnia kalendarza slotów szkoły"
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
                        aria-label="Wybierz tydzień w kalendarzu (poniedziałek do niedzieli)"
                    >
                        Wybierz tydzień
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
        </div>

        <div class="border-border rounded-xl border">
            <button
                type="button"
                class="text-foreground hover:bg-muted/50 flex w-full items-center justify-between gap-2 rounded-xl px-4 py-3 text-left text-sm font-medium transition"
                :aria-expanded="filtersPanelOpen"
                aria-controls="school-slots-filters-panel"
                @click="filtersPanelOpen = !filtersPanelOpen"
            >
                <span class="inline-flex items-center gap-2">
                    <Filter
                        class="text-muted-foreground size-4"
                        aria-hidden="true"
                    />
                    Filtry zapytania (API)
                </span>
                <span class="text-muted-foreground text-xs">
                    {{ filtersPanelOpen ? 'Zwiń' : 'Rozwiń' }}
                </span>
            </button>

            <div
                v-show="filtersPanelOpen"
                id="school-slots-filters-panel"
                class="border-border space-y-4 border-t px-4 py-4"
            >
                <p
                    v-if="instructorsLoadError"
                    class="text-destructive text-sm"
                    role="alert"
                >
                    {{ instructorsLoadError }}
                </p>

                <div
                    class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
                    role="group"
                    aria-label="Filtry slotów szkoły"
                >
                    <div class="space-y-2 sm:col-span-2 lg:col-span-3">
                        <p class="text-muted-foreground text-xs font-medium">
                            Instruktorzy (puste = wszyscy)
                        </p>
                        <div
                            v-if="isInstructorsLoading"
                            class="text-muted-foreground text-xs"
                            role="status"
                        >
                            Wczytywanie instruktorów…
                        </div>
                        <div v-else class="flex flex-wrap gap-x-4 gap-y-2">
                            <label
                                v-for="inst in instructors"
                                :key="inst.id"
                                class="flex cursor-pointer items-center gap-2 text-sm"
                            >
                                <input
                                    type="checkbox"
                                    class="border-input accent-primary size-4 rounded"
                                    :checked="
                                        filterForm.instructorIds.includes(
                                            inst.id,
                                        )
                                    "
                                    @change="
                                        handleInstructorCheckboxChange(
                                            inst.id,
                                            $event,
                                        )
                                    "
                                />
                                <span>{{
                                    formatInstructorDisplayName(inst)
                                }}</span>
                            </label>
                        </div>
                    </div>

                    <div class="space-y-1.5">
                        <label
                            class="text-foreground text-xs font-medium"
                            for="school-slot-filter-time-from"
                        >
                            Godzina od (HH:mm)
                        </label>
                        <input
                            id="school-slot-filter-time-from"
                            v-model="filterForm.timeFrom"
                            type="time"
                            class="border-input bg-background ring-offset-background focus-visible:ring-ring w-full rounded-md border px-2 py-1.5 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                        />
                    </div>

                    <div class="space-y-1.5">
                        <label
                            class="text-foreground text-xs font-medium"
                            for="school-slot-filter-time-to"
                        >
                            Godzina do (HH:mm)
                        </label>
                        <input
                            id="school-slot-filter-time-to"
                            v-model="filterForm.timeTo"
                            type="time"
                            class="border-input bg-background ring-offset-background focus-visible:ring-ring w-full rounded-md border px-2 py-1.5 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                        />
                    </div>

                    <div class="space-y-1.5">
                        <label
                            class="text-foreground text-xs font-medium"
                            for="school-slot-filter-duration"
                        >
                            Długość slotu (min, 15–240)
                        </label>
                        <input
                            id="school-slot-filter-duration"
                            type="number"
                            min="15"
                            max="240"
                            step="15"
                            placeholder="Domyślnie z OSK"
                            class="border-input bg-background ring-offset-background focus-visible:ring-ring w-full rounded-md border px-2 py-1.5 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                            :value="
                                filterForm.slotDurationMinutes === null
                                    ? ''
                                    : filterForm.slotDurationMinutes
                            "
                            @input="handleSlotDurationInput"
                        />
                    </div>

                    <div class="space-y-2 sm:col-span-2 lg:col-span-3">
                        <p class="text-muted-foreground text-xs font-medium">
                            Dni tygodnia (UTC, 0=niedz.) — puste = wszystkie
                        </p>
                        <div class="flex flex-wrap gap-x-4 gap-y-2">
                            <label
                                v-for="ch in WEEKDAY_CHOICES"
                                :key="ch.value"
                                class="flex cursor-pointer items-center gap-2 text-sm"
                            >
                                <input
                                    type="checkbox"
                                    class="border-input accent-primary size-4 rounded"
                                    :checked="
                                        filterForm.weekdays.includes(ch.value)
                                    "
                                    @change="
                                        handleWeekdayCheckboxChange(
                                            ch.value,
                                            $event,
                                        )
                                    "
                                />
                                <span>{{ ch.label }}</span>
                            </label>
                        </div>
                    </div>

                    <div class="space-y-1.5">
                        <label
                            class="text-foreground text-xs font-medium"
                            for="school-slot-filter-course"
                        >
                            Kurs (opcjonalnie)
                        </label>
                        <UiSelect
                            v-model="filterForm.courseId"
                            :disabled="isCoursesLoading"
                        >
                            <UiSelectTrigger
                                id="school-slot-filter-course"
                                class="w-full"
                            >
                                <UiSelectValue placeholder="— dowolny —" />
                            </UiSelectTrigger>
                            <UiSelectContent>
                                <UiSelectGroup>
                                    <UiSelectItem value=""
                                        >— dowolny —</UiSelectItem
                                    >
                                    <UiSelectItem
                                        v-for="c in courses"
                                        :key="c.id"
                                        :value="c.id"
                                    >
                                        {{ c.name }}
                                    </UiSelectItem>
                                </UiSelectGroup>
                            </UiSelectContent>
                        </UiSelect>
                    </div>

                    <div class="space-y-1.5">
                        <label
                            class="text-foreground text-xs font-medium"
                            for="school-slot-filter-lesson-type"
                        >
                            Typ lekcji (API)
                        </label>
                        <UiSelect v-model="filterForm.lessonType">
                            <UiSelectTrigger
                                id="school-slot-filter-lesson-type"
                                class="w-full"
                            >
                                <UiSelectValue placeholder="— dowolny —" />
                            </UiSelectTrigger>
                            <UiSelectContent>
                                <UiSelectGroup>
                                    <UiSelectItem value=""
                                        >— dowolny —</UiSelectItem
                                    >
                                    <UiSelectItem value="THEORY"
                                        >Teoria</UiSelectItem
                                    >
                                    <UiSelectItem value="PRACTICE">
                                        Praktyka
                                    </UiSelectItem>
                                </UiSelectGroup>
                            </UiSelectContent>
                        </UiSelect>
                    </div>

                    <div class="space-y-1.5">
                        <label
                            class="text-foreground text-xs font-medium"
                            for="school-slot-filter-sort"
                        >
                            Sortowanie
                        </label>
                        <UiSelect v-model="filterForm.sort">
                            <UiSelectTrigger
                                id="school-slot-filter-sort"
                                class="w-full"
                            >
                                <UiSelectValue placeholder="Sortowanie" />
                            </UiSelectTrigger>
                            <UiSelectContent>
                                <UiSelectGroup>
                                    <UiSelectItem value="startTime">
                                        Godzina rozpoczęcia
                                    </UiSelectItem>
                                    <UiSelectItem value="instructorName">
                                        Nazwisko instruktora
                                    </UiSelectItem>
                                </UiSelectGroup>
                            </UiSelectContent>
                        </UiSelect>
                    </div>

                    <div
                        class="flex items-end gap-2 sm:col-span-2 lg:col-span-3"
                    >
                        <label
                            class="flex cursor-pointer items-center gap-2 text-sm"
                        >
                            <input
                                v-model="filterForm.excludeMyLessons"
                                type="checkbox"
                                class="border-input accent-primary size-4 rounded"
                            />
                            <span>Wyklucz moje lekcje (excludeMyLessons)</span>
                        </label>
                    </div>
                </div>

                <div class="flex flex-wrap gap-2">
                    <UiButton
                        type="button"
                        size="sm"
                        :disabled="isLoading"
                        @click="handleApplyFilters"
                    >
                        Zastosuj filtry
                    </UiButton>
                    <UiButton
                        type="button"
                        variant="outline"
                        size="sm"
                        :disabled="isLoading"
                        @click="handleResetFilters"
                    >
                        Wyczyść i odśwież
                    </UiButton>
                </div>
            </div>
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
                class="bg-muted/30 text-muted-foreground border-border flex min-w-[720px] flex-wrap items-center gap-2 border-b px-3 py-2 text-xs"
                role="status"
            >
                <span>Oś godzin: {{ BASE_HOUR }}:00–19:00</span>
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
                                    v-for="slot in aggregatedSlotsForDate(
                                        day.dateStr,
                                    )"
                                    :key="`${slot.date}-${slot.startTime}-${slot.endTime}`"
                                >
                                    <button
                                        type="button"
                                        class="bg-primary/15 border-primary text-primary hover:bg-primary/25 focus-visible:ring-ring absolute right-1 left-1 overflow-hidden rounded-md border px-1 py-0.5 text-left text-xs leading-tight shadow-sm focus-visible:ring-2 focus-visible:outline-none"
                                        :style="{
                                            top: `${slotTopPx(slot.startTime)}px`,
                                            height: '60px',
                                        }"
                                        :title="`Dostępny slot ${slot.startTime}–${slot.endTime} (${slot.instructorCount} instr.)`"
                                        :aria-label="`Wybierz akcję w slocie ${slot.startTime}–${slot.endTime}, instruktorów: ${slot.instructorCount}`"
                                        :disabled="isLoading"
                                        @click="handleSlotClick(slot)"
                                    >
                                        <span class="block font-medium">
                                            Dostępny
                                        </span>
                                        <span
                                            v-if="slot.instructorCount > 1"
                                            class="text-primary/90 block truncate text-[10px]"
                                        >
                                            {{ slot.instructorCount }}
                                            instruktorów
                                        </span>
                                        <span
                                            class="text-primary/80 block truncate text-[10px]"
                                        >
                                            {{ slot.startTime }}–{{
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
            @created="handleTheoryEventCreated"
        />

        <ManagerEventStudentPickerDialog
            v-model:open="isStudentPickerOpen"
            :event-id="eventForPicker?.id ?? ''"
            :capacity="eventForPicker?.capacity ?? null"
            :school-id="schoolId"
            @assigned="handleEventStudentsAssigned"
        />

        <ManagerLessonBookingDialog
            v-model:open="isBookingOpen"
            :slot-ctx="activeSlotCtx"
            :school-courses="courses"
            @booked="handleBookingBooked"
        />
    </div>
</template>
