import {
    buildSlotIsoUTC,
    getMonday,
    weekRangeFromMonday,
} from '~/utils/weeklyCalendarDates';
import { getApiFetchErrorMessage } from '~/utils/apiFetchErrorMessage';
import {
    formatCourseKindLabel,
    type CurrentUserCourseItem,
} from '~/types/course';
import type { SchoolAvailabilitySlot } from '~/types/schoolAvailabilitySlots';

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
    const slots = shallowRef<SchoolAvailabilitySlot[]>([]);
    const isCoursesLoading = shallowRef(false);
    const coursesErrorMessage = shallowRef<string | null>(null);
    const slotsErrorMessage = shallowRef<string | null>(null);
    const bookingSlotKey = shallowRef<string | null>(null);
    const successMessage = shallowRef<string | null>(null);

    let slotsLoadSeq = 0;

    const bookableCourses = computed(() =>
        courses.value.filter(
            (course) =>
                course.status === 'ACTIVE' &&
                (course.type === 'PRACTICAL' || course.type === 'EXTRA'),
        ),
    );

    const selectedCourse = computed(
        () =>
            bookableCourses.value.find(
                (course) => course.id === selectedCourseId.value,
            ) ?? null,
    );

    const weekRange = computed(() => weekRangeFromMonday(weekStart.value));

    const weekLabel = computed(() => {
        const start = weekStart.value;
        const end = new Date(
            start.getFullYear(),
            start.getMonth(),
            start.getDate() + 6,
        );
        const formatter = new Intl.DateTimeFormat('pl-PL', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });

        return `${formatter.format(start)} - ${formatter.format(end)}`;
    });

    const weekShortLabel = computed(() => {
        const start = weekStart.value;
        const end = new Date(
            start.getFullYear(),
            start.getMonth(),
            start.getDate() + 6,
        );
        const formatter = new Intl.DateTimeFormat('pl-PL', {
            day: '2-digit',
            month: '2-digit',
        });

        return `${formatter.format(start)} - ${formatter.format(end)}`;
    });

    const selectedCourseProgressLabel = computed(() => {
        const course = selectedCourse.value;

        if (!course) {
            return 'Wybierz kurs, ĹĽeby zobaczyÄ‡ postÄ™p.';
        }

        return `${course.progress} z ${course.totalHours} godzin wykorzystane`;
    });

    const selectedCourseTypeLabel = computed(() => {
        const course = selectedCourse.value;

        return course
            ? formatCourseKindLabel(course.type)
            : 'Brak wybranego kursu';
    });

    const availableSlotsLabel = computed(() => {
        if (!selectedCourse.value) {
            return 'Najpierw wybierz kurs';
        }

        if (isSlotsLoading.value) {
            return 'Wczytywanie terminĂłw';
        }

        return `${slots.value.length} dostÄ™pnych terminĂłw`;
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
        } catch (err: unknown) {
            courses.value = [];
            selectedCourseId.value = '';
            coursesErrorMessage.value = getApiFetchErrorMessage(
                err,
                'Nie udaĹ‚o siÄ™ pobraÄ‡ listy kursĂłw.',
            );
        } finally {
            isCoursesLoading.value = false;
        }
    }

    async function loadSlots(): Promise<void> {
        const course = selectedCourse.value;
        const seq = ++slotsLoadSeq;

        slotsErrorMessage.value = null;
        successMessage.value = null;

        if (!course) {
            slots.value = [];

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
            );

            if (seq !== slotsLoadSeq) {
                return;
            }

            slots.value = data.slots;
        } catch (err: unknown) {
            if (seq !== slotsLoadSeq) {
                return;
            }

            slots.value = [];
            slotsErrorMessage.value = getApiFetchErrorMessage(
                err,
                'Nie udaĹ‚o siÄ™ pobraÄ‡ wolnych terminĂłw.',
            );
        }
    }

    function handlePrevWeek(): void {
        const date = new Date(weekStart.value);

        date.setDate(date.getDate() - 7);
        weekStart.value = getMonday(date);
    }

    function handleNextWeek(): void {
        const date = new Date(weekStart.value);

        date.setDate(date.getDate() + 7);
        weekStart.value = getMonday(date);
    }

    async function handleBookSlot(slot: SchoolAvailabilitySlot): Promise<void> {
        const course = selectedCourse.value;

        if (!course || bookingSlotKey.value !== null) {
            return;
        }

        bookingSlotKey.value = getStudentLessonBookingSlotKey(slot);
        successMessage.value = null;
        slotsErrorMessage.value = null;

        try {
            await bookOwnLesson({
                courseId: course.id,
                instructorId: slot.instructorId,
                startTime: buildSlotIsoUTC(slot.date, slot.startTime),
                endTime: buildSlotIsoUTC(slot.date, slot.endTime),
            });

            successMessage.value = 'Jazda zostala zarezerwowana.';
            addToast({
                title: 'Jazda zostala zarezerwowana',
                variant: 'success',
            });
            await loadSlots();
        } catch (err: unknown) {
            const message = getApiFetchErrorMessage(
                err,
                'Nie udaĹ‚o siÄ™ zarezerwowaÄ‡ jazdy.',
            );

            slotsErrorMessage.value = message;
            addToast({
                title: 'Nie udaĹ‚o siÄ™ zarezerwowaÄ‡ jazdy',
                description: message,
                variant: 'error',
            });
        } finally {
            bookingSlotKey.value = null;
        }
    }

    watch(
        () => [selectedCourseId.value, weekRange.value.dateFrom] as const,
        () => {
            void loadSlots();
        },
    );

    onMounted(() => {
        void loadCourses();
    });

    return {
        courses,
        selectedCourseId,
        slots,
        isCoursesLoading,
        coursesErrorMessage,
        slotsErrorMessage,
        bookingSlotKey,
        successMessage,
        isSlotsLoading,
        bookableCourses,
        selectedCourse,
        weekRange,
        weekLabel,
        weekShortLabel,
        selectedCourseProgressLabel,
        selectedCourseTypeLabel,
        availableSlotsLabel,
        loadCourses,
        handlePrevWeek,
        handleNextWeek,
        handleBookSlot,
    };
}
