import type { Ref } from 'vue';
import type { CourseListItem } from '~/types/courses/course';
import type { InstructorListItem } from '~/types/instructors/instructor';
import type {
    LessonBookingInstructorOption,
    LessonBookingSlotContext,
    StudentCourseWithKind,
} from '~/types/lessons/lessonBooking';
import type { StudentListItem } from '~/types/students/student';
import type { Vehicle } from '~/types/vehicles/vehicle';
import { getApiFetchErrorMessage } from '~/utils/api/apiFetchErrorMessage';
import {
    buildManagerLessonBookingSubmitBody,
    filterManagerLessonBookingAvailableInstructors,
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
        loadStudentCoursesWithKind,
        createLesson,
        isLoadingModalData,
        isCreating,
        modalError: loadModalError,
    } = useLessonBookingApi();
    const { fetchList: fetchInstructorsList } = useInstructorsApi();

    const students = ref<StudentListItem[]>([]);
    const vehicles = ref<Vehicle[]>([]);
    const studentCourses = ref<StudentCourseWithKind[]>([]);
    const schoolInstructors = ref<InstructorListItem[]>([]);

    const selectedInstructorId = ref('');
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

    const filteredAvailableInstructors = computed(() =>
        filterManagerLessonBookingAvailableInstructors({
            slotCtx: options.slotCtx.value,
            selectedCourse: selectedCourse.value,
            schoolInstructors: schoolInstructors.value,
        }),
    );

    const resolvedInstructor = computed(
        (): LessonBookingInstructorOption | null => {
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

    let loadSeq = 0;

    watch(
        [options.open, options.slotCtx],
        async ([isOpen, ctx]) => {
            if (!isOpen || !ctx) {
                return;
            }

            const seq = ++loadSeq;

            students.value = [];
            vehicles.value = [];
            studentCourses.value = [];
            schoolInstructors.value = [];
            selectedInstructorId.value =
                ctx.availableInstructors.length === 1
                    ? (ctx.availableInstructors[0]?.id ?? '')
                    : '';
            selectedStudentUserId.value = '';
            selectedCourseId.value = '';
            selectedVehicleId.value = '';
            formError.value = null;
            loadCoursesError.value = null;

            try {
                const [data, instructorRows] = await Promise.all([
                    loadModalData(ctx),
                    fetchInstructorsList(ctx.schoolId).catch(() => []),
                ]);

                if (seq !== loadSeq) {
                    return;
                }

                students.value = data.students;
                vehicles.value = data.vehicles;
                schoolInstructors.value = instructorRows;
            } catch {
                /* loadModalError carries the visible message */
            }
        },
        { flush: 'post' },
    );

    watch([selectedCourse, filteredAvailableInstructors], ([course, items]) => {
        if (!course) {
            return;
        }

        const selected = selectedInstructorId.value.trim();

        if (selected && items.some((item) => item.id === selected)) {
            return;
        }

        selectedInstructorId.value = items.length === 1 ? items[0]!.id : '';
    });

    watch(selectedStudentUserId, async (userId) => {
        selectedCourseId.value = '';
        studentCourses.value = [];
        loadCoursesError.value = null;

        const schoolId = options.slotCtx.value?.schoolId.trim();
        const uid = userId.trim();

        if (!uid || !schoolId) {
            return;
        }

        try {
            studentCourses.value = await loadStudentCoursesWithKind(
                uid,
                schoolId,
                options.schoolCourses.value,
            );
        } catch (err: unknown) {
            loadCoursesError.value = getApiFetchErrorMessage(
                err,
                'Nie udało się wczytać kursów kursanta.',
            );
        }
    });

    function handleClose(): void {
        options.open.value = false;
    }

    async function handleSubmit(): Promise<void> {
        formError.value = null;

        const result = buildManagerLessonBookingSubmitBody({
            slotCtx: options.slotCtx.value,
            studentUserId: selectedStudentUserId.value,
            courseId: selectedCourseId.value,
            instructorId: selectedInstructorId.value,
            vehicleId: selectedVehicleId.value,
        });

        if (!result.ok) {
            formError.value = result.error;

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
        vehicles,
        selectedInstructorId,
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
        instructorLabel,
        slotWhenLabel,
        handleClose,
        handleSubmit,
    };
}
