import type { CalendarDate, DateValue } from '@internationalized/date';
import { parseDate } from '@internationalized/date';
import { toDate } from 'reka-ui/date';
import { getApiFetchErrorMessage } from '~/utils/api/apiFetchErrorMessage';
import type { ScheduleLessonItem } from '~/types/schedule/schedule';
import {
    formatInstructorDisplayName,
    type InstructorListItem,
} from '~/types/instructors/instructor';
import type { EventStatusCode } from '~/types/events/instructorEvent';
import { isScheduleInstructorEvent } from '~/utils/schedule/scheduleInstructorEvent';
import {
    INSTRUCTOR_EVENT_STATUS_LABELS,
    INSTRUCTOR_EVENT_STATUS_OPTIONS,
    normalizeInstructorEventStatus,
} from '~/utils/events/instructorEventStatusDisplay';
import { formatDateOnly } from '~/utils/date/weeklyCalendarDates';

export type EventsDayViewMode = 'grid' | 'list';
export type EventsDayStatusFilterOption = 'ALL' | EventStatusCode;

export interface InstructorScheduleColumn {
    id: string;
    name: string;
    initials: string;
    events: ScheduleLessonItem[];
}

export interface InstructorScheduleRow {
    hour: number;
    label: string;
    cells: {
        key: string;
        columnId: string;
        events: ScheduleLessonItem[];
    }[];
}

export const EVENTS_DAY_STATUS_FILTER_OPTIONS: readonly EventsDayStatusFilterOption[] =
    ['ALL', ...INSTRUCTOR_EVENT_STATUS_OPTIONS];

export function useEventsDayPage() {
    const { session } = useAuthSession();
    const { fetchSchoolSchedule, isLoading: isSchoolLoading } =
        useSchoolScheduleApi();
    const { fetchMySchedule } = useScheduleApi();
    const {
        fetchList: fetchInstructorsList,
        isListLoading: isInstructorsLoading,
    } = useInstructorsApi();

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
    const selectedStatus = ref<EventsDayStatusFilterOption>('ALL');
    const isCalendarOpen = ref(false);
    const viewMode = ref<EventsDayViewMode>('grid');
    const isCompactViewport = ref(false);

    const calendarSelected = computed<CalendarDate>(() =>
        parseDate(selectedDate.value),
    );

    const filteredEvents = computed(() =>
        events.value.filter(
            (e) =>
                selectedStatus.value === 'ALL' ||
                e.status === selectedStatus.value,
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
            ? 'Dzienne lekcje, teoria i bloki czasu instruktorĂłw.'
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

    const effectiveViewMode = computed<EventsDayViewMode>(() =>
        isManager.value && !isCompactViewport.value ? viewMode.value : 'list',
    );

    const sortedFilteredEvents = computed(() =>
        [...filteredEvents.value].sort(
            (a, b) =>
                new Date(a.startTime).getTime() -
                new Date(b.startTime).getTime(),
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
            new Map(
                columns.values().map((column) => [column.id, column]),
            ).values(),
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
                        'Brak identyfikatora szkoĹ‚y. Ustaw domyĹ›lnÄ… OSK w swoim profilu lub dodaj ?schoolId= do adresu.';
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
                'Nie udaĹ‚o siÄ™ wczytaÄ‡ wydarzeĹ„.',
            );
        } finally {
            if (seq === loadSeq) {
                isLoading.value = false;
            }
        }
    }

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

    function handleStatusFilterOptionSelect(opt: string): void {
        selectedStatus.value = opt as EventsDayStatusFilterOption;
    }

    function handleStatusChanged(payload: {
        id: string;
        status: string;
    }): void {
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

    return {
        attentionEvents,
        calendarSelected,
        effectiveViewMode,
        errorMessage,
        events,
        filteredEvents,
        handleCalendarUpdate,
        handleNextDay,
        handlePrevDay,
        handleStatusChanged,
        handleStatusFilterOptionSelect,
        handleTodayClick,
        isCalendarOpen,
        isCompactViewport,
        isInstructorsLoading,
        isLoading,
        isManager,
        isSchoolLoading,
        loadEvents,
        managerScheduleColumns,
        managerScheduleGridColumns,
        managerScheduleRows,
        pageDescription,
        participantTotal,
        plannedEvents,
        selectedDate,
        selectedDateLabel,
        selectedStatus,
        sortedFilteredEvents,
        viewMode,
        visibleEventsLabel,
    };
}

export function statusFilterLabel(opt: EventsDayStatusFilterOption): string {
    if (opt === 'ALL') {
        return 'Wszystkie';
    }

    return INSTRUCTOR_EVENT_STATUS_LABELS[opt];
}

export function statusFilterLabelForOption(opt: string): string {
    return statusFilterLabel(opt as EventsDayStatusFilterOption);
}

export function isoToHm(iso: string): string {
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

export function displayInstructorName(item: ScheduleLessonItem): string {
    const ins = item.instructor;

    if (!ins) {
        return '-';
    }

    return `${ins.firstName} ${ins.lastName}`.trim() || '-';
}

export function displayParticipantCount(item: ScheduleLessonItem): string {
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

export function displayEventPrimary(
    item: ScheduleLessonItem,
    isManager: boolean,
): string {
    const time = isoToHm(item.startTime);
    const type = eventTypeLabel(item.type);

    if (!isManager) {
        return `${time} Â· ${type}`;
    }

    const instructor = displayInstructorName(item);

    return instructor === '-'
        ? `${time} Â· ${type}`
        : `${time} Â· ${type} Â· ${instructor}`;
}

export function displayEventMeta(item: ScheduleLessonItem): string {
    const parts = [
        `${isoToHm(item.startTime)}-${isoToHm(item.endTime)}`,
        `${displayParticipantCount(item)} kursantĂłw`,
    ];

    if (item.vehicle?.name || item.vehicle?.registrationNumber) {
        parts.push(
            [item.vehicle.name, item.vehicle.registrationNumber]
                .filter(Boolean)
                .join(' Â· '),
        );
    }

    return parts.join(' Â· ');
}

export function eventTypeBadgeClasses(type: string): string {
    const t = String(type).trim().toUpperCase();

    if (t === 'THEORY') {
        return 'border-violet-500/40 bg-violet-500/15 text-violet-800 dark:text-violet-200';
    }

    if (t === 'DRIVE' || t === 'PRACTICE') {
        return 'border-emerald-500/40 bg-emerald-500/15 text-emerald-800 dark:text-emerald-200';
    }

    return '';
}

export function eventTypeLabel(type: string): string {
    const t = String(type).trim().toUpperCase();

    if (t === 'THEORY') {
        return 'Teoria';
    }

    if (t === 'DRIVE' || t === 'PRACTICE') {
        return 'Jazda praktyczna';
    }

    return type;
}
