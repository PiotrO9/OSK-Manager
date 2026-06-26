import type { CalendarDate, DateValue } from '@internationalized/date';
import { toDate } from 'reka-ui/date';
import { useInstructorSlotsApi } from '~/composables/instructors/useInstructorSlotsApi';
import type { AvailabilitySlot } from '~/types/instructors/instructorSlots';
import { getApiFetchErrorMessage } from '~/utils/api/apiFetchErrorMessage';
import {
    formatDateOnly,
    getMonday,
    WEEK_PICKER_CALENDAR_MAX,
    WEEK_PICKER_CALENDAR_MIN,
    weekCalendarDatesFromMonday,
    weekRangeFromMonday,
} from '~/utils/date/weeklyCalendarDates';

const BASE_HOUR = 7;
const END_HOUR = 19;
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

export function useManagerInstructorWeeklyCalendar(instructorId: () => string) {
    const weekStart = ref<Date>(getMonday(new Date()));
    const slots = ref<AvailabilitySlot[]>([]);
    const errorMessage = ref<string | null>(null);
    const isCalendarOpen = ref(false);

    const calendarSelected = ref<CalendarDate[]>(
        weekCalendarDatesFromMonday(getMonday(new Date())),
    );

    const { fetchSlots, isLoading } = useInstructorSlotsApi(instructorId);

    let fetchSeq = 0;

    const hourLabels = computed(() =>
        Array.from({ length: END_HOUR - BASE_HOUR }, (_, i) => BASE_HOUR + i),
    );

    const weekDays = computed(() => {
        const out: {
            date: Date;
            dateStr: string;
            header: string;
            shortHeader: string;
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
                shortHeader: d.toLocaleDateString('pl-PL', {
                    weekday: 'short',
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

        return `${weekStart.value.toLocaleDateString('pl-PL', opts)} - ${end.toLocaleDateString('pl-PL', opts)}`;
    });

    const weekRangeCompactLabel = computed(() => {
        const end = new Date(
            weekStart.value.getFullYear(),
            weekStart.value.getMonth(),
            weekStart.value.getDate() + 6,
        );

        const startDay = weekStart.value.toLocaleDateString('pl-PL', {
            day: '2-digit',
        });
        const endLabel = end.toLocaleDateString('pl-PL', {
            day: '2-digit',
            month: 'long',
        });

        return `${startDay}-${endLabel}`;
    });

    const slotsByDate = computed(() => {
        const map = new Map<string, AvailabilitySlot[]>();

        for (const s of slots.value) {
            if (!map.has(s.date)) {
                map.set(s.date, []);
            }

            map.get(s.date)!.push(s);
        }

        for (const arr of map.values()) {
            arr.sort((a, b) => a.startTime.localeCompare(b.startTime));
        }

        return map;
    });

    const totalSlots = computed(() => slots.value.length);

    const earliestSlotLabel = computed(() => {
        const first = slots.value
            .map((slot) => slot.startTime)
            .filter((time) => time.trim().length > 0)
            .sort((a, b) => a.localeCompare(b))[0];

        return first ?? '-';
    });

    const busiestDay = computed(() => {
        const sorted = weekDays.value
            .map((day) => ({
                label: day.shortHeader,
                count: slotsForDate(day.dateStr).length,
            }))
            .sort((a, b) => b.count - a.count);

        const first = sorted[0];

        if (!first || first.count === 0) {
            return null;
        }

        return first;
    });

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
        BASE_HOUR,
        END_HOUR,
        GRID_HEIGHT_PX,
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
        slotTopPx,
        handlePrevWeek,
        handleNextWeek,
        handleCalendarUpdate,
        handleKeyDownWeekNav,
    };
}
