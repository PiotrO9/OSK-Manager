import type { Ref } from 'vue';
import type { CourseListItem } from '~/types/courses/course';
import {
    instructorHasCourseCategoryQualification,
    type InstructorListItem,
} from '~/types/instructors/instructor';
import type { LessonBookingSlotContext } from '~/types/lessons/lessonBooking';
import { getApiFetchErrorMessage } from '~/utils/api/apiFetchErrorMessage';
import { buildSlotIsoUTC } from '~/utils/date/weeklyCalendarDates';

const DEFAULT_CREATE_ERROR = 'Nie udało się utworzyć bloku teorii.';
const DEFAULT_COURSES_LOAD_ERROR = 'Nie udało się wczytać listy kursów.';
const INVALID_CAPACITY_ERROR =
    'Limit miejsc musi być liczbą całkowitą ≥ 0 lub puste (bez limitu).';

interface UseManagerTheoryEventCreateDialogOptions {
    open: Ref<boolean>;
    schoolId: Ref<string>;
    slotCtx: Ref<LessonBookingSlotContext | null>;
    emitCreated: (payload: {
        eventId: string;
        capacity: number | null;
    }) => void;
}

export function useManagerTheoryEventCreateDialog({
    open,
    schoolId,
    slotCtx,
    emitCreated,
}: UseManagerTheoryEventCreateDialogOptions) {
    const { createInstructorEvent, isLoading } = useInstructorEventsApi();
    const { fetchList: fetchCoursesList } = useCoursesApi();
    const { fetchList: fetchInstructorsList } = useInstructorsApi();

    const selectedInstructorId = ref('');
    const theoryCourses = ref<CourseListItem[]>([]);
    const schoolInstructors = ref<InstructorListItem[]>([]);
    const isCoursesLoading = ref(false);
    const coursesLoadError = ref<string | null>(null);
    /** Puste = bez powiązania z kursem (POST bez courseId). */
    const selectedCourseId = ref('');
    /** `type="number"` + v-model może dać `number` lub `string`. */
    const capacityInput = ref<string | number>('');
    const formError = ref<string | null>(null);

    const selectedCourse = computed((): CourseListItem | null => {
        const courseId = selectedCourseId.value.trim();

        if (!courseId) {
            return null;
        }

        return (
            theoryCourses.value.find((course) => course.id === courseId) ?? null
        );
    });

    const filteredAvailableInstructors = computed(() => {
        const ctx = slotCtx.value;

        if (!ctx) {
            return [];
        }

        const course = selectedCourse.value;

        if (!course) {
            return ctx.availableInstructors;
        }

        const categoryCode = course.courseType?.code?.trim() || course.category;
        const qualifiedIds = new Set(
            schoolInstructors.value
                .filter((instructor) =>
                    instructorHasCourseCategoryQualification(
                        instructor,
                        categoryCode,
                    ),
                )
                .map((instructor) => instructor.id),
        );

        return ctx.availableInstructors.filter((instructor) =>
            qualifiedIds.has(instructor.id),
        );
    });

    const slotWhenLabel = computed((): string => {
        const s = slotCtx.value;

        if (!s) {
            return '';
        }

        const d = new Date(`${s.date}T12:00:00`);

        if (Number.isNaN(d.getTime())) {
            return `${s.date}, ${s.startTime}–${s.endTime}`;
        }

        const dateStr = d.toLocaleDateString('pl-PL', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });

        return `${dateStr}, ${s.startTime}–${s.endTime}`;
    });

    watch(
        [open, slotCtx],
        ([isOpen, ctx]) => {
            if (!isOpen || !ctx) {
                return;
            }

            formError.value = null;
            capacityInput.value = '';
            selectedCourseId.value = '';
            selectedInstructorId.value =
                ctx.availableInstructors.length === 1
                    ? (ctx.availableInstructors[0]?.id ?? '')
                    : '';
        },
        { flush: 'post' },
    );

    watch(
        [open, () => schoolId.value.trim()],
        async ([isOpen, sid]) => {
            theoryCourses.value = [];
            schoolInstructors.value = [];
            coursesLoadError.value = null;

            if (!isOpen || !sid) {
                return;
            }

            isCoursesLoading.value = true;

            try {
                const [courses, instructors] = await Promise.all([
                    fetchCoursesList(sid),
                    fetchInstructorsList(sid).catch(() => []),
                ]);

                theoryCourses.value = courses;
                schoolInstructors.value = instructors;
            } catch (err: unknown) {
                coursesLoadError.value = getApiFetchErrorMessage(
                    err,
                    DEFAULT_COURSES_LOAD_ERROR,
                );
            } finally {
                isCoursesLoading.value = false;
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

    function handleClose(): void {
        open.value = false;
    }

    async function handleSubmit(): Promise<void> {
        formError.value = null;

        const ctx = slotCtx.value;

        if (!ctx) {
            formError.value = 'Brak kontekstu slotu.';

            return;
        }

        const instructorId = selectedInstructorId.value.trim();

        if (!instructorId) {
            formError.value = 'Wybierz instruktora.';

            return;
        }

        const capParsed = parseTheoryEventCapacity(capacityInput.value);

        if (capParsed === false) {
            formError.value = INVALID_CAPACITY_ERROR;

            return;
        }

        const startIso = buildSlotIsoUTC(ctx.date, ctx.startTime);
        const endIso = buildSlotIsoUTC(ctx.date, ctx.endTime);

        try {
            const cid = selectedCourseId.value.trim();

            const event = await createInstructorEvent({
                instructorId,
                type: 'THEORY',
                startTime: startIso,
                endTime: endIso,
                capacity: capParsed,
                ...(cid ? { courseId: cid } : {}),
            });

            const cap =
                event.capacity !== undefined && event.capacity !== null
                    ? event.capacity
                    : capParsed;

            emitCreated({ eventId: event.id, capacity: cap });
            open.value = false;
        } catch (err: unknown) {
            formError.value = getApiFetchErrorMessage(
                err,
                DEFAULT_CREATE_ERROR,
            );
        }
    }

    return {
        capacityInput,
        coursesLoadError,
        filteredAvailableInstructors,
        formError,
        handleClose,
        handleSubmit,
        isCoursesLoading,
        isLoading,
        schoolInstructors,
        selectedCourseId,
        selectedInstructorId,
        slotWhenLabel,
        theoryCourses,
    };
}

export function parseTheoryEventCapacity(raw: unknown): number | null | false {
    if (raw === null || raw === undefined) {
        return null;
    }

    if (typeof raw === 'number') {
        if (!Number.isFinite(raw)) {
            return null;
        }

        if (raw < 0) {
            return false;
        }

        return Math.trunc(raw);
    }

    const t = String(raw).trim();

    if (t === '') {
        return null;
    }

    const n = Number.parseInt(t, 10);

    if (!Number.isFinite(n) || n < 0) {
        return false;
    }

    return n;
}
