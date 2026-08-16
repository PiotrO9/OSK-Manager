import type { CalendarDate, DateValue } from '@internationalized/date';
import { parseDate } from '@internationalized/date';
import { computed, ref } from 'vue';
import { toDate } from 'reka-ui/date';
import { formatDateOnly } from '~/utils/date/weeklyCalendarDates';

export interface EventsDayDateSelectionOptions {
    initialDate?: string;
    now?: () => Date;
}

export function useEventsDayDateSelection(
    options: EventsDayDateSelectionOptions = {},
) {
    const getNow = options.now ?? (() => new Date());
    const selectedDate = ref<string>(
        options.initialDate ?? formatDateOnly(getNow()),
    );
    const isCalendarOpen = ref(false);

    const calendarSelected = computed<CalendarDate>(() =>
        parseDate(selectedDate.value),
    );

    const selectedDateLabel = computed(() => {
        const d = new Date(`${selectedDate.value}T00:00:00`);

        if (Number.isNaN(d.getTime())) {
            return selectedDate.value;
        }

        const now = getNow();
        const today = formatDateOnly(now);
        const yesterday = formatDateOnly(new Date(now.getTime() - 86_400_000));
        const tomorrow = formatDateOnly(new Date(now.getTime() + 86_400_000));

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
        selectedDate.value = formatDateOnly(getNow());
    }

    function handleCalendarUpdate(
        val: DateValue | DateValue[] | undefined,
    ): void {
        if (val === undefined) {
            return;
        }

        const single = Array.isArray(val) ? val[0] : val;

        if (!single) {
            return;
        }

        selectedDate.value = formatDateOnly(toDate(single));
        isCalendarOpen.value = false;
    }

    return {
        calendarSelected,
        handleCalendarUpdate,
        handleNextDay,
        handlePrevDay,
        handleTodayClick,
        isCalendarOpen,
        selectedDate,
        selectedDateLabel,
    };
}
