import type { CalendarDate, DateValue } from '@internationalized/date';
import { toDate } from 'reka-ui/date';
import { useInstructorSlotsApi } from '~/composables/instructors/useInstructorSlotsApi';
import type { AvailabilitySlot } from '~/types/instructors/instructorSlots';
import { getApiFetchErrorMessage } from '~/utils/api/apiFetchErrorMessage';
import {
    getMonday,
    WEEK_PICKER_CALENDAR_MAX,
    WEEK_PICKER_CALENDAR_MIN,
    weekCalendarDatesFromMonday,
    weekRangeFromMonday,
} from '~/utils/date/weeklyCalendarDates';
import {
    buildManagerInstructorWeekDays,
    formatManagerInstructorWeekRangeCompactLabel,
    formatManagerInstructorWeekRangeLabel,
    getManagerInstructorBusiestDay,
    getManagerInstructorEarliestSlotLabel,
    getManagerInstructorSlotTopPx,
    groupManagerInstructorSlotsByDate,
    MANAGER_INSTRUCTOR_WEEK_BASE_HOUR,
    MANAGER_INSTRUCTOR_WEEK_END_HOUR,
    MANAGER_INSTRUCTOR_WEEK_GRID_HEIGHT_PX,
} from '~/utils/instructors/managerInstructorWeeklyCalendar';

export function useManagerInstructorWeeklyCalendar(instructorId: () => string) {
    const weekStart = ref<Date>(getMonday(new Date()));
    const slots = ref<AvailabilitySlot[]>([]);
    const errorMessage = ref<string | null>(null);
    const isCalendarOpen = ref(false);

    const calendarSelected = shallowRef<CalendarDate[]>(
        weekCalendarDatesFromMonday(getMonday(new Date())),
    );

    const { fetchSlots, isLoading } = useInstructorSlotsApi(instructorId);

    let fetchSeq = 0;

    const hourLabels = computed(() =>
        Array.from(
            {
                length:
                    MANAGER_INSTRUCTOR_WEEK_END_HOUR -
                    MANAGER_INSTRUCTOR_WEEK_BASE_HOUR,
            },
            (_, i) => MANAGER_INSTRUCTOR_WEEK_BASE_HOUR + i,
        ),
    );

    const weekDays = computed(() =>
        buildManagerInstructorWeekDays(weekStart.value),
    );

    const weekRangeLabel = computed(() =>
        formatManagerInstructorWeekRangeLabel(weekStart.value),
    );

    const weekRangeCompactLabel = computed(() =>
        formatManagerInstructorWeekRangeCompactLabel(weekStart.value),
    );

    const slotsByDate = computed(() =>
        groupManagerInstructorSlotsByDate(slots.value),
    );

    const totalSlots = computed(() => slots.value.length);

    const earliestSlotLabel = computed(() =>
        getManagerInstructorEarliestSlotLabel(slots.value),
    );

    const busiestDay = computed(() =>
        getManagerInstructorBusiestDay(weekDays.value, slotsByDate.value),
    );

    function slotsForDate(dateStr: string): AvailabilitySlot[] {
        return slotsByDate.value.get(dateStr) ?? [];
    }

    async function loadWeek(): Promise<void> {
        const id = instructorId().trim();

        if (!id) {
            slots.value = [];
            errorMessage.value = null;

            return;
        }

        const seq = ++fetchSeq;

        errorMessage.value = null;

        const { dateFrom, dateTo } = weekRangeFromMonday(weekStart.value);

        try {
            const data = await fetchSlots(dateFrom, dateTo);

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
        [weekStart, instructorId],
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

    return {
        BASE_HOUR: MANAGER_INSTRUCTOR_WEEK_BASE_HOUR,
        END_HOUR: MANAGER_INSTRUCTOR_WEEK_END_HOUR,
        GRID_HEIGHT_PX: MANAGER_INSTRUCTOR_WEEK_GRID_HEIGHT_PX,
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
        slotTopPx: getManagerInstructorSlotTopPx,
        handlePrevWeek,
        handleNextWeek,
        handleCalendarUpdate,
        handleKeyDownWeekNav,
    };
}
