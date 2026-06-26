import type { CalendarDate, DateValue } from '@internationalized/date';
import { toDate } from 'reka-ui/date';
import { useCoursesApi } from '~/composables/courses/useCoursesApi';
import { useSchoolAvailabilitySlotsApi } from '~/composables/schools/useSchoolAvailabilitySlotsApi';
import type { CourseListItem } from '~/types/courses/course';
import type { SchoolAvailabilitySlotsQueryFilters } from '~/types/schools/schoolAvailabilityFilters';
import type {
    LessonBookingAggregatedSlot,
    LessonBookingInstructorOption,
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

const BASE_HOUR = 7;
const END_HOUR = 19;
const GRID_HEIGHT_PX = (END_HOUR - BASE_HOUR) * 60;
const PX_PER_MINUTE = 1;

function buildFiltersPayload(): SchoolAvailabilitySlotsQueryFilters {
    return {
        limit: 500,
        sort: 'startTime',
    };
}

function timeToMinutes(time: string): number | null {
    const parts = time.trim().split(':').map(Number);

    if (parts.length < 2) {
        return null;
    }

    const h = parts[0];
    const m = parts[1];

    if (
        h === undefined ||
        m === undefined ||
        !Number.isFinite(h) ||
        !Number.isFinite(m)
    ) {
        return null;
    }

    return h * 60 + m;
}

function isSlotInsideTimeline(slot: LessonBookingAggregatedSlot): boolean {
    const startMin = timeToMinutes(slot.startTime);
    const endMin = timeToMinutes(slot.endTime);
    const baseMin = BASE_HOUR * 60;
    const endBoundaryMin = END_HOUR * 60;

    if (startMin === null || endMin === null) {
        return false;
    }

    return startMin >= baseMin && endMin <= endBoundaryMin && endMin > startMin;
}

function slotTopPx(startTime: string): number {
    const startMin = timeToMinutes(startTime);

    if (startMin === null) {
        return 0;
    }

    const baseMin = BASE_HOUR * 60;

    return (startMin - baseMin) * PX_PER_MINUTE;
}

function buildAggregatedSlots(
    raw: readonly SchoolAvailabilitySlot[],
): LessonBookingAggregatedSlot[] {
    const byKey = new Map<string, LessonBookingInstructorOption[]>();

    for (const s of raw) {
        const key = `${s.date}|${s.startTime}|${s.endTime}`;
        const opt: LessonBookingInstructorOption = {
            id: s.instructorId,
            firstName: s.instructorFirstName,
            lastName: s.instructorLastName,
        };

        const prev = byKey.get(key);

        if (prev) {
            if (!prev.some((x) => x.id === opt.id)) {
                prev.push(opt);
            }
        } else {
            byKey.set(key, [opt]);
        }
    }

    const out: LessonBookingAggregatedSlot[] = [];

    for (const [key, availableInstructors] of byKey) {
        const parts = key.split('|');
        const date = parts[0] ?? '';
        const startTime = parts[1] ?? '';
        const endTime = parts[2] ?? '';

        if (!date || !startTime || !endTime) {
            continue;
        }

        availableInstructors.sort((a, b) =>
            `${a.lastName} ${a.firstName}`.localeCompare(
                `${b.lastName} ${b.firstName}`,
                'pl',
            ),
        );

        out.push({
            date,
            startTime,
            endTime,
            instructorCount: availableInstructors.length,
            availableInstructors,
        });
    }

    return out.sort((a, b) => {
        const byDate = a.date.localeCompare(b.date);

        if (byDate !== 0) {
            return byDate;
        }

        return a.startTime.localeCompare(b.startTime);
    });
}

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
    const calendarSelected = ref<CalendarDate[]>(
        weekCalendarDatesFromMonday(getMonday(new Date())),
    );
    const { fetchSlots, isLoading } = useSchoolAvailabilitySlotsApi();

    let fetchSeq = 0;

    const hourLabels = computed(() =>
        Array.from({ length: 12 }, (_, i) => BASE_HOUR + i),
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
        buildAggregatedSlots(slots.value).filter(isSlotInsideTimeline),
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
                buildFiltersPayload(),
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
        BASE_HOUR,
        END_HOUR,
        GRID_HEIGHT_PX,
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
        slotTopPx,
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
