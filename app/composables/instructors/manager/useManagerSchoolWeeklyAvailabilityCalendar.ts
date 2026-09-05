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
    WEEK_PICKER_CALENDAR_MAX,
    WEEK_PICKER_CALENDAR_MIN,
    weekRangeFromMonday,
} from '~/utils/date/weeklyCalendarDates';
import {
    buildSchoolAvailabilityAggregatedSlots,
    buildSchoolAvailabilityCalendarFiltersPayload,
    buildSchoolAvailabilityWeekDays,
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

    const slots = ref<SchoolAvailabilitySlot[]>([]);
    const errorMessage = ref<string | null>(null);
    const { fetchSlots, isLoading } = useSchoolAvailabilitySlotsApi();
    const {
        weekStart,
        weekRangeLabel,
        isCalendarOpen,
        calendarSelected,
        handlePrevWeek,
        handleNextWeek,
        handleCalendarUpdate,
        handleKeyDownWeekNav,
    } = useManagerSchoolAvailabilityWeekPicker();

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

    const weekDays = computed(() =>
        buildSchoolAvailabilityWeekDays(weekStart.value),
    );

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
