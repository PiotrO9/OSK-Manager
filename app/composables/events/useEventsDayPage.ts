import { getApiFetchErrorMessage } from '~/utils/api/apiFetchErrorMessage';
import type { ScheduleLessonItem } from '~/types/schedule/schedule';
import type { InstructorListItem } from '~/types/instructors/instructor';
import { isScheduleInstructorEvent } from '~/utils/schedule/scheduleInstructorEvent';
import type { EventsDayStatusFilterOption } from '~/utils/events/eventsDayPage';
import { useEventsDayDateSelection } from './useEventsDayDateSelection';
import {
    getEventsDayAttentionEvents,
    getEventsDayEffectiveViewMode,
    getEventsDayFilteredEvents,
    getEventsDayIsManager,
    getEventsDayManagerScheduleColumns,
    getEventsDayManagerScheduleRows,
    getEventsDayPageDescription,
    getEventsDayParticipantTotal,
    getEventsDayPlannedEventsCount,
    getEventsDayScheduleHourRange,
    getEventsDaySortedEvents,
    getEventsDayVisibleEventsLabel,
    type EventsDayGridInstructorColumn,
    type EventsDayGridInstructorRow,
    type EventsDayGridViewMode,
} from '~/utils/events/eventsDayScheduleGrid';

export type EventsDayViewMode = EventsDayGridViewMode;
export type InstructorScheduleColumn = EventsDayGridInstructorColumn;
export type InstructorScheduleRow = EventsDayGridInstructorRow;

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
        return getEventsDayIsManager(session.value?.role);
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
        getEventsDayFilteredEvents({
            events: events.value,
            selectedStatus: selectedStatus.value,
        }),
    );

    const attentionEvents = computed(() =>
        getEventsDayAttentionEvents(events.value),
    );

    const plannedEvents = computed(() =>
        getEventsDayPlannedEventsCount(events.value),
    );

    const participantTotal = computed(() =>
        getEventsDayParticipantTotal(events.value),
    );

    const pageDescription = computed(() =>
        getEventsDayPageDescription(isManager.value),
    );

    const visibleEventsLabel = computed(() => {
        return getEventsDayVisibleEventsLabel({
            visibleCount: filteredEvents.value.length,
            totalCount: events.value.length,
        });
    });

    const effectiveViewMode = computed<EventsDayViewMode>(() =>
        getEventsDayEffectiveViewMode({
            isManager: isManager.value,
            isCompactViewport: isCompactViewport.value,
            viewMode: viewMode.value,
        }),
    );

    const sortedFilteredEvents = computed(() =>
        getEventsDaySortedEvents(filteredEvents.value),
    );

    const managerScheduleColumns = computed<InstructorScheduleColumn[]>(() => {
        return getEventsDayManagerScheduleColumns({
            isManager: isManager.value,
            instructors: instructors.value,
            events: sortedFilteredEvents.value,
        });
    });

    const scheduleStartHour = computed(() => {
        return getEventsDayScheduleHourRange(sortedFilteredEvents.value)
            .startHour;
    });

    const scheduleEndHour = computed(() => {
        return getEventsDayScheduleHourRange(sortedFilteredEvents.value)
            .endHour;
    });

    const managerScheduleGridColumns = computed(() => {
        const count = Math.max(managerScheduleColumns.value.length, 1);

        return `72px repeat(${count}, minmax(190px, 1fr))`;
    });

    const managerScheduleRows = computed<InstructorScheduleRow[]>(() => {
        return getEventsDayManagerScheduleRows({
            columns: managerScheduleColumns.value,
            startHour: scheduleStartHour.value,
            endHour: scheduleEndHour.value,
        });
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
