import { getApiFetchErrorMessage } from '~/utils/api/apiFetchErrorMessage';
import type { ScheduleLessonItem } from '~/types/schedule/schedule';
import {
    formatInstructorDisplayName,
    type InstructorListItem,
} from '~/types/instructors/instructor';
import { isScheduleInstructorEvent } from '~/utils/schedule/scheduleInstructorEvent';
import { normalizeInstructorEventStatus } from '~/utils/events/instructorEventStatusDisplay';
import {
    displayEventsDayInstructorName,
    type EventsDayStatusFilterOption,
} from '~/utils/events/eventsDayPage';
import { useEventsDayDateSelection } from './useEventsDayDateSelection';

export type EventsDayViewMode = 'grid' | 'list';

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
    const {
        calendarSelected,
        handleCalendarUpdate,
        handleNextDay,
        handlePrevDay,
        handleTodayClick,
        isCalendarOpen,
        selectedDate,
        selectedDateLabel,
    } = useEventsDayDateSelection();
    const selectedStatus = ref<EventsDayStatusFilterOption>('ALL');
    const viewMode = ref<EventsDayViewMode>('grid');
    const isCompactViewport = ref(false);

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
            ? 'Dzienne lekcje, teoria i bloki czasu instruktorów.'
            : 'Twoje bloki czasu w wybranym dniu.',
    );

    const visibleEventsLabel = computed(() => {
        if (filteredEvents.value.length === events.value.length) {
            return `${filteredEvents.value.length}`;
        }

        return `${filteredEvents.value.length} z ${events.value.length}`;
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
            const fallbackName = displayEventsDayInstructorName(event);
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
