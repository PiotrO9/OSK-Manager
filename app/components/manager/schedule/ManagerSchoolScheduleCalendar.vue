<script setup lang="ts">
import type { DateValue } from '@internationalized/date';
import { BookOpen, Car } from 'lucide-vue-next';
import { toDate } from 'reka-ui/date';
import type { ScheduleLessonItem } from '~/types/schedule';
import { getApiFetchErrorMessage } from '~/utils/apiFetchErrorMessage';
import {
    buildScheduleManagerItemEditRoute,
    isScheduleManagerItemEditable,
} from '~/utils/scheduleManagerEditNavigation';
import { isScheduleBookedPracticalLesson } from '~/utils/scheduleBookedPracticalLesson';
import { isScheduleInstructorEvent } from '~/utils/scheduleInstructorEvent';
import {
    instructorEventStatusBadgeVariant,
    labelForInstructorEventStatusRaw,
    normalizeInstructorEventStatus,
} from '~/utils/instructorEventStatusDisplay';
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
        schoolId: string;
        /** Klik w blok czasu lub jazdę praktyczną → edycja wydarzenia / lekcji */
        eventEditEnabled?: boolean;
        /**
         * Tryb osadzenia: dane i loading z rodzica (np. /my-lessons), bez GET harmonogramu szkoły.
         */
        parentSchedule?: boolean;
        parentItems?: ScheduleLessonItem[];
        parentLoading?: boolean;
        parentError?: string | null;
        /** Synchronizacja tygodnia z rodzicem (`v-model:week-start`). */
        weekStart?: Date;
        /** Etykieta licznika w pasku (np. „Wydarzeń” / „Lekcji”). */
        scheduleCountBadgeLabel?: string;
        /** Komunikat w pustym dniu siatki. */
        emptyDayMessage?: string;
        /**
         * Dla jazdy praktycznej: pierwsza linia karty — kursant (domyślnie) lub instruktor (np. widok kursanta).
         */
        practicePrimaryLine?: 'student' | 'instructor';
        studentRatingSelectionEnabled?: boolean;
    }>(),
    {
        eventEditEnabled: false,
        parentSchedule: false,
        parentItems: () => [],
        parentLoading: false,
        parentError: null,
        weekStart: undefined,
        scheduleCountBadgeLabel: 'Lekcji',
        emptyDayMessage: 'Brak lekcji',
        practicePrimaryLine: 'student',
        studentRatingSelectionEnabled: false,
    },
);

const emit = defineEmits<{
    'update:weekStart': [value: Date];
    'lesson-selected': [lesson: ScheduleLessonItem];
}>();

/** Oś czasu: 7:00–19:00 (12 h × 60 px). */
const BASE_HOUR = 7;
const GRID_HEIGHT_PX = 720;
const PX_PER_MINUTE = 1;
/** Odstęp przed granicą następnego bloku w siatce (chroni przed „double border” i nachodzeniem). */
const SLOT_END_GUTTER_PX = 1;
/** Odstęp między kafelkami, gdy w jednym przedziale startu jest kilka lekcji. */
const SAME_START_TILE_GAP_PX = 2;

function isoToHm(iso: string): string {
    const d = new Date(iso);

    if (Number.isNaN(d.getTime())) {
        return '00:00';
    }

    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function isoToDateStr(iso: string): string {
    const d = new Date(iso);

    if (Number.isNaN(d.getTime())) {
        return '';
    }

    return formatDateOnly(d);
}

function slotTopPx(startTimeHm: string): number {
    const parts = startTimeHm.trim().split(':').map(Number);

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

function isTheoryLessonType(type: string): boolean {
    return type.trim().toUpperCase() === 'THEORY';
}

function lessonBlockClasses(type: string): string {
    const t = type.trim().toUpperCase();

    if (t === 'PRACTICE') {
        return 'border-sky-400 bg-sky-50 text-sky-950 shadow-sky-900/10 dark:border-sky-500/70 dark:bg-sky-950/50 dark:text-sky-50';
    }

    if (t === 'THEORY') {
        return 'border-indigo-300 bg-indigo-50 text-indigo-950 shadow-indigo-900/10 dark:border-indigo-400/60 dark:bg-indigo-950/50 dark:text-indigo-50';
    }

    return 'border-amber-300 bg-amber-50 text-amber-950 dark:border-amber-500/70 dark:bg-amber-950/50 dark:text-amber-100';
}

function displayStudent(item: ScheduleLessonItem): string {
    const s = item.student;

    if (!s) {
        return '—';
    }

    const name = `${s.firstName} ${s.lastName}`.trim();

    return name.length > 0 ? name : '—';
}

function displayVehicle(item: ScheduleLessonItem): string {
    const v = item.vehicle;

    if (!v) {
        return '';
    }

    const n = v.name.trim();
    const r = v.registrationNumber.trim();

    if (n && r) {
        return `${n} (${r})`;
    }

    return n || r || '';
}

function displayInstructorName(item: ScheduleLessonItem): string {
    const i = item.instructor;

    if (!i) {
        return '';
    }

    const name = `${i.firstName} ${i.lastName}`.trim();

    return name.length > 0 ? name : '';
}

/** Treść główna dla bloku teoretycznego: grupa / pojedynczy kursant (zgodnie z BE). */
function displayTheoryPrimaryLine(item: ScheduleLessonItem): string {
    const list = item.students;

    if (list && list.length > 0) {
        const shown = list.slice(0, 2).map((s) => {
            const n = `${s.firstName} ${s.lastName}`.trim();

            return n.length > 0 ? n : '—';
        });
        const rest = list.length - shown.length;

        if (rest > 0) {
            return `${shown.join(', ')} +${rest}`;
        }

        return shown.join(', ');
    }

    const pc = item.participantCount;
    const cap = item.capacity;

    if (pc != null && cap != null && cap > 0) {
        return `${pc}/${cap} miejsc`;
    }

    if (pc != null && pc > 0) {
        return `${pc} uczestników`;
    }

    return displayStudent(item);
}

function displayPrimaryLine(item: ScheduleLessonItem): string {
    if (isTheoryLessonType(item.type)) {
        return displayTheoryPrimaryLine(item);
    }

    if (props.practicePrimaryLine === 'instructor') {
        const ins = displayInstructorName(item);

        if (ins.length > 0) {
            return ins;
        }
    }

    return displayStudent(item);
}

function displayInstructorSubtitle(item: ScheduleLessonItem): string {
    const ins = displayInstructorName(item);

    if (ins) {
        return `Prowadzący: ${ins}`;
    }

    return '';
}

function lessonDurationMinutes(lesson: ScheduleLessonItem): number {
    const start = new Date(lesson.startTime).getTime();
    const end = new Date(lesson.endTime).getTime();

    if (Number.isNaN(start) || Number.isNaN(end) || end <= start) {
        return 60;
    }

    return Math.max(1, Math.round((end - start) / 60000));
}

function ariaSummaryForLesson(item: ScheduleLessonItem): string {
    const time = `${isoToHm(item.startTime)}–${isoToHm(item.endTime)}`;

    if (isScheduleInstructorEvent(item)) {
        const statusLabel = labelForInstructorEventStatusRaw(item.status);
        const primary = displayPrimaryLine(item);
        const sub = displayInstructorSubtitle(item);
        const parts = ['Blok czasu', `status ${statusLabel}`, time, primary];

        if (sub) {
            parts.push(sub);
        }

        return parts.join(', ');
    }

    if (isTheoryLessonType(item.type)) {
        const primary = displayTheoryPrimaryLine(item);
        const sub = displayInstructorSubtitle(item);
        const parts = [`Lekcja teoretyczna`, time, primary];

        if (sub) {
            parts.push(sub);
        }

        return parts.join(', ');
    }

    const v = displayVehicle(item);
    const ins = displayInstructorName(item);
    const parts = [
        `Lekcja praktyczna`,
        time,
        `kursant ${displayStudent(item)}`,
    ];

    if (v) {
        parts.push(v);
    }

    if (ins) {
        parts.push(`instruktor ${ins}`);
    }

    return parts.join(', ');
}

const localWeekStart = ref<Date>(getMonday(new Date()));
const internalItems = ref<ScheduleLessonItem[]>([]);
const errorMessage = ref<string | null>(null);
const isCalendarOpen = ref(false);

const calendarSelected = ref<DateValue[]>(
    weekCalendarDatesFromMonday(getMonday(new Date())),
);

const calendarSelectedModel = computed<DateValue[]>(
    () => calendarSelected.value as unknown as DateValue[],
);

const { fetchSchoolSchedule, isLoading } = useSchoolScheduleApi();

let fetchSeq = 0;

const activeWeekStart = computed(() => {
    if (props.parentSchedule && props.weekStart) {
        return getMonday(props.weekStart);
    }

    return localWeekStart.value;
});

const displayItems = computed((): ScheduleLessonItem[] =>
    props.parentSchedule ? props.parentItems : internalItems.value,
);

const displayLoading = computed(() =>
    props.parentSchedule ? props.parentLoading : isLoading.value,
);

const displayError = computed(() =>
    props.parentSchedule ? props.parentError : errorMessage.value,
);

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
        activeWeekStart.value.getFullYear(),
        activeWeekStart.value.getMonth(),
        activeWeekStart.value.getDate(),
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
    const ws = activeWeekStart.value;
    const end = new Date(ws.getFullYear(), ws.getMonth(), ws.getDate() + 6);

    const opts: Intl.DateTimeFormatOptions = {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    };

    return `${ws.toLocaleDateString('pl-PL', opts)} – ${end.toLocaleDateString('pl-PL', opts)}`;
});

const compactWeekRangeLabel = computed(() => {
    const ws = activeWeekStart.value;
    const end = new Date(ws.getFullYear(), ws.getMonth(), ws.getDate() + 6);
    const startDay = ws.toLocaleDateString('pl-PL', { day: 'numeric' });
    const endDay = end.toLocaleDateString('pl-PL', { day: 'numeric' });
    const startMonth = ws.toLocaleDateString('pl-PL', { month: 'long' });
    const endMonth = end.toLocaleDateString('pl-PL', { month: 'long' });

    if (
        ws.getMonth() === end.getMonth() &&
        ws.getFullYear() === end.getFullYear()
    ) {
        return `${startDay}-${endDay} ${endMonth}`;
    }

    return `${startDay} ${startMonth} - ${endDay} ${endMonth}`;
});

const itemsByDate = computed(() => {
    const map = new Map<string, ScheduleLessonItem[]>();

    for (const it of displayItems.value) {
        const ds = isoToDateStr(it.startTime);

        if (!ds) {
            continue;
        }

        if (!map.has(ds)) {
            map.set(ds, []);
        }

        map.get(ds)!.push(it);
    }

    for (const arr of map.values()) {
        arr.sort((a, b) => a.startTime.localeCompare(b.startTime));
    }

    return map;
});

function lessonsForDate(dateStr: string): ScheduleLessonItem[] {
    return itemsByDate.value.get(dateStr) ?? [];
}

const scheduleInstructorCount = computed(() => {
    const ids = new Set<string>();
    const names = new Set<string>();

    for (const item of displayItems.value) {
        const instructor = item.instructor;

        if (!instructor) {
            continue;
        }

        if (instructor.id.trim()) {
            ids.add(instructor.id);
            continue;
        }

        const name = `${instructor.firstName} ${instructor.lastName}`.trim();

        if (name) {
            names.add(name);
        }
    }

    return ids.size + names.size;
});

const earliestStartLabel = computed(() => {
    const times = displayItems.value
        .map((item) => new Date(item.startTime))
        .filter((date) => !Number.isNaN(date.getTime()))
        .sort((a, b) => a.getTime() - b.getTime());

    if (times.length === 0) {
        return '--:--';
    }

    return `${String(times[0]!.getHours()).padStart(2, '0')}:${String(
        times[0]!.getMinutes(),
    ).padStart(2, '0')}`;
});

function sameStartSorted(
    item: ScheduleLessonItem,
    dateStr: string,
): ScheduleLessonItem[] {
    const list = lessonsForDate(dateStr);
    const hm = isoToHm(item.startTime);
    const same = list.filter((x) => isoToHm(x.startTime) === hm);

    same.sort((a, b) => a.id.localeCompare(b.id));

    return same;
}

/**
 * Czas w minutach: najdłuższa lekcja w grupie tych samych startów (wspólny pasek pionowy).
 */
function sameStartGroupDurationMinutes(
    lesson: ScheduleLessonItem,
    dateStr: string,
): number {
    const same = sameStartSorted(lesson, dateStr);
    let maxMin = 1;

    for (const s of same) {
        maxMin = Math.max(maxMin, lessonDurationMinutes(s));
    }

    return maxMin;
}

function sameStartSlotInnerPx(
    lesson: ScheduleLessonItem,
    dateStr: string,
): number {
    return Math.max(
        0,
        sameStartGroupDurationMinutes(lesson, dateStr) * PX_PER_MINUTE -
            SLOT_END_GUTTER_PX,
    );
}

function sameStartTileHeightPx(
    lesson: ScheduleLessonItem,
    dateStr: string,
): number {
    const same = sameStartSorted(lesson, dateStr);
    const inner = sameStartSlotInnerPx(lesson, dateStr);
    const n = Math.max(1, same.length);

    if (n === 1) {
        return Math.max(1, inner);
    }

    return Math.max(1, (inner - (n - 1) * SAME_START_TILE_GAP_PX) / n);
}

function lessonBlockTopPx(lesson: ScheduleLessonItem, dateStr: string): number {
    const same = sameStartSorted(lesson, dateStr);
    const h = sameStartTileHeightPx(lesson, dateStr);
    const idx = same.findIndex((x) => x.id === lesson.id);

    if (idx < 0) {
        return slotTopPx(isoToHm(lesson.startTime));
    }

    return (
        slotTopPx(isoToHm(lesson.startTime)) +
        idx * (h + SAME_START_TILE_GAP_PX)
    );
}

function lessonBlockHeightPx(
    lesson: ScheduleLessonItem,
    dateStr: string,
): number {
    return sameStartTileHeightPx(lesson, dateStr);
}

async function loadWeek(): Promise<void> {
    if (props.parentSchedule) {
        return;
    }

    const sid = props.schoolId.trim();

    if (!sid) {
        internalItems.value = [];
        errorMessage.value = null;

        return;
    }

    const seq = ++fetchSeq;

    errorMessage.value = null;

    const { dateFrom, dateTo } = weekRangeFromMonday(localWeekStart.value);

    try {
        const data = await fetchSchoolSchedule(sid, dateFrom, dateTo);

        if (seq !== fetchSeq) {
            return;
        }

        internalItems.value = data;
    } catch (err: unknown) {
        if (seq !== fetchSeq) {
            return;
        }

        internalItems.value = [];
        errorMessage.value = getApiFetchErrorMessage(
            err,
            'Nie udało się pobrać harmonogramu lekcji.',
        );
    }
}

watch(
    [localWeekStart, () => props.schoolId],
    () => {
        if (!props.parentSchedule) {
            void loadWeek();
        }
    },
    { immediate: true },
);

watch(
    activeWeekStart,
    (w) => {
        calendarSelected.value = weekCalendarDatesFromMonday(w);
    },
    { immediate: true },
);

function commitWeekMonday(monday: Date): void {
    const m = getMonday(monday);

    if (props.parentSchedule) {
        emit('update:weekStart', m);

        return;
    }

    localWeekStart.value = m;
}

function handlePrevWeek(): void {
    const d = new Date(activeWeekStart.value);

    d.setDate(d.getDate() - 7);
    commitWeekMonday(d);
}

function handleNextWeek(): void {
    const d = new Date(activeWeekStart.value);

    d.setDate(d.getDate() + 7);
    commitWeekMonday(d);
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

    commitWeekMonday(monday);
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

function blockIsClickable(lesson: ScheduleLessonItem): boolean {
    return (
        isScheduleManagerItemEditable(props.eventEditEnabled, lesson) ||
        isStudentRatingSelectableLesson(lesson)
    );
}

function isStudentRatingSelectableLesson(lesson: ScheduleLessonItem): boolean {
    return (
        props.studentRatingSelectionEnabled &&
        lesson.kind === 'lesson' &&
        lesson.type.trim().toUpperCase() === 'PRACTICE' &&
        lesson.status.trim().toUpperCase() === 'COMPLETED'
    );
}

function blockAccessibilityLabel(lesson: ScheduleLessonItem): string {
    const base = ariaSummaryForLesson(lesson);

    if (isStudentRatingSelectableLesson(lesson)) {
        return `${base}. Naciśnij Enter lub Spację, aby otwórzyć opinię.`;
    }

    if (!props.eventEditEnabled) {
        return base;
    }

    if (isScheduleInstructorEvent(lesson)) {
        return `${base}. Naciśnij Enter lub Spację, aby edytować blok czasu.`;
    }

    if (isScheduleBookedPracticalLesson(lesson)) {
        return `${base}. Naciśnij Enter lub Spację, aby edytować jazdę praktyczną.`;
    }

    return base;
}

function lessonBlockInteractiveClasses(lesson: ScheduleLessonItem): string {
    if (!blockIsClickable(lesson)) {
        return '';
    }

    return 'cursor-pointer hover:brightness-[0.97] focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:outline-none dark:hover:brightness-[1.08]';
}

function handleScheduleBlockClick(lesson: ScheduleLessonItem): void {
    if (!blockIsClickable(lesson)) {
        return;
    }

    if (isStudentRatingSelectableLesson(lesson)) {
        emit('lesson-selected', lesson);

        return;
    }

    const target = buildScheduleManagerItemEditRoute(lesson, props.schoolId);

    if (!target) {
        return;
    }

    void navigateTo(target);
}

function handleScheduleBlockKeydown(
    e: KeyboardEvent,
    lesson: ScheduleLessonItem,
): void {
    if (!blockIsClickable(lesson)) {
        return;
    }

    if (e.key !== 'Enter' && e.key !== ' ') {
        return;
    }

    e.preventDefault();
    handleScheduleBlockClick(lesson);
}

defineExpose({
    reloadWeek: loadWeek,
});
</script>

<template>
    <UiCard class="overflow-hidden rounded-2xl shadow-sm">
        <UiCardContent class="space-y-4 p-4">
            <ManagerScheduleWeekToolbar
                v-model:calendar-open="isCalendarOpen"
                :is-loading="displayLoading"
                :compact-week-range-label="compactWeekRangeLabel"
                :calendar-selected-model="calendarSelectedModel"
                :min-value="WEEK_PICKER_CALENDAR_MIN"
                :max-value="WEEK_PICKER_CALENDAR_MAX"
                @previous="handlePrevWeek"
                @next="handleNextWeek"
                @previous-keydown="handleKeyDownWeekNav($event, 'prev')"
                @next-keydown="handleKeyDownWeekNav($event, 'next')"
                @calendar-update="handleCalendarUpdate"
            />

            <p
                v-if="displayError"
                class="text-destructive text-sm"
                role="alert"
                aria-live="polite"
            >
                {{ displayError }}
            </p>

            <ManagerScheduleMetaBar
                :is-loading="displayLoading"
                :base-hour="BASE_HOUR"
                :schedule-count-badge-label="scheduleCountBadgeLabel"
                :display-items-count="displayItems.length"
                :schedule-instructor-count="scheduleInstructorCount"
                :earliest-start-label="earliestStartLabel"
            />

            <div
                class="border-border relative overflow-x-auto rounded-2xl border"
            >
                <div class="sr-only" role="status">
                    <span>Oś godzin: {{ BASE_HOUR }}:00–19:00</span>
                    <span
                        v-if="eventEditEnabled"
                        class="text-foreground border-border border-l pl-2"
                    >
                        Blok czasu lub jazda praktyczna: kliknij lub Enter, aby
                        edytować.
                    </span>
                    <span
                        class="border-border flex flex-wrap items-center gap-2 border-l pl-2"
                        aria-hidden="true"
                    >
                        <span class="inline-flex items-center gap-1">
                            <span
                                class="inline-block size-2.5 shrink-0 rounded-sm border border-emerald-600/80 bg-emerald-500/30"
                            />
                            <span>jazda</span>
                        </span>
                        <span class="inline-flex items-center gap-1">
                            <span
                                class="inline-block size-2.5 shrink-0 rounded-sm border border-violet-600/80 bg-violet-500/30"
                            />
                            <span>teoria</span>
                        </span>
                    </span>
                    <UiBadge v-if="displayLoading" variant="secondary"
                        >Ładowanie…</UiBadge
                    >
                    <UiBadge v-else-if="!displayError" variant="outline">
                        {{ scheduleCountBadgeLabel }}: {{ displayItems.length }}
                    </UiBadge>
                </div>

                <div class="relative min-w-[720px]">
                    <div
                        v-if="displayLoading"
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
                        :aria-label="`Harmonogram lekcji, ${weekRangeLabel}`"
                    >
                        <ManagerScheduleHourGutter
                            :hour-labels="hourLabels"
                            :grid-height-px="GRID_HEIGHT_PX"
                        />

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
                                        v-for="lesson in lessonsForDate(
                                            day.dateStr,
                                        )"
                                        :key="lesson.id"
                                    >
                                        <div
                                            class="absolute inset-x-1.5 box-border overflow-hidden rounded-md border px-1.5 py-1 text-xs leading-tight shadow-sm"
                                            :class="[
                                                lessonBlockClasses(lesson.type),
                                                lessonBlockInteractiveClasses(
                                                    lesson,
                                                ),
                                            ]"
                                            :style="{
                                                top: `${lessonBlockTopPx(lesson, day.dateStr)}px`,
                                                height: `${lessonBlockHeightPx(lesson, day.dateStr)}px`,
                                            }"
                                            :title="
                                                blockAccessibilityLabel(lesson)
                                            "
                                            :role="
                                                blockIsClickable(lesson)
                                                    ? 'button'
                                                    : 'group'
                                            "
                                            :aria-label="
                                                blockAccessibilityLabel(lesson)
                                            "
                                            :tabindex="
                                                blockIsClickable(lesson)
                                                    ? 0
                                                    : undefined
                                            "
                                            @click="
                                                handleScheduleBlockClick(lesson)
                                            "
                                            @keydown="
                                                handleScheduleBlockKeydown(
                                                    $event,
                                                    lesson,
                                                )
                                            "
                                        >
                                            <div
                                                v-if="
                                                    isTheoryLessonType(
                                                        lesson.type,
                                                    )
                                                "
                                                class="mb-0.5 flex items-center gap-1"
                                            >
                                                <BookOpen
                                                    class="size-3 shrink-0 text-violet-700 dark:text-violet-200"
                                                    aria-hidden="true"
                                                />
                                                <UiBadge
                                                    variant="secondary"
                                                    class="border-violet-500/40 bg-violet-500/20 px-1 py-0 text-[9px] font-semibold tracking-wide text-violet-950 uppercase dark:text-violet-50"
                                                >
                                                    Teoria
                                                </UiBadge>
                                                <span
                                                    class="ml-auto shrink-0 font-medium tabular-nums"
                                                >
                                                    {{
                                                        isoToHm(
                                                            lesson.startTime,
                                                        )
                                                    }}–{{
                                                        isoToHm(lesson.endTime)
                                                    }}
                                                </span>
                                            </div>
                                            <span
                                                v-else
                                                class="mb-0.5 flex items-center gap-1"
                                            >
                                                <Car
                                                    class="size-3 shrink-0 text-emerald-800 dark:text-emerald-200"
                                                    aria-hidden="true"
                                                />
                                                <span
                                                    class="font-medium tabular-nums"
                                                >
                                                    {{
                                                        isoToHm(
                                                            lesson.startTime,
                                                        )
                                                    }}–{{
                                                        isoToHm(lesson.endTime)
                                                    }}
                                                </span>
                                            </span>
                                            <span
                                                class="block truncate text-[10px] font-medium"
                                                :class="
                                                    isTheoryLessonType(
                                                        lesson.type,
                                                    )
                                                        ? 'text-violet-950/95 dark:text-violet-50/95'
                                                        : ''
                                                "
                                            >
                                                {{ displayPrimaryLine(lesson) }}
                                            </span>
                                            <span
                                                v-if="
                                                    isScheduleInstructorEvent(
                                                        lesson,
                                                    )
                                                "
                                                class="mt-0.5 block"
                                            >
                                                <UiBadge
                                                    :variant="
                                                        instructorEventStatusBadgeVariant(
                                                            normalizeInstructorEventStatus(
                                                                lesson.status,
                                                            ),
                                                        )
                                                    "
                                                    class="px-1 py-0 text-[9px] font-medium"
                                                >
                                                    {{
                                                        labelForInstructorEventStatusRaw(
                                                            lesson.status,
                                                        )
                                                    }}
                                                </UiBadge>
                                            </span>
                                            <span
                                                v-if="
                                                    isTheoryLessonType(
                                                        lesson.type,
                                                    ) &&
                                                    displayInstructorSubtitle(
                                                        lesson,
                                                    )
                                                "
                                                class="block truncate text-[10px] leading-snug text-violet-900/85 dark:text-violet-100/85"
                                            >
                                                {{
                                                    displayInstructorSubtitle(
                                                        lesson,
                                                    )
                                                }}
                                            </span>
                                            <span
                                                v-if="
                                                    !isTheoryLessonType(
                                                        lesson.type,
                                                    ) && displayVehicle(lesson)
                                                "
                                                class="block truncate text-[10px] opacity-85"
                                            >
                                                {{ displayVehicle(lesson) }}
                                            </span>
                                            <span
                                                v-if="
                                                    !isTheoryLessonType(
                                                        lesson.type,
                                                    ) &&
                                                    displayInstructorSubtitle(
                                                        lesson,
                                                    )
                                                "
                                                class="block truncate text-[10px] leading-snug text-emerald-900/85 dark:text-emerald-100/85"
                                            >
                                                {{
                                                    displayInstructorSubtitle(
                                                        lesson,
                                                    )
                                                }}
                                            </span>
                                        </div>
                                    </template>

                                    <div
                                        v-if="
                                            lessonsForDate(day.dateStr)
                                                .length === 0 &&
                                            !displayLoading &&
                                            !displayError
                                        "
                                        class="text-muted-foreground absolute inset-0 flex items-center justify-center p-2 text-center text-xs"
                                    >
                                        {{ emptyDayMessage }}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </UiCardContent>
    </UiCard>
</template>
