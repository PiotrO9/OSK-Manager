import type { CalendarDate, DateValue } from '@internationalized/date';
import { toDate } from 'reka-ui/date';
import {
    buildSlotIsoUTC,
    getMonday,
    weekCalendarDatesFromMonday,
    weekRangeFromMonday,
    WEEK_PICKER_CALENDAR_MAX,
    WEEK_PICKER_CALENDAR_MIN,
} from '~/utils/date/weeklyCalendarDates';
import { getApiFetchErrorMessage } from '~/utils/api/apiFetchErrorMessage';
import { getApiErrorStatusCode } from '~/utils/api/apiEnvelope';
import {
    formatCourseKindLabel,
    type CurrentUserCourseItem,
} from '~/types/courses/course';
import type { SchoolAvailabilitySlot } from '~/types/schools/schoolAvailabilitySlots';
import type { LessonSelfBookAvailabilityRequest } from '~/types/schedule/scheduleAvailability';
import { scheduleAvailabilityIssueMessage } from '~/types/schedule/scheduleAvailability';
import {
    canStudentBookSlotWithCourseHours,
    filterStudentLessonBookableSlots,
    formatStudentLessonBookingAvailableSlotsLabel,
    formatStudentLessonBookingRemainingHoursLabel,
    formatStudentLessonBookingWeekRangeCompactLabel,
    getStudentLessonBookingInstructorName,
    getStudentLessonBookingMaxWeekStart,
    getStudentLessonBookingMinWeekStart,
    getStudentLessonBookingRemainingHours,
    isStudentLessonBookingNextWeekDisabled,
    isStudentLessonBookingPrevWeekDisabled,
    isStudentLessonBookingWeekBeyondWindow,
} from '~/utils/student/studentLessonBookingPage';
import { formatManagerInstructorWeekRangeLabel } from '~/utils/instructors/managerInstructorWeeklyCalendar';
import { formatStudentLessonBookingDateLabel } from '~/composables/student/lesson-booking/useStudentLessonBookingSlotList';

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

    const courses = shallowRef<CurrentUserCourseItem[]>([]);
    const selectedCourseId = shallowRef('');
    const weekStart = shallowRef<Date>(getMonday(new Date()));
    const rawSlots = shallowRef<SchoolAvailabilitySlot[]>([]);
    const slotsTotal = shallowRef(0);
    const isCoursesLoading = shallowRef(false);
    const coursesErrorMessage = shallowRef<string | null>(null);
    const slotsErrorMessage = shallowRef<string | null>(null);
    const bookingFeedbackMessage = shallowRef<string | null>(null);
    const bookingFeedbackTone = shallowRef<'success' | 'error'>('success');
    const bookingSlotKey = shallowRef<string | null>(null);
    const pendingConfirmationSlot = shallowRef<SchoolAvailabilitySlot | null>(
        null,
    );
    const isConfirmDialogOpen = shallowRef(false);
    const isCalendarOpen = shallowRef(false);
    const calendarSelected = shallowRef<CalendarDate[]>(
        weekCalendarDatesFromMonday(getMonday(new Date())),
    );
    const availabilityCandidate =
        shallowRef<LessonSelfBookAvailabilityRequest | null>(null);
    const availability = useScheduleAvailabilityCheck({
        candidate: availabilityCandidate,
    });

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

    const availableSlotsLabel = computed(() =>
        formatStudentLessonBookingAvailableSlotsLabel(slots.value.length, {
            hasCourse: Boolean(selectedCourse.value),
            isLoading: isSlotsLoading.value,
        }),
    );

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

        return Math.max(0, course.totalHours - course.progress);
    });

    async function loadCourses(): Promise<void> {
        isCoursesLoading.value = true;
        coursesErrorMessage.value = null;

        try {
            courses.value = await fetchMyCourses();
            const currentStillAvailable = bookableCourses.value.some(
                (course) => course.id === selectedCourseId.value,
            );

            if (!currentStillAvailable) {
                selectedCourseId.value = bookableCourses.value[0]?.id ?? '';
            }

            await loadSlots();
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
                { signal: controller.signal },
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

    function clearBookingFeedback(): void {
        bookingFeedbackMessage.value = null;
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

    function handleRequestBookSlot(slot: SchoolAvailabilitySlot): void {
        const course = selectedCourse.value;

        if (!course || bookingSlotKey.value !== null) {
            return;
        }

        if (!canStudentBookSlotWithCourseHours(course, slot)) {
            const message =
                'Ta jazda przekroczyłaby dostępny pakiet godzin na kursie.';

            bookingFeedbackMessage.value = message;
            bookingFeedbackTone.value = 'error';
            addToast({
                title: 'Brak wystarczających godzin',
                description: message,
                variant: 'error',
            });

            return;
        }

        pendingConfirmationSlot.value = slot;
        isConfirmDialogOpen.value = true;
    }

    function handleCloseConfirmDialog(): void {
        if (bookingSlotKey.value !== null) {
            return;
        }

        isConfirmDialogOpen.value = false;
        pendingConfirmationSlot.value = null;
    }

    async function handleConfirmBookSlot(): Promise<void> {
        const slot = pendingConfirmationSlot.value;

        if (!slot) {
            return;
        }

        await handleBookSlot(slot);
        isConfirmDialogOpen.value = false;
        pendingConfirmationSlot.value = null;
    }

    async function handleBookSlot(
        slot: SchoolAvailabilitySlot,
    ): Promise<boolean> {
        const course = selectedCourse.value;

        if (!course || bookingSlotKey.value !== null) {
            return false;
        }

        bookingSlotKey.value = getStudentLessonBookingSlotKey(slot);
        bookingFeedbackMessage.value = null;
        availabilityCandidate.value = {
            intent: 'lesson_self_book',
            courseId: course.id,
            instructorId: slot.instructorId,
            date: slot.date,
            startTime: slot.startTime,
            endTime: slot.endTime,
        };

        try {
            const availabilityStatus = await availability.recheck();

            if (availabilityStatus === 'unavailable') {
                const firstIssue = availability.result.value?.issues[0];
                const message =
                    (firstIssue
                        ? scheduleAvailabilityIssueMessage(firstIssue)
                        : null) ||
                    availability.message.value ||
                    'Wybrany termin nie jest już dostępny.';

                bookingFeedbackMessage.value = message;
                bookingFeedbackTone.value = 'error';
                addToast({
                    title: 'Termin jest niedostępny',
                    description: message,
                    variant: 'error',
                });

                return false;
            }

            if (
                availabilityStatus !== 'available' &&
                availabilityStatus !== 'error'
            ) {
                const message =
                    'Nie udało się potwierdzić dostępności terminu. Spróbuj ponownie.';

                bookingFeedbackMessage.value = message;
                bookingFeedbackTone.value = 'error';
                addToast({
                    title: 'Sprawdź termin ponownie',
                    description: message,
                    variant: 'error',
                });

                return false;
            }

            await bookOwnLesson({
                courseId: course.id,
                instructorId: slot.instructorId,
                startTime: buildSlotIsoUTC(slot.date, slot.startTime),
                endTime: buildSlotIsoUTC(slot.date, slot.endTime),
            });

            const successText = `Zarezerwowano jazdę: ${formatStudentLessonBookingDateLabel(slot.date)}, ${slot.startTime}–${slot.endTime}, ${getStudentLessonBookingInstructorName(slot)}.`;

            bookingFeedbackMessage.value = successText;
            bookingFeedbackTone.value = 'success';
            addToast({
                title: successText,
                variant: 'success',
            });
            await loadSlots();

            return true;
        } catch (err: unknown) {
            const isConflict = getApiErrorStatusCode(err) === 409;
            const message = isConflict
                ? 'Ten termin został właśnie zajęty. Lista terminów została odświeżona.'
                : getApiFetchErrorMessage(
                      err,
                      'Nie udało się zarezerwować jazdy.',
                  );

            bookingFeedbackMessage.value = message;
            bookingFeedbackTone.value = 'error';
            addToast({
                title: 'Nie udało się zarezerwować jazdy',
                description: message,
                variant: 'error',
            });

            if (isConflict) {
                await loadSlots();
            }

            return false;
        } finally {
            availabilityCandidate.value = null;
            bookingSlotKey.value = null;
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
        availableSlotsLabel,
        slotsTruncatedLabel,
        remainingCourseHours,
        isWeekBeyondBookingWindow,
        isPrevWeekDisabled,
        isNextWeekDisabled,
        WEEK_PICKER_CALENDAR_MIN,
        WEEK_PICKER_CALENDAR_MAX,
        loadCourses,
        loadSlots,
        handlePrevWeek,
        handleNextWeek,
        handleCalendarUpdate,
        handleKeyDownWeekNav,
        handleRequestBookSlot,
        handleCloseConfirmDialog,
        handleConfirmBookSlot,
        clearBookingFeedback,
    };
}
