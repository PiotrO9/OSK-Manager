import { useStudentLessonBookingFlow } from './useStudentLessonBookingFlow';
import {
    parseDate,
    type CalendarDate,
    type DateValue,
} from '@internationalized/date';
import { toDate } from 'reka-ui/date';
import {
    formatDateOnly,
    getMonday,
    weekCalendarDatesFromMonday,
    weekRangeFromMonday,
} from '~/utils/date/weeklyCalendarDates';
import { getApiFetchErrorMessage } from '~/utils/api/apiFetchErrorMessage';
import {
    formatCourseKindLabel,
    type CurrentUserCourseItem,
} from '~/types/courses/course';
import type { SchoolAvailabilitySlot } from '~/types/schools/schoolAvailabilitySlots';
import {
    filterStudentLessonBookableSlots,
    formatStudentLessonBookingRemainingHoursLabel,
    formatStudentLessonBookingWeekRangeCompactLabel,
    getStudentLessonBookingMaxBookableDate,
    getStudentLessonBookingMaxWeekStart,
    getStudentLessonBookingMinWeekStart,
    getStudentLessonBookingRemainingHours,
    isStudentLessonBookingNextWeekDisabled,
    isStudentLessonBookingPrevWeekDisabled,
    isStudentLessonBookingWeekBeyondWindow,
} from '~/utils/student/studentLessonBookingPage';
import { formatManagerInstructorWeekRangeLabel } from '~/utils/instructors/managerInstructorWeeklyCalendar';

export function getStudentLessonBookingSlotKey(
    slot: SchoolAvailabilitySlot,
): string {
    return `${slot.date}|${slot.startTime}|${slot.endTime}|${slot.instructorId}`;
}

export function useStudentLessonBookingPage() {
    const { fetchMyCourses } = useCoursesApi();
    const { fetchSlots, isLoading: isSlotsLoading } =
        useSchoolAvailabilitySlotsApi();
    const { bookOwnLesson } = useStudentLessonBookingApi();
    const { addToast } = useAppToast();

    const bookingCalendarToday = new Date();
    const bookingCalendarMin = parseDate(formatDateOnly(bookingCalendarToday));
    const bookingCalendarMax = parseDate(
        getStudentLessonBookingMaxBookableDate(bookingCalendarToday),
    );

    const courses = shallowRef<CurrentUserCourseItem[]>([]);
    const selectedCourseId = shallowRef('');
    const weekStart = shallowRef<Date>(getMonday(new Date()));
    const rawSlots = shallowRef<SchoolAvailabilitySlot[]>([]);
    const slotsTotal = shallowRef(0);
    const isCoursesLoading = shallowRef(false);
    const coursesErrorMessage = shallowRef<string | null>(null);
    const slotsErrorMessage = shallowRef<string | null>(null);
    const isCalendarOpen = shallowRef(false);
    const calendarSelected = shallowRef<CalendarDate[]>(
        weekCalendarDatesFromMonday(getMonday(new Date())),
    );
    let slotsLoadSequence = 0;
    let slotsAbortController: AbortController | null = null;

    const bookableCourses = computed(() =>
        courses.value.filter(
            (course) =>
                course.status === 'ACTIVE' &&
                (course.type === 'PRACTICAL' || course.type === 'EXTRA') &&
                getStudentLessonBookingRemainingHours(course) > 0,
        ),
    );

    const hasActivePracticalCourse = computed(() =>
        courses.value.some(
            (course) =>
                course.status === 'ACTIVE' &&
                (course.type === 'PRACTICAL' || course.type === 'EXTRA'),
        ),
    );

    const noBookableCoursesState = computed(() =>
        hasActivePracticalCourse.value
            ? {
                  title: 'Wykorzystano dostępne godziny',
                  description:
                      'Aktywne kursy nie mają już godzin, które można przeznaczyć na kolejną jazdę. Sprawdź szczegóły kursu lub skontaktuj się ze szkołą.',
              }
            : {
                  title: 'Brak kursu do rezerwacji',
                  description:
                      'Nie masz aktywnego kursu praktycznego, dla którego można zarezerwować jazdę.',
              },
    );

    const selectedCourse = computed(
        () =>
            bookableCourses.value.find(
                (course) => course.id === selectedCourseId.value,
            ) ?? null,
    );

    const {
        bookingFeedbackMessage,
        bookingFeedbackTone,
        bookingSlotKey,
        pendingConfirmationSlot,
        pendingShorterSlot,
        isConfirmDialogOpen,
        handleRequestBookSlot,
        handleCloseConfirmDialog,
        handleConfirmBookSlot,
        handleConfirmShorterSlot,
        clearBookingFeedback,
    } = useStudentLessonBookingFlow({
        selectedCourse,
        bookOwnLesson,
        addToast,
        loadCourses,
        loadSlots,
        getSlotKey: getStudentLessonBookingSlotKey,
    });

    const weekRange = computed(() => weekRangeFromMonday(weekStart.value));

    const weekLabel = computed(() =>
        formatManagerInstructorWeekRangeLabel(weekStart.value),
    );

    const weekShortLabel = computed(() =>
        formatStudentLessonBookingWeekRangeCompactLabel(weekStart.value),
    );

    const slots = computed(() =>
        filterStudentLessonBookableSlots(rawSlots.value),
    );

    const isWeekBeyondBookingWindow = computed(() =>
        isStudentLessonBookingWeekBeyondWindow(weekStart.value),
    );

    const isPrevWeekDisabled = computed(
        () =>
            bookingSlotKey.value !== null ||
            isStudentLessonBookingPrevWeekDisabled(weekStart.value),
    );

    const isNextWeekDisabled = computed(
        () =>
            bookingSlotKey.value !== null ||
            isStudentLessonBookingNextWeekDisabled(weekStart.value),
    );

    const selectedCourseProgressLabel = computed(() =>
        formatStudentLessonBookingRemainingHoursLabel(selectedCourse.value),
    );

    const selectedCourseTypeLabel = computed(() => {
        const course = selectedCourse.value;

        return course
            ? formatCourseKindLabel(course.type)
            : 'Brak wybranego kursu';
    });

    const slotsTruncatedLabel = computed(() => {
        if (slotsTotal.value <= rawSlots.value.length) {
            return null;
        }

        return `Pokazano ${rawSlots.value.length} z ${slotsTotal.value} terminów w tym tygodniu. Zawęź okres lub skontaktuj się ze szkołą, jeśli brakuje terminu.`;
    });

    const remainingCourseHours = computed(() => {
        const course = selectedCourse.value;

        if (!course) {
            return null;
        }

        return getStudentLessonBookingRemainingHours(course);
    });

    async function loadCourses(): Promise<void> {
        isCoursesLoading.value = true;
        coursesErrorMessage.value = null;

        try {
            courses.value = await fetchMyCourses();
            const previousCourseId = selectedCourseId.value;
            const currentStillAvailable = bookableCourses.value.some(
                (course) => course.id === selectedCourseId.value,
            );

            if (!currentStillAvailable) {
                selectedCourseId.value = bookableCourses.value[0]?.id ?? '';
            }

            if (selectedCourseId.value === previousCourseId) {
                await loadSlots();
            }
        } catch (err: unknown) {
            courses.value = [];
            selectedCourseId.value = '';
            coursesErrorMessage.value = getApiFetchErrorMessage(
                err,
                'Nie udało się pobrać listy kursów.',
            );
        } finally {
            isCoursesLoading.value = false;
        }
    }

    async function loadSlots(): Promise<void> {
        const course = selectedCourse.value;
        const requestSequence = ++slotsLoadSequence;
        const controller = new AbortController();

        slotsAbortController?.abort();
        slotsAbortController = controller;

        slotsErrorMessage.value = null;

        if (!course) {
            rawSlots.value = [];
            slotsTotal.value = 0;
            slotsAbortController = null;

            return;
        }

        if (isWeekBeyondBookingWindow.value) {
            rawSlots.value = [];
            slotsTotal.value = 0;
            slotsAbortController = null;

            return;
        }

        try {
            const data = await fetchSlots(
                course.schoolId,
                weekRange.value.dateFrom,
                weekRange.value.dateTo,
                {
                    courseId: course.id,
                    lessonType: 'PRACTICE',
                    sort: 'startTime',
                    limit: 200,
                },
                { signal: controller.signal, retry: 0 },
            );

            if (requestSequence !== slotsLoadSequence) {
                return;
            }

            rawSlots.value = data.slots;
            slotsTotal.value = data.total ?? data.slots.length;
        } catch (err: unknown) {
            if (requestSequence !== slotsLoadSequence) {
                return;
            }

            rawSlots.value = [];
            slotsTotal.value = 0;
            slotsErrorMessage.value = getApiFetchErrorMessage(
                err,
                'Nie udało się pobrać wolnych terminów.',
            );
        }
    }

    function handlePrevWeek(): void {
        if (isPrevWeekDisabled.value) {
            return;
        }

        const date = new Date(weekStart.value);

        date.setDate(date.getDate() - 7);
        weekStart.value = getMonday(date);
        calendarSelected.value = weekCalendarDatesFromMonday(weekStart.value);
        clearBookingFeedback();
    }

    function handleNextWeek(): void {
        if (isNextWeekDisabled.value) {
            return;
        }

        const date = new Date(weekStart.value);

        date.setDate(date.getDate() + 7);
        weekStart.value = getMonday(date);
        calendarSelected.value = weekCalendarDatesFromMonday(weekStart.value);
        clearBookingFeedback();
    }

    function handleCalendarUpdate(
        value: DateValue | DateValue[] | undefined,
    ): void {
        if (value === undefined || bookingSlotKey.value !== null) {
            return;
        }

        const arr = Array.isArray(value) ? value : [value];

        if (arr.length === 0) {
            return;
        }

        let anchor = arr[0]!;

        for (const entry of arr) {
            if (toDate(entry).getTime() > toDate(anchor).getTime()) {
                anchor = entry;
            }
        }

        const monday = getMonday(toDate(anchor));
        const minStart = getStudentLessonBookingMinWeekStart();
        const maxStart = getStudentLessonBookingMaxWeekStart();

        if (monday.getTime() < minStart.getTime()) {
            weekStart.value = minStart;
        } else if (monday.getTime() > maxStart.getTime()) {
            weekStart.value = maxStart;
        } else {
            weekStart.value = monday;
        }

        calendarSelected.value = weekCalendarDatesFromMonday(weekStart.value);
        isCalendarOpen.value = false;
        clearBookingFeedback();
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

    watch(
        () => [selectedCourseId.value, weekRange.value.dateFrom] as const,
        () => {
            void loadSlots();
        },
    );

    watch(weekStart, (value) => {
        calendarSelected.value = weekCalendarDatesFromMonday(value);
    });

    onMounted(() => {
        void loadCourses();
    });

    onBeforeUnmount(() => {
        slotsLoadSequence += 1;
        slotsAbortController?.abort();
        slotsAbortController = null;
    });

    return {
        courses,
        selectedCourseId,
        slots,
        rawSlots,
        slotsTotal,
        isCoursesLoading,
        coursesErrorMessage,
        slotsErrorMessage,
        bookingFeedbackMessage,
        bookingFeedbackTone,
        bookingSlotKey,
        pendingConfirmationSlot,
        pendingShorterSlot,
        isConfirmDialogOpen,
        isCalendarOpen,
        calendarSelected,
        isSlotsLoading,
        bookableCourses,
        noBookableCoursesState,
        selectedCourse,
        weekStart,
        weekRange,
        weekLabel,
        weekShortLabel,
        selectedCourseProgressLabel,
        selectedCourseTypeLabel,
        slotsTruncatedLabel,
        remainingCourseHours,
        isWeekBeyondBookingWindow,
        isPrevWeekDisabled,
        isNextWeekDisabled,
        bookingCalendarMin,
        bookingCalendarMax,
        loadCourses,
        loadSlots,
        handlePrevWeek,
        handleNextWeek,
        handleCalendarUpdate,
        handleKeyDownWeekNav,
        handleRequestBookSlot,
        handleCloseConfirmDialog,
        handleConfirmBookSlot,
        handleConfirmShorterSlot,
        clearBookingFeedback,
    };
}
