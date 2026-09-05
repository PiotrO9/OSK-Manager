import type { CalendarDate, DateValue } from '@internationalized/date';
import {
    getMonday,
    weekCalendarDatesFromMonday,
} from '~/utils/date/weeklyCalendarDates';
import {
    formatSchoolAvailabilityWeekRangeLabel,
    getSchoolAvailabilitySelectedWeekMonday,
} from '~/utils/schools/managerSchoolWeeklyAvailabilityCalendar';

export function useManagerSchoolAvailabilityWeekPicker() {
    const weekStart = ref<Date>(getMonday(new Date()));
    const isCalendarOpen = ref(false);
    const calendarSelected = shallowRef<CalendarDate[]>(
        weekCalendarDatesFromMonday(weekStart.value),
    );

    const weekRangeLabel = computed(() =>
        formatSchoolAvailabilityWeekRangeLabel(weekStart.value),
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
        const monday = getSchoolAvailabilitySelectedWeekMonday(value);

        if (monday === null) {
            return;
        }

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
        weekStart,
        weekRangeLabel,
        isCalendarOpen,
        calendarSelected,
        handlePrevWeek,
        handleNextWeek,
        handleCalendarUpdate,
        handleKeyDownWeekNav,
    };
}
