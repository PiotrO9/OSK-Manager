import type { Ref } from 'vue';
import type { CourseListItem } from '~/types/courses/course';
import type { InstructorListItem } from '~/types/instructors/instructor';
import type {
    LessonBookingInstructorOption,
    LessonBookingEligibleStudent,
    LessonBookingSlotContext,
    StudentCourseWithKind,
} from '~/types/lessons/lessonBooking';
import type { Vehicle } from '~/types/vehicles/vehicle';
import type { LessonCreateAvailabilityRequest } from '~/types/schedule/scheduleAvailability';
import { getApiFetchErrorMessage } from '~/utils/api/apiFetchErrorMessage';
import { useManagerLessonBookingInstructors } from './useManagerLessonBookingInstructors';
import {
    buildManagerLessonBookingSubmitBody,
    filterManagerLessonBookingCourses,
    formatManagerLessonBookingSlotWhenLabel,
    readManagerLessonBookingFetchStatusCode,
} from '~/utils/lessons/managerLessonBookingDialog';

interface UseManagerLessonBookingDialogOptions {
    open: Ref<boolean>;
    slotCtx: Readonly<Ref<LessonBookingSlotContext | null>>;
    schoolCourses: Readonly<Ref<readonly CourseListItem[]>>;
    emitBooked: () => void;
}

export function useManagerLessonBookingDialog(
    options: UseManagerLessonBookingDialogOptions,
) {
    const { addToast } = useAppToast();
    const {
        loadModalData,
        fetchBookingOptions,
        createLesson,
        isLoadingModalData,
        isCreating,
        modalError: loadModalError,
    } = useLessonBookingApi();
    const { fetchList: fetchInstructorsList } = useInstructorsApi();

    const students = ref<LessonBookingEligibleStudent[]>([]);
    const studentSearch = ref('');
    const studentPage = ref(1);
    const studentTotalPages = ref(0);
    const isLoadingStudents = ref(false);
    const studentsError = ref<string | null>(null);
    const vehicles = ref<Vehicle[]>([]);
    const availableVehicleIds = ref<string[]>([]);
    const studentCourses = ref<StudentCourseWithKind[]>([]);
    const schoolInstructors = ref<InstructorListItem[]>([]);

    const selectedInstructorId = ref('');
    const isInstructorFixed = computed(() =>
        Boolean(options.slotCtx.value?.fixedInstructor),
    );
    const bookingInstructorId = computed(
        () =>
            options.slotCtx.value?.fixedInstructor?.id ??
            selectedInstructorId.value.trim(),
    );
    const selectedStudentUserId = ref('');
    const selectedCourseId = ref('');
    const selectedVehicleId = ref('');
    const formError = ref<string | null>(null);
    const loadCoursesError = ref<string | null>(null);

    const filteredCourses = computed(() =>
        filterManagerLessonBookingCourses(studentCourses.value),
    );

    const selectedCourse = computed((): StudentCourseWithKind | null => {
        const courseId = selectedCourseId.value.trim();

        if (!courseId) {
            return null;
        }

        return (
            filteredCourses.value.find((course) => course.id === courseId) ??
            null
        );
    });

    const instructorOptions = useManagerLessonBookingInstructors({
        open: options.open,
        slotCtx: options.slotCtx,
        selectedCourse,
        studentId: selectedStudentUserId,
        vehicleId: selectedVehicleId,
        schoolInstructors,
    });
    const filteredAvailableInstructors = instructorOptions.instructors;
    const defaultInstructorId = computed(
        () =>
            options.schoolCourses.value.find(
                (course) => course.id === selectedCourseId.value,
            )?.instructor?.id ?? '',
    );

    const resolvedInstructor = computed(
        (): LessonBookingInstructorOption | null => {
            if (options.slotCtx.value?.fixedInstructor) {
                return options.slotCtx.value.fixedInstructor;
            }

            const id = selectedInstructorId.value.trim();

            if (!options.slotCtx.value || !id) {
                return null;
            }

            return (
                filteredAvailableInstructors.value.find(
                    (item) => item.id === id,
                ) ?? null
            );
        },
    );

    const instructorLabel = computed(() => {
        const instructor = resolvedInstructor.value;

        if (!instructor) {
            return '—';
        }

        return `${instructor.firstName} ${instructor.lastName}`.trim();
    });

    const slotWhenLabel = computed(() =>
        formatManagerLessonBookingSlotWhenLabel(options.slotCtx.value),
    );

    const availabilityCandidate =
        computed<LessonCreateAvailabilityRequest | null>(() => {
            const ctx = options.slotCtx.value;
            const courseId = selectedCourseId.value.trim();
            const studentId = selectedStudentUserId.value.trim();
            const instructorId = bookingInstructorId.value;
            const vehicleId = selectedVehicleId.value.trim();

            if (
                !options.open.value ||
                !ctx ||
                !courseId ||
                !studentId ||
                !instructorId ||
                !vehicleId
            ) {
                return null;
            }

            return {
                intent: 'lesson_create',
                courseId,
                studentId,
                instructorId,
                vehicleId,
                date: ctx.date,
                startTime: ctx.startTime,
                endTime: ctx.endTime,
            };
        });
    const availability = useScheduleAvailabilityCheck({
        candidate: availabilityCandidate,
    });

    let loadSequence = 0;
    let studentsLoadSequence = 0;
    let resettingSearch = false;

    watch(
        [options.open, options.slotCtx],
        async ([isOpen, ctx]) => {
            if (!isOpen || !ctx) {
                loadSequence += 1;
                studentsLoadSequence += 1;

                return;
            }

            const requestSequence = ++loadSequence;

            studentsLoadSequence += 1;

            students.value = [];
            resettingSearch = true;
            studentSearch.value = '';
            resettingSearch = false;
            studentPage.value = 1;
            studentTotalPages.value = 0;
            studentsError.value = null;
            vehicles.value = [];
            availableVehicleIds.value = [];
            studentCourses.value = [];
            schoolInstructors.value = [];
            selectedInstructorId.value = '';
            selectedStudentUserId.value = '';
            selectedCourseId.value = '';
            selectedVehicleId.value = '';
            formError.value = null;
            loadCoursesError.value = null;

            try {
                const [data, instructorRows] = await Promise.all([
                    loadModalData(ctx),
                    ctx.fixedInstructor
                        ? []
                        : fetchInstructorsList(ctx.schoolId),
                ]);

                if (requestSequence !== loadSequence) {
                    return;
                }

                students.value = data.students;
                studentTotalPages.value = data.totalPages ?? 0;
                vehicles.value = data.vehicles;
                availableVehicleIds.value = data.availableVehicleIds;
                schoolInstructors.value = instructorRows;
            } catch (err: unknown) {
                if (requestSequence !== loadSequence) return;

                formError.value = getApiFetchErrorMessage(
                    err,
                    'Nie udało się wczytać danych do rezerwacji. Otwórz formularz ponownie.',
                );
            }
        },
        { flush: 'post' },
    );

    watch(
        filteredAvailableInstructors,
        (items) => {
            const selected = selectedInstructorId.value.trim();

            if (selected && items.some((item) => item.id === selected)) {
                return;
            }

            selectedInstructorId.value = '';
        },
        { flush: 'sync' },
    );

    watch(selectedStudentUserId, (userId) => {
        selectedCourseId.value = '';
        loadCoursesError.value = null;
        studentCourses.value =
            students.value.find((student) => student.userId === userId)
                ?.courses ?? [];
    });

    async function loadStudentsPage(page: number): Promise<void> {
        const ctx = options.slotCtx.value;

        if (!options.open.value || !ctx) return;

        const requestSequence = ++studentsLoadSequence;

        isLoadingStudents.value = true;
        studentsError.value = null;

        try {
            const result = await fetchBookingOptions(
                ctx,
                studentSearch.value,
                page,
            );

            if (requestSequence !== studentsLoadSequence) return;

            students.value =
                page === 1
                    ? result.items
                    : [...students.value, ...result.items];
            studentPage.value = page;
            studentTotalPages.value = result.totalPages;
        } catch (err: unknown) {
            if (requestSequence !== studentsLoadSequence) return;

            studentsError.value = getApiFetchErrorMessage(
                err,
                'Nie udało się pobrać kursantów do rezerwacji.',
            );
        } finally {
            if (requestSequence === studentsLoadSequence)
                isLoadingStudents.value = false;
        }
    }

    watch(
        studentSearch,
        (_search, _old, onCleanup) => {
            if (!options.open.value || resettingSearch) return;

            selectedStudentUserId.value = '';
            students.value = [];
            studentPage.value = 1;
            studentsLoadSequence += 1;
            const timer = setTimeout(() => void loadStudentsPage(1), 250);

            onCleanup(() => clearTimeout(timer));
        },
        { flush: 'sync' },
    );

    function loadMoreStudents(): void {
        if (
            !isLoadingStudents.value &&
            studentPage.value < studentTotalPages.value
        ) {
            void loadStudentsPage(studentPage.value + 1);
        }
    }

    function handleClose(): void {
        options.open.value = false;
    }

    async function handleSubmit(): Promise<void> {
        if (isCreating.value) {
            return;
        }

        formError.value = null;

        const result = buildManagerLessonBookingSubmitBody({
            slotCtx: options.slotCtx.value,
            studentUserId: selectedStudentUserId.value,
            courseId: selectedCourseId.value,
            instructorId: bookingInstructorId.value,
            vehicleId: selectedVehicleId.value,
        });

        if (!result.ok) {
            formError.value = result.error;

            return;
        }

        if (!resolvedInstructor.value) {
            formError.value =
                'Wybierz instruktora z aktualnej listy dostępnych instruktorów.';

            return;
        }

        const availabilityStatus = await availability.recheck();

        if (availabilityStatus === 'unavailable') {
            formError.value =
                availability.message.value ||
                'Wybrany termin jest niedostępny.';

            return;
        }

        try {
            await createLesson(result.body);

            addToast({
                title: 'Rezerwacja utworzona',
                description: 'Lekcja została zapisana w systemie.',
                variant: 'success',
            });

            options.emitBooked();
            options.open.value = false;
        } catch (err: unknown) {
            const code = readManagerLessonBookingFetchStatusCode(err);

            if (code === 409) {
                formError.value =
                    'Slot lub pojazd został już zajęty. Odśwież kalendarz i spróbuj ponownie.';
            } else {
                formError.value = getApiFetchErrorMessage(
                    err,
                    'Nie udało się utworzyć rezerwacji.',
                );
            }
        }
    }

    return {
        students,
        studentSearch,
        studentPage,
        studentTotalPages,
        isLoadingStudents,
        studentsError,
        loadMoreStudents,
        vehicles,
        availableVehicleIds,
        selectedInstructorId,
        isInstructorFixed,
        bookingInstructorId,
        selectedStudentUserId,
        selectedCourseId,
        selectedVehicleId,
        formError,
        loadCoursesError,
        isLoadingModalData,
        isCreating,
        loadModalError,
        filteredCourses,
        filteredAvailableInstructors,
        defaultInstructorId,
        instructorOptionsStatus: instructorOptions.status,
        instructorOptionsMessage: instructorOptions.message,
        reloadInstructorOptions: instructorOptions.reload,
        instructorLabel,
        slotWhenLabel,
        lessonAvailabilityStatus: availability.status,
        lessonAvailabilityMessage: availability.message,
        handleClose,
        handleSubmit,
    };
}
