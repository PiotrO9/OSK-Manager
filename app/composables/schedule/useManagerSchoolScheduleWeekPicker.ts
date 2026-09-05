import type { DateValue } from '@internationalized/date';
import {
    getMonday,
    weekCalendarDatesFromMonday,
} from '~/utils/date/weeklyCalendarDates';
import {
    resolveManagerSchoolScheduleCalendarWeekStart,
    shiftManagerSchoolScheduleWeek,
} from '~/utils/schedule/managerSchoolScheduleCalendarWeek';

interface UseManagerSchoolScheduleWeekPickerOptions {
    isParentSchedule: () => boolean;
    parentWeekStart: () => Date | undefined;
    updateParentWeekStart: (value: Date) => void;
}

export function useManagerSchoolScheduleWeekPicker({
    isParentSchedule,
    parentWeekStart,
    updateParentWeekStart,
}: UseManagerSchoolScheduleWeekPickerOptions) {
    const localWeekStart = ref<Date>(getMonday(new Date()));
    const isCalendarOpen = ref(false);
    const calendarSelected = shallowRef<DateValue[]>(
        weekCalendarDatesFromMonday(getMonday(new Date())),
    );

    const calendarSelectedModel = computed<DateValue[]>(
        () => calendarSelected.value as unknown as DateValue[],
    );

    const activeWeekStart = computed(() => {
        const externalWeekStart = parentWeekStart();

        if (isParentSchedule() && externalWeekStart) {
            return getMonday(externalWeekStart);
        }

        return localWeekStart.value;
    });

    watch(
        activeWeekStart,
        (w) => {
            calendarSelected.value = weekCalendarDatesFromMonday(w);
        },
        { immediate: true },
    );

    function commitWeekMonday(monday: Date): void {
        const m = getMonday(monday);

        if (isParentSchedule()) {
            updateParentWeekStart(m);

            return;
        }

        localWeekStart.value = m;
    }

    function handlePrevWeek(): void {
        commitWeekMonday(
            shiftManagerSchoolScheduleWeek(activeWeekStart.value, 'prev'),
        );
    }

    function handleNextWeek(): void {
        commitWeekMonday(
            shiftManagerSchoolScheduleWeek(activeWeekStart.value, 'next'),
        );
    }

    function handleCalendarUpdate(
        value: DateValue | DateValue[] | undefined,
    ): void {
        const monday = resolveManagerSchoolScheduleCalendarWeekStart(value);

        if (!monday) {
            return;
        }

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

    return {
        activeWeekStart,
        calendarSelectedModel,
        handleCalendarUpdate,
        handleKeyDownWeekNav,
        handleNextWeek,
        handlePrevWeek,
        isCalendarOpen,
        localWeekStart,
    };
}
