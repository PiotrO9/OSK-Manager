import type { Ref } from 'vue';
import type { CourseListItem } from '~/types/courses/course';
import type { InstructorListItem } from '~/types/instructors/instructor';
import type {
    CreateLessonBody,
    LessonBookingInstructorOption,
    LessonBookingSlotContext,
    StudentCourseWithKind,
} from '~/types/lessons/lessonBooking';
import type { StudentListItem } from '~/types/students/student';
import type { Vehicle } from '~/types/vehicles/vehicle';
import { getApiFetchErrorMessage } from '~/utils/api/apiFetchErrorMessage';
import { buildSlotIsoUTC } from '~/utils/date/weeklyCalendarDates';

interface UseManagerLessonBookingDialogOptions {
    open: Ref<boolean>;
    slotCtx: Readonly<Ref<LessonBookingSlotContext | null>>;
    schoolCourses: Readonly<Ref<readonly CourseListItem[]>>;
    emitBooked: () => void;
}

function instructorHasCategoryQualification(
    instructor: InstructorListItem,
    categoryCode: string,
): boolean {
    const code = categoryCode.trim();

    if (!code) {
        return false;
    }

    return (instructor.qualifiedCourseTypes ?? []).some(
        (courseType) => courseType.code.trim() === code,
    );
}

export function filterLessonBookingCourses(
    courses: readonly StudentCourseWithKind[],
): StudentCourseWithKind[] {
    return courses.filter((course) => {
        if (course.kind === null) {
            return true;
        }

        return course.kind === 'PRACTICAL' || course.kind === 'EXTRA';
    });
}

export function filterLessonBookingAvailableInstructors(params: {
    slotCtx: LessonBookingSlotContext | null;
    selectedCourse: StudentCourseWithKind | null;
    schoolInstructors: readonly InstructorListItem[];
}): LessonBookingInstructorOption[] {
    const { slotCtx, selectedCourse, schoolInstructors } = params;

    if (!slotCtx) {
        return [];
    }

    if (!selectedCourse) {
        return slotCtx.availableInstructors;
    }

    const qualifiedIds = new Set(
        schoolInstructors
            .filter((instructor) =>
                instructorHasCategoryQualification(
                    instructor,
                    selectedCourse.category,
                ),
            )
            .map((instructor) => instructor.id),
    );

    return slotCtx.availableInstructors.filter((instructor) =>
        qualifiedIds.has(instructor.id),
    );
}

export function formatLessonBookingSlotWhenLabel(
    slotCtx: LessonBookingSlotContext | null,
): string {
    if (!slotCtx) {
        return '';
    }

    const date = new Date(`${slotCtx.date}T12:00:00`);

    if (Number.isNaN(date.getTime())) {
        return `${slotCtx.date}, ${slotCtx.startTime}â€“${slotCtx.endTime}`;
    }

    const dateStr = date.toLocaleDateString('pl-PL', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });

    return `${dateStr}, ${slotCtx.startTime}â€“${slotCtx.endTime}`;
}

export function readLessonBookingFetchStatusCode(
    err: unknown,
): number | undefined {
    if (err !== null && typeof err === 'object' && 'statusCode' in err) {
        const code = (err as { statusCode: unknown }).statusCode;

        if (typeof code === 'number') {
            return code;
        }
    }

    return undefined;
}

export function buildLessonBookingSubmitBody(params: {
    slotCtx: LessonBookingSlotContext | null;
    studentUserId: string;
    courseId: string;
    instructorId: string;
    vehicleId: string;
}): { ok: true; body: CreateLessonBody } | { ok: false; error: string } {
    const ctx = params.slotCtx;

    if (!ctx) {
        return { ok: false, error: 'Brak kontekstu slotu.' };
    }

    const studentUserId = params.studentUserId.trim();
    const courseId = params.courseId.trim();
    const instructorId = params.instructorId.trim();
    const vehicleId = params.vehicleId.trim();

    if (!studentUserId) {
        return { ok: false, error: 'Wybierz kursanta.' };
    }

    if (!courseId) {
        return { ok: false, error: 'Wybierz kurs.' };
    }

    if (!instructorId) {
        return { ok: false, error: 'Wybierz instruktora.' };
    }

    if (!vehicleId) {
        return {
            ok: false,
            error: 'Wybierz pojazd dla jazdy praktycznej.',
        };
    }

    return {
        ok: true,
        body: {
            courseId,
            studentId: studentUserId,
            instructorId,
            startTime: buildSlotIsoUTC(ctx.date, ctx.startTime),
            endTime: buildSlotIsoUTC(ctx.date, ctx.endTime),
            lessonType: 'PRACTICE',
            vehicleId,
        },
    };
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
        filterLessonBookingCourses(studentCourses.value),
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
        filterLessonBookingAvailableInstructors({
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
            return 'â€”';
        }

        return `${instructor.firstName} ${instructor.lastName}`.trim();
    });

    const slotWhenLabel = computed(() =>
        formatLessonBookingSlotWhenLabel(options.slotCtx.value),
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
                'Nie udaĹ‚o siÄ™ wczytaÄ‡ kursĂłw kursanta.',
            );
        }
    });

    function handleClose(): void {
        options.open.value = false;
    }

    async function handleSubmit(): Promise<void> {
        formError.value = null;

        const result = buildLessonBookingSubmitBody({
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
                description: 'Lekcja zostaĹ‚a zapisana w systemie.',
                variant: 'success',
            });

            options.emitBooked();
            options.open.value = false;
        } catch (err: unknown) {
            const code = readLessonBookingFetchStatusCode(err);

            if (code === 409) {
                formError.value =
                    'Slot lub pojazd zostaĹ‚ juĹĽ zajÄ™ty. OdĹ›wieĹĽ kalendarz i sprĂłbuj ponownie.';
            } else {
                formError.value = getApiFetchErrorMessage(
                    err,
                    'Nie udaĹ‚o siÄ™ utworzyÄ‡ rezerwacji.',
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
