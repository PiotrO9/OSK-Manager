<script setup lang="ts">
import type { CalendarDate, DateValue } from '@internationalized/date';
import { parseDate } from '@internationalized/date';
import { toDate } from 'reka-ui/date';
import { CalendarDays, Clock3, ListChecks, Users } from 'lucide-vue-next';
import { getApiFetchErrorMessage } from '~/utils/apiFetchErrorMessage';
import type { ScheduleLessonItem } from '~/types/schedule';
import {
    formatInstructorDisplayName,
    type InstructorListItem,
} from '~/types/instructor';
import type { EventStatusCode } from '~/types/instructorEvent';
import { isScheduleInstructorEvent } from '~/utils/scheduleInstructorEvent';
import {
    INSTRUCTOR_EVENT_STATUS_LABELS,
    INSTRUCTOR_EVENT_STATUS_OPTIONS,
    instructorEventStatusBadgeVariant,
    labelForInstructorEventStatusRaw,
    normalizeInstructorEventStatus,
} from '~/utils/instructorEventStatusDisplay';
import {
    formatDateOnly,
    WEEK_PICKER_CALENDAR_MAX,
    WEEK_PICKER_CALENDAR_MIN,
} from '~/utils/weeklyCalendarDates';

definePageMeta({
    layout: 'app-shell',
    middleware: ['manager-or-instructor'],
});

usePageMeta({
    title: () => 'Wydarzenia',
    description: () =>
        'Dzienny widok wydarzeń instruktora - zajęcia grupowe i bloki czasu.',
});

const { session } = useAuthSession();
const { fetchSchoolSchedule, isLoading: isSchoolLoading } =
    useSchoolScheduleApi();
const { fetchMySchedule } = useScheduleApi();
const { fetchList: fetchInstructorsList, isListLoading: isInstructorsLoading } =
    useInstructorsApi();

const isManager = computed(() => {
    const r = session.value?.role?.trim().toUpperCase();

    return r === 'MANAGER' || r === 'ADMIN';
});

const schoolId = computed((): string => {
    const id = session.value?.defaultOskId;

    return typeof id === 'string' ? id.trim() : '';
});

const isLoading = ref(false);
const errorMessage = ref<string | null>(null);
const events = ref<ScheduleLessonItem[]>([]);
const instructors = ref<InstructorListItem[]>([]);

const selectedDate = ref<string>(formatDateOnly(new Date()));
const selectedStatus = ref<'ALL' | EventStatusCode>('ALL');
const isCalendarOpen = ref(false);
const viewMode = ref<'grid' | 'list'>('grid');
const isCompactViewport = ref(false);

const calendarSelected = computed<CalendarDate>(() =>
    parseDate(selectedDate.value),
);

type StatusFilterOption = 'ALL' | EventStatusCode;

const STATUS_FILTER_OPTIONS: readonly StatusFilterOption[] = [
    'ALL',
    ...INSTRUCTOR_EVENT_STATUS_OPTIONS,
];

function statusFilterLabel(opt: StatusFilterOption): string {
    if (opt === 'ALL') {
        return 'Wszystkie';
    }

    return INSTRUCTOR_EVENT_STATUS_LABELS[opt];
}

function statusFilterLabelForOption(opt: string): string {
    return statusFilterLabel(opt as StatusFilterOption);
}

const filteredEvents = computed(() =>
    events.value.filter(
        (e) =>
            selectedStatus.value === 'ALL' || e.status === selectedStatus.value,
    ),
);

const attentionEvents = computed(() =>
    events.value.filter((event) => {
        const status = normalizeInstructorEventStatus(event.status);

        return status === 'NO_SHOW' || status === 'CANCELLED';
    }),
);

const plannedEvents = computed(
    () =>
        events.value.filter(
            (event) =>
                normalizeInstructorEventStatus(event.status) === 'PLANNED',
        ).length,
);

const participantTotal = computed(() =>
    events.value.reduce((sum, event) => {
        if (typeof event.participantCount === 'number') {
            return sum + event.participantCount;
        }

        if (Array.isArray(event.students)) {
            return sum + event.students.length;
        }

        return sum;
    }, 0),
);

const pageDescription = computed(() =>
    isManager.value
        ? 'Dzienne lekcje, teoria i bloki czasu instruktorów.'
        : 'Twoje bloki czasu w wybranym dniu.',
);

const visibleEventsLabel = computed(() => {
    if (filteredEvents.value.length === events.value.length) {
        return `${filteredEvents.value.length}`;
    }

    return `${filteredEvents.value.length} z ${events.value.length}`;
});

const selectedDateLabel = computed(() => {
    const d = new Date(`${selectedDate.value}T00:00:00`);

    if (Number.isNaN(d.getTime())) {
        return selectedDate.value;
    }

    const today = formatDateOnly(new Date());
    const yesterday = formatDateOnly(new Date(Date.now() - 86_400_000));
    const tomorrow = formatDateOnly(new Date(Date.now() + 86_400_000));

    const label = new Intl.DateTimeFormat('pl-PL', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(d);

    if (selectedDate.value === today) {
        return `Dzisiaj - ${label}`;
    }

    if (selectedDate.value === yesterday) {
        return `Wczoraj - ${label}`;
    }

    if (selectedDate.value === tomorrow) {
        return `Jutro - ${label}`;
    }

    return label;
});

interface InstructorScheduleColumn {
    id: string;
    name: string;
    initials: string;
    events: ScheduleLessonItem[];
}

interface InstructorScheduleRow {
    hour: number;
    label: string;
    cells: {
        key: string;
        columnId: string;
        events: ScheduleLessonItem[];
    }[];
}

const effectiveViewMode = computed<'grid' | 'list'>(() =>
    isManager.value && !isCompactViewport.value ? viewMode.value : 'list',
);

const sortedFilteredEvents = computed(() =>
    [...filteredEvents.value].sort(
        (a, b) =>
            new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
    ),
);

const managerScheduleColumns = computed<InstructorScheduleColumn[]>(() => {
    if (!isManager.value) {
        return [];
    }

    const columns = new Map<string, InstructorScheduleColumn>();

    for (const instructor of instructors.value) {
        const userId = instructor.userId?.trim();
        const id = userId || instructor.id;
        const name = formatInstructorDisplayName(instructor);
        const column = {
            id,
            name,
            initials: initialsForName(name),
            events: [],
        };

        columns.set(id, column);
        columns.set(instructor.id, column);
    }

    for (const event of sortedFilteredEvents.value) {
        const id = event.instructor?.id?.trim() || 'without-instructor';
        const fallbackName = displayInstructorName(event);
        const existing = columns.get(id);

        if (existing) {
            existing.events.push(event);
            continue;
        }

        columns.set(id, {
            id,
            name:
                fallbackName === '-'
                    ? 'Bez przypisanego instruktora'
                    : fallbackName,
            initials:
                fallbackName === '-' ? '?' : initialsForName(fallbackName),
            events: [event],
        });
    }

    return Array.from(
        new Map(columns.values().map((column) => [column.id, column])).values(),
    ).sort((a, b) => a.name.localeCompare(b.name, 'pl'));
});

const scheduleStartHour = computed(() => {
    const starts = sortedFilteredEvents.value
        .map((event) => hourFromIso(event.startTime))
        .filter((hour): hour is number => hour !== null);

    return Math.min(7, ...starts);
});

const scheduleEndHour = computed(() => {
    const ends = sortedFilteredEvents.value
        .map((event) => hourFromIso(event.endTime))
        .filter((hour): hour is number => hour !== null);

    return Math.max(18, ...ends);
});

const managerScheduleGridColumns = computed(() => {
    const count = Math.max(managerScheduleColumns.value.length, 1);

    return `72px repeat(${count}, minmax(190px, 1fr))`;
});

const managerScheduleRows = computed<InstructorScheduleRow[]>(() => {
    const rows: InstructorScheduleRow[] = [];

    for (
        let hour = scheduleStartHour.value;
        hour <= scheduleEndHour.value;
        hour += 1
    ) {
        rows.push({
            hour,
            label: `${String(hour).padStart(2, '0')}:00`,
            cells: managerScheduleColumns.value.map((column) => ({
                key: `${column.id}-${hour}`,
                columnId: column.id,
                events: column.events.filter(
                    (event) => hourFromIso(event.startTime) === hour,
                ),
            })),
        });
    }

    return rows;
});

let loadSeq = 0;

async function loadEvents(): Promise<void> {
    const day = selectedDate.value;
    const seq = ++loadSeq;

    errorMessage.value = null;
    isLoading.value = true;

    try {
        let raw: ScheduleLessonItem[];

        if (isManager.value) {
            const sid = schoolId.value;

            if (!sid) {
                errorMessage.value =
                    'Brak identyfikatora szkoły. Ustaw domyślną OSK w swoim profilu lub dodaj ?schoolId= do adresu.';
                events.value = [];
                instructors.value = [];

                return;
            }

            const [scheduleRows, instructorRows] = await Promise.all([
                fetchSchoolSchedule(sid, day, day),
                fetchInstructorsList(sid),
            ]);

            raw = scheduleRows;

            if (seq === loadSeq) {
                instructors.value = instructorRows;
            }
        } else {
            instructors.value = [];
            raw = await fetchMySchedule(day, day);
        }

        if (seq !== loadSeq) {
            return;
        }

        events.value = raw.filter(isScheduleInstructorEvent);
    } catch (err: unknown) {
        if (seq !== loadSeq) {
            return;
        }

        events.value = [];
        instructors.value = [];
        errorMessage.value = getApiFetchErrorMessage(
            err,
            'Nie udało się wczytać wydarzeń.',
        );
    } finally {
        if (seq === loadSeq) {
            isLoading.value = false;
        }
    }
}

watch(selectedDate, () => {
    void loadEvents();
});

onMounted(() => {
    updateViewportMode();
    window.addEventListener('resize', updateViewportMode);

    void loadEvents();
});

onBeforeUnmount(() => {
    window.removeEventListener('resize', updateViewportMode);
});

function handlePrevDay(): void {
    const d = new Date(`${selectedDate.value}T00:00:00`);

    d.setDate(d.getDate() - 1);
    selectedDate.value = formatDateOnly(d);
}

function handleNextDay(): void {
    const d = new Date(`${selectedDate.value}T00:00:00`);

    d.setDate(d.getDate() + 1);
    selectedDate.value = formatDateOnly(d);
}

function handleTodayClick(): void {
    selectedDate.value = formatDateOnly(new Date());
}

function handleCalendarUpdate(val: DateValue | DateValue[]): void {
    const single = Array.isArray(val) ? val[0] : val;

    if (!single) {
        return;
    }

    selectedDate.value = formatDateOnly(toDate(single));
    isCalendarOpen.value = false;
}

function handleStatusFilterSelect(opt: StatusFilterOption): void {
    selectedStatus.value = opt;
}

function handleStatusFilterOptionSelect(opt: string): void {
    handleStatusFilterSelect(opt as StatusFilterOption);
}

function handleStatusChanged(payload: { id: string; status: string }): void {
    const idx = events.value.findIndex((e) => e.id === payload.id);

    if (idx < 0) {
        return;
    }

    const row = events.value[idx];

    if (!row) {
        return;
    }

    const copy = events.value.slice();

    copy[idx] = { ...row, status: payload.status };
    events.value = copy;
}

function updateViewportMode(): void {
    isCompactViewport.value = window.innerWidth < 768;
}

function isoToHm(iso: string): string {
    const d = new Date(iso);

    if (Number.isNaN(d.getTime())) {
        return iso;
    }

    return new Intl.DateTimeFormat('pl-PL', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    }).format(d);
}

function hourFromIso(iso: string): number | null {
    const d = new Date(iso);

    if (Number.isNaN(d.getTime())) {
        return null;
    }

    return d.getHours();
}

function initialsForName(name: string): string {
    const parts = name
        .split(/\s+/)
        .map((part) => part.trim())
        .filter((part) => part.length > 0);

    if (parts.length === 0) {
        return '?';
    }

    return parts
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? '')
        .join('');
}

function displayInstructorName(item: ScheduleLessonItem): string {
    const ins = item.instructor;

    if (!ins) {
        return '-';
    }

    return `${ins.firstName} ${ins.lastName}`.trim() || '-';
}

function displayParticipantCount(item: ScheduleLessonItem): string {
    if (typeof item.participantCount === 'number') {
        const cap =
            typeof item.capacity === 'number' ? `/${item.capacity}` : '';

        return `${item.participantCount}${cap}`;
    }

    if (typeof item.capacity === 'number') {
        return `0/${item.capacity}`;
    }

    return '-';
}

function displayEventPrimary(item: ScheduleLessonItem): string {
    const time = isoToHm(item.startTime);
    const type = eventTypeLabel(item.type);

    if (!isManager.value) {
        return `${time} · ${type}`;
    }

    const instructor = displayInstructorName(item);

    return instructor === '-'
        ? `${time} · ${type}`
        : `${time} · ${type} · ${instructor}`;
}

function displayEventMeta(item: ScheduleLessonItem): string {
    const parts = [
        `${isoToHm(item.startTime)}-${isoToHm(item.endTime)}`,
        `${displayParticipantCount(item)} kursantów`,
    ];

    if (item.vehicle?.name || item.vehicle?.registrationNumber) {
        parts.push(
            [item.vehicle.name, item.vehicle.registrationNumber]
                .filter(Boolean)
                .join(' · '),
        );
    }

    return parts.join(' · ');
}

function eventTypeBadgeClasses(type: string): string {
    const t = String(type).trim().toUpperCase();

    if (t === 'THEORY') {
        return 'border-violet-500/40 bg-violet-500/15 text-violet-800 dark:text-violet-200';
    }

    if (t === 'DRIVE' || t === 'PRACTICE') {
        return 'border-emerald-500/40 bg-emerald-500/15 text-emerald-800 dark:text-emerald-200';
    }

    return '';
}

function eventTypeLabel(type: string): string {
    const t = String(type).trim().toUpperCase();

    if (t === 'THEORY') {
        return 'Teoria';
    }

    if (t === 'DRIVE' || t === 'PRACTICE') {
        return 'Jazda praktyczna';
    }

    return type;
}
</script>

<template>
    <div class="space-y-5">
        <PageHeader
            :title="isManager ? 'Wydarzenia dnia' : 'Moje wydarzenia'"
            :description="pageDescription"
        >
            <template #actions>
                <UiPopover v-model:open="isCalendarOpen">
                    <UiPopoverTrigger as-child>
                        <UiButton
                            type="button"
                            variant="outline"
                            class="bg-background h-10 rounded-xl px-4 font-semibold shadow-sm"
                            :disabled="isLoading"
                            aria-label="Wybierz dzień w kalendarzu"
                        >
                            <CalendarDays
                                class="mr-2 size-4"
                                aria-hidden="true"
                            />
                            {{ selectedDate }}
                        </UiButton>
                    </UiPopoverTrigger>
                    <UiPopoverContent class="w-auto p-0" align="end">
                        <UiCalendar
                            :week-starts-on="1"
                            :min-value="WEEK_PICKER_CALENDAR_MIN"
                            :max-value="WEEK_PICKER_CALENDAR_MAX"
                            :model-value="calendarSelected"
                            locale="pl-PL"
                            @update:model-value="handleCalendarUpdate"
                        />
                    </UiPopoverContent>
                </UiPopover>
            </template>
        </PageHeader>

        <EventsDayNavigation
            :selected-date-label="selectedDateLabel"
            :is-loading="isLoading"
            @previous="handlePrevDay"
            @today="handleTodayClick"
            @next="handleNextDay"
        />
        <div
            class="grid gap-4"
            :class="
                effectiveViewMode === 'grid'
                    ? ''
                    : 'xl:grid-cols-[minmax(0,1.08fr)_minmax(340px,0.92fr)]'
            "
        >
            <UiCard class="overflow-hidden rounded-2xl shadow-sm">
                <UiCardHeader
                    class="border-border flex flex-row items-start justify-between gap-4 border-b p-5 pt-0"
                >
                    <div class="space-y-1">
                        <UiCardTitle class="text-xl font-extrabold">
                            Wydarzenia dnia
                        </UiCardTitle>
                        <UiCardDescription>
                            {{ pageDescription }}
                        </UiCardDescription>
                    </div>
                    <div
                        class="flex shrink-0 flex-wrap items-center justify-end gap-2"
                    >
                        <div
                            v-if="isManager && !isCompactViewport"
                            class="border-border bg-muted/30 flex rounded-xl border p-1"
                            role="group"
                            aria-label="Tryb widoku wydarzeń"
                        >
                            <button
                                type="button"
                                class="rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors"
                                :class="
                                    effectiveViewMode === 'grid'
                                        ? 'bg-background text-foreground shadow-sm'
                                        : 'text-muted-foreground hover:text-foreground'
                                "
                                :aria-pressed="effectiveViewMode === 'grid'"
                                @click="viewMode = 'grid'"
                            >
                                Harmonogram
                            </button>
                            <button
                                type="button"
                                class="rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors"
                                :class="
                                    effectiveViewMode === 'list'
                                        ? 'bg-background text-foreground shadow-sm'
                                        : 'text-muted-foreground hover:text-foreground'
                                "
                                :aria-pressed="effectiveViewMode === 'list'"
                                @click="viewMode = 'list'"
                            >
                                Lista
                            </button>
                        </div>

                        <UiBadge
                            v-if="filteredEvents.length > 0"
                            variant="outline"
                            class="rounded-full border-sky-200 bg-sky-50 px-3 py-1 text-sky-700"
                        >
                            {{ visibleEventsLabel }}
                        </UiBadge>
                    </div>
                </UiCardHeader>

                <UiCardContent class="space-y-4 px-4 py-0">
                    <EventsStatusFilter
                        :options="STATUS_FILTER_OPTIONS"
                        :selected="selectedStatus"
                        :label-for-option="statusFilterLabelForOption"
                        @select="handleStatusFilterOptionSelect"
                    />
                    <div
                        v-if="
                            isLoading || isSchoolLoading || isInstructorsLoading
                        "
                        class="space-y-3"
                        role="status"
                    >
                        <UiSkeleton class="h-16 rounded-xl" />
                        <UiSkeleton class="h-16 rounded-xl" />
                        <UiSkeleton class="h-16 rounded-xl" />
                    </div>

                    <ErrorState
                        v-else-if="errorMessage"
                        title="Nie udało się wczytać wydarzeń"
                        :description="errorMessage"
                        @retry="loadEvents"
                    />

                    <EmptyState
                        v-else-if="
                            filteredEvents.length === 0 &&
                            (effectiveViewMode !== 'grid' ||
                                managerScheduleColumns.length === 0)
                        "
                        :title="
                            events.length === 0
                                ? 'Brak wydarzeń w wybranym dniu'
                                : 'Brak wydarzeń dla wybranego statusu'
                        "
                        :description="
                            events.length === 0
                                ? 'Zmień dzień lub wróć do dzisiejszego widoku.'
                                : 'Wybierz inny status, aby zobaczyć pozostałe wydarzenia.'
                        "
                    />

                    <div
                        v-else-if="effectiveViewMode === 'grid'"
                        class="overflow-hidden rounded-2xl border"
                    >
                        <div class="overflow-x-auto">
                            <div class="min-w-[920px]">
                                <div
                                    class="bg-muted/40 border-border sticky top-0 z-10 grid border-b"
                                    :style="{
                                        gridTemplateColumns:
                                            managerScheduleGridColumns,
                                    }"
                                >
                                    <div
                                        class="text-muted-foreground flex h-20 items-end px-3 pb-3 text-xs font-semibold"
                                    >
                                        Godz.
                                    </div>
                                    <div
                                        v-for="column in managerScheduleColumns"
                                        :key="column.id"
                                        class="border-border flex min-w-0 flex-col items-center justify-center gap-2 border-l px-3 py-3 text-center"
                                    >
                                        <div
                                            class="flex size-10 items-center justify-center rounded-full bg-sky-100 text-sm font-extrabold text-sky-700"
                                        >
                                            {{ column.initials }}
                                        </div>
                                        <p
                                            class="text-foreground max-w-full truncate text-sm font-bold"
                                            :title="column.name"
                                        >
                                            {{ column.name }}
                                        </p>
                                    </div>
                                </div>

                                <div
                                    v-for="row in managerScheduleRows"
                                    :key="row.hour"
                                    class="border-border grid min-h-24 border-b last:border-b-0"
                                    :style="{
                                        gridTemplateColumns:
                                            managerScheduleGridColumns,
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
                                        <article
                                            v-for="event in cell.events"
                                            :key="event.id"
                                            class="rounded-xl border border-sky-200 bg-sky-50/80 p-3 text-sky-950 shadow-sm"
                                        >
                                            <div
                                                class="flex items-start justify-between gap-2"
                                            >
                                                <p
                                                    class="text-sm font-extrabold"
                                                >
                                                    {{
                                                        isoToHm(event.startTime)
                                                    }}
                                                    -
                                                    {{ isoToHm(event.endTime) }}
                                                </p>
                                                <UiBadge
                                                    variant="outline"
                                                    class="bg-background/70 rounded-full text-[10px] font-semibold"
                                                    :class="
                                                        eventTypeBadgeClasses(
                                                            event.type,
                                                        )
                                                    "
                                                >
                                                    {{
                                                        eventTypeLabel(
                                                            event.type,
                                                        )
                                                    }}
                                                </UiBadge>
                                            </div>
                                            <p
                                                class="mt-1 text-xs font-medium text-sky-700"
                                            >
                                                {{
                                                    displayParticipantCount(
                                                        event,
                                                    )
                                                }}
                                                kursantów
                                            </p>
                                            <div
                                                class="mt-3 flex items-center justify-between gap-2"
                                                @click.stop
                                            >
                                                <ManagerEventStatusSelect
                                                    :event-id="event.id"
                                                    :status="event.status"
                                                    compact
                                                    @status-changed="
                                                        handleStatusChanged
                                                    "
                                                />
                                            </div>
                                        </article>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div v-else class="space-y-3">
                        <article
                            v-for="event in sortedFilteredEvents"
                            :key="event.id"
                            class="border-border bg-background hover:bg-muted/20 rounded-xl border p-4 transition-colors"
                        >
                            <div
                                class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between"
                            >
                                <div class="min-w-0 space-y-2">
                                    <div
                                        class="flex min-w-0 flex-wrap items-center gap-2"
                                    >
                                        <p
                                            class="text-foreground min-w-0 font-extrabold"
                                        >
                                            {{ displayEventPrimary(event) }}
                                        </p>
                                        <UiBadge
                                            variant="outline"
                                            class="rounded-full text-xs font-semibold"
                                            :class="
                                                eventTypeBadgeClasses(
                                                    event.type,
                                                )
                                            "
                                        >
                                            {{ eventTypeLabel(event.type) }}
                                        </UiBadge>
                                    </div>
                                    <p
                                        class="text-muted-foreground text-sm leading-relaxed"
                                    >
                                        {{ displayEventMeta(event) }}
                                    </p>
                                </div>

                                <div
                                    class="flex shrink-0 items-center justify-start md:justify-end"
                                    @click.stop
                                >
                                    <ManagerEventStatusSelect
                                        v-if="isManager"
                                        :event-id="event.id"
                                        :status="event.status"
                                        compact
                                        @status-changed="handleStatusChanged"
                                    />
                                    <UiBadge
                                        v-else
                                        :variant="
                                            instructorEventStatusBadgeVariant(
                                                normalizeInstructorEventStatus(
                                                    event.status,
                                                ),
                                            )
                                        "
                                        class="shrink-0 rounded-full text-xs font-normal"
                                    >
                                        {{
                                            labelForInstructorEventStatusRaw(
                                                event.status,
                                            )
                                        }}
                                    </UiBadge>
                                </div>
                            </div>
                        </article>
                    </div>
                </UiCardContent>
            </UiCard>

            <UiCard class="overflow-hidden rounded-2xl shadow-sm">
                <UiCardHeader class="border-border border-b p-5 pt-0">
                    <UiCardTitle class="text-xl font-extrabold">
                        Podsumowanie dnia
                    </UiCardTitle>
                    <UiCardDescription>
                        Dane wyliczone z aktualnie wczytanych wydarzeń.
                    </UiCardDescription>
                </UiCardHeader>

                <UiCardContent class="space-y-3 px-4 py-0">
                    <div class="border-border rounded-xl border p-4">
                        <div class="flex items-start gap-3">
                            <div
                                class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600"
                            >
                                <ListChecks class="size-5" aria-hidden="true" />
                            </div>
                            <div>
                                <p class="font-extrabold">
                                    {{ events.length }} wydarzeń
                                </p>
                                <p class="text-muted-foreground text-sm">
                                    Wszystkie wczytane dla wybranego dnia
                                </p>
                            </div>
                        </div>
                    </div>

                    <div class="border-border rounded-xl border p-4">
                        <div class="flex items-start gap-3">
                            <div
                                class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600"
                            >
                                <Clock3 class="size-5" aria-hidden="true" />
                            </div>
                            <div>
                                <p class="font-extrabold">
                                    {{ plannedEvents }} zaplanowane
                                </p>
                                <p class="text-muted-foreground text-sm">
                                    Status: zaplanowane
                                </p>
                            </div>
                        </div>
                    </div>

                    <div class="border-border rounded-xl border p-4">
                        <div class="flex items-start gap-3">
                            <div
                                class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600"
                            >
                                <Users class="size-5" aria-hidden="true" />
                            </div>
                            <div>
                                <p class="font-extrabold">
                                    {{ participantTotal }} kursantów
                                </p>
                                <p class="text-muted-foreground text-sm">
                                    Suma uczestników w wydarzeniach
                                </p>
                            </div>
                        </div>
                    </div>

                    <div
                        v-if="attentionEvents.length > 0"
                        class="rounded-xl border border-amber-200 bg-amber-50/60 p-4 text-amber-900"
                    >
                        <p class="font-extrabold">
                            {{ attentionEvents.length }} wymagają uwagi
                        </p>
                        <p class="text-sm">
                            Anulowane lub oznaczone jako nieobecność.
                        </p>
                    </div>
                </UiCardContent>
            </UiCard>
        </div>
    </div>
</template>
