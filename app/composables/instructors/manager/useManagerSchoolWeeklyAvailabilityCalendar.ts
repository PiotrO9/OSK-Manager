import type { CalendarDate, DateValue } from '@internationalized/date';
import { toDate } from 'reka-ui/date';
import { useCoursesApi } from '~/composables/courses/useCoursesApi';
import { useSchoolAvailabilitySlotsApi } from '~/composables/schools/useSchoolAvailabilitySlotsApi';
import type { CourseListItem } from '~/types/courses/course';
import type {
    LessonBookingAggregatedSlot,
    LessonBookingSlotContext,
} from '~/types/lessons/lessonBooking';
import type { SchoolAvailabilitySlot } from '~/types/schools/schoolAvailabilitySlots';
import { getApiFetchErrorMessage } from '~/utils/api/apiFetchErrorMessage';
import {
    formatDateOnly,
    getMonday,
    WEEK_PICKER_CALENDAR_MAX,
    WEEK_PICKER_CALENDAR_MIN,
    weekCalendarDatesFromMonday,
    weekRangeFromMonday,
} from '~/utils/date/weeklyCalendarDates';
import {
    buildSchoolAvailabilityAggregatedSlots,
    buildSchoolAvailabilityCalendarFiltersPayload,
    getSchoolAvailabilitySlotTopPx,
    isSchoolAvailabilitySlotInsideTimeline,
    MANAGER_SCHOOL_AVAILABILITY_BASE_HOUR,
    MANAGER_SCHOOL_AVAILABILITY_END_HOUR,
    MANAGER_SCHOOL_AVAILABILITY_GRID_HEIGHT_PX,
} from '~/utils/schools/managerSchoolWeeklyAvailabilityCalendar';

export function useManagerSchoolWeeklyAvailabilityCalendar(
    schoolId: () => string,
) {
    const { addToast } = useAppToast();
    const isSlotChoiceOpen = ref(false);
    const isBookingOpen = ref(false);
    const isTheoryCreateOpen = ref(false);
    const isStudentPickerOpen = ref(false);
    const eventForPicker = ref<{ id: string; capacity: number | null } | null>(
        null,
    );
    const activeSlotCtx = ref<LessonBookingSlotContext | null>(null);
    const courses = ref<CourseListItem[]>([]);
    const { fetchList: fetchCoursesList } = useCoursesApi();

    async function loadSchoolCourses(): Promise<void> {
        const sid = schoolId().trim();

        if (!sid) {
            courses.value = [];

            return;
        }

        courses.value = await fetchCoursesList(sid).catch(() => []);
    }

    const weekStart = ref<Date>(getMonday(new Date()));
    const slots = ref<SchoolAvailabilitySlot[]>([]);
    const errorMessage = ref<string | null>(null);
    const isCalendarOpen = ref(false);
    const calendarSelected = shallowRef<CalendarDate[]>(
        weekCalendarDatesFromMonday(getMonday(new Date())),
    );
    const { fetchSlots, isLoading } = useSchoolAvailabilitySlotsApi();

    let fetchSeq = 0;

    const hourLabels = computed(() =>
        Array.from(
            {
                length:
                    MANAGER_SCHOOL_AVAILABILITY_END_HOUR -
                    MANAGER_SCHOOL_AVAILABILITY_BASE_HOUR,
            },
            (_, i) => MANAGER_SCHOOL_AVAILABILITY_BASE_HOUR + i,
        ),
    );

    const weekDays = computed(() => {
        const out: {
            date: Date;
            dateStr: string;
            header: string;
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

        return `${weekStart.value.toLocaleDateString('pl-PL', opts)} – ${end.toLocaleDateString('pl-PL', opts)}`;
    });

    const aggregatedSlotsFlat = computed((): LessonBookingAggregatedSlot[] =>
        buildSchoolAvailabilityAggregatedSlots(slots.value).filter(
            isSchoolAvailabilitySlotInsideTimeline,
        ),
    );

    const aggregatedSlotsByDate = computed(() => {
        const map = new Map<string, LessonBookingAggregatedSlot[]>();

        for (const a of aggregatedSlotsFlat.value) {
            if (!map.has(a.date)) {
                map.set(a.date, []);
            }

            map.get(a.date)!.push(a);
        }

        for (const arr of map.values()) {
            arr.sort((x, y) => x.startTime.localeCompare(y.startTime));
        }

        return map;
    });

    function aggregatedSlotsForDate(
        dateStr: string,
    ): LessonBookingAggregatedSlot[] {
        return aggregatedSlotsByDate.value.get(dateStr) ?? [];
    }

    function handleSlotClick(slot: LessonBookingAggregatedSlot): void {
        const sid = schoolId().trim();

        if (!sid) {
            return;
        }

        activeSlotCtx.value = {
            date: slot.date,
            startTime: slot.startTime,
            endTime: slot.endTime,
            schoolId: sid,
            availableInstructors: slot.availableInstructors,
        };
        isSlotChoiceOpen.value = true;
    }

    function handlePickLessonFromChoice(): void {
        isBookingOpen.value = true;
    }

    function handlePickTheoryFromChoice(): void {
        isTheoryCreateOpen.value = true;
    }

    function handleTheoryEventCreated(payload: {
        eventId: string;
        capacity: number | null;
    }): void {
        eventForPicker.value = {
            id: payload.eventId,
            capacity: payload.capacity,
        };
        isStudentPickerOpen.value = true;
    }

    watch(isStudentPickerOpen, (open) => {
        if (!open) {
            eventForPicker.value = null;
            void loadWeek();
        }
    });

    function handleBookingBooked(): void {
        void loadWeek();
        addToast({
            title: 'Kalendarz odświeżony',
            description: 'Sloty zostały ponownie wczytane.',
            variant: 'success',
        });
    }

    async function loadWeek(): Promise<void> {
        const sid = schoolId().trim();

        if (!sid) {
            slots.value = [];
            errorMessage.value = null;

            return;
        }

        const seq = ++fetchSeq;

        errorMessage.value = null;

        const { dateFrom, dateTo } = weekRangeFromMonday(weekStart.value);

        try {
            const { slots: data } = await fetchSlots(
                sid,
                dateFrom,
                dateTo,
                buildSchoolAvailabilityCalendarFiltersPayload(),
            );

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
        schoolId,
        () => {
            void loadSchoolCourses();
        },
        { immediate: true },
    );

    watch(
        [weekStart, schoolId],
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
        BASE_HOUR: MANAGER_SCHOOL_AVAILABILITY_BASE_HOUR,
        END_HOUR: MANAGER_SCHOOL_AVAILABILITY_END_HOUR,
        GRID_HEIGHT_PX: MANAGER_SCHOOL_AVAILABILITY_GRID_HEIGHT_PX,
        WEEK_PICKER_CALENDAR_MIN,
        WEEK_PICKER_CALENDAR_MAX,
        isSlotChoiceOpen,
        isBookingOpen,
        isTheoryCreateOpen,
        isStudentPickerOpen,
        eventForPicker,
        activeSlotCtx,
        courses,
        errorMessage,
        isCalendarOpen,
        calendarSelected,
        isLoading,
        hourLabels,
        weekDays,
        weekRangeLabel,
        aggregatedSlotsFlat,
        aggregatedSlotsForDate,
        slotTopPx: getSchoolAvailabilitySlotTopPx,
        handleSlotClick,
        handlePickLessonFromChoice,
        handlePickTheoryFromChoice,
        handleTheoryEventCreated,
        handleBookingBooked,
        handlePrevWeek,
        handleNextWeek,
        handleCalendarUpdate,
        handleKeyDownWeekNav,
    };
}
