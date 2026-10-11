import type { DrivingSchool } from '~/types/schools/drivingSchool';
import type { CourseListItem } from '~/types/courses/course';
import { getApiErrorStatusCode } from '~/utils/api/apiEnvelope';
import { getApiFetchErrorMessage } from '~/utils/api/apiFetchErrorMessage';

export function useManagerCoursesPage() {
    function resolveCoursesListError(err: unknown): string {
        const status = getApiErrorStatusCode(err);

        if (status === 403) {
            return 'Brak dostępu do listy kursów dla wybranej szkoły.';
        }

        if (status !== undefined && status >= 500) {
            return 'Serwer jest chwilowo niedostępny. Spróbuj ponownie.';
        }

        if (err instanceof Error && err.message.trim().length > 0) {
            return err.message.trim();
        }

        return getApiFetchErrorMessage(
            err,
            'Nie udało się pobrać listy kursów.',
        );
    }

    const { fetchList: fetchSchoolsList } = useDrivingSchoolsApi();
    const { fetchList: fetchCoursesList, deleteCourse } = useCoursesApi();
    const { addToast } = useAppToast();

    const schools = ref<DrivingSchool[]>([]);
    const schoolsLoadError = ref<string | null>(null);
    const isSchoolsLoading = ref(false);

    const activeSchoolId = useManagerCoursesSelectedSchoolId();
    const courses = ref<CourseListItem[]>([]);
    const isCoursesLoading = ref(false);
    const coursesLoadError = ref<string | null>(null);
    const deleteActionError = shallowRef<string | null>(null);
    const coursePendingDelete = shallowRef<CourseListItem | null>(null);
    const isDeletingCourse = shallowRef(false);
    let schoolsLoadSequence = 0;
    let coursesLoadSequence = 0;

    async function loadSchools() {
        const requestSequence = ++schoolsLoadSequence;

        schoolsLoadError.value = null;
        isSchoolsLoading.value = true;

        try {
            const items = await fetchSchoolsList();

            if (requestSequence !== schoolsLoadSequence) {
                return;
            }

            schools.value = items;

            if (!items.some((school) => school.id === activeSchoolId.value)) {
                activeSchoolId.value = resolveInitialActiveSchoolId();
            }

            await loadCourses();
        } catch (error) {
            if (requestSequence !== schoolsLoadSequence) {
                return;
            }

            schoolsLoadError.value =
                error instanceof Error
                    ? error.message
                    : 'Nie udało się pobrać listy OSK.';
        } finally {
            if (requestSequence === schoolsLoadSequence) {
                isSchoolsLoading.value = false;
            }
        }
    }

    function resolveInitialActiveSchoolId(): string {
        return (
            schools.value.find((school) => school.isDefault)?.id ??
            schools.value[0]?.id ??
            ''
        );
    }

    async function loadCourses() {
        const schoolId = activeSchoolId.value.trim();
        const requestSequence = ++coursesLoadSequence;

        courses.value = [];
        coursesLoadError.value = null;

        if (!schoolId) {
            isCoursesLoading.value = false;

            return;
        }

        coursesLoadError.value = null;
        isCoursesLoading.value = true;

        try {
            const items = await fetchCoursesList(schoolId);

            if (requestSequence !== coursesLoadSequence) {
                return;
            }

            courses.value = items;
        } catch (err) {
            if (requestSequence !== coursesLoadSequence) {
                return;
            }

            courses.value = [];
            coursesLoadError.value = resolveCoursesListError(err);
        } finally {
            if (requestSequence === coursesLoadSequence) {
                isCoursesLoading.value = false;
            }
        }
    }

    async function handleActiveSchoolChange(value: string) {
        coursePendingDelete.value = null;
        deleteActionError.value = null;
        activeSchoolId.value = value;
        coursesLoadError.value = null;
        await loadCourses();
    }

    function requestDeleteCourse(course: CourseListItem) {
        deleteActionError.value = null;
        coursePendingDelete.value = course;
    }

    function cancelDeleteCourse() {
        if (!isDeletingCourse.value) coursePendingDelete.value = null;
    }

    async function confirmDeleteCourse() {
        const course = coursePendingDelete.value;

        if (!course || isDeletingCourse.value) return;

        const schoolId = activeSchoolId.value;

        isDeletingCourse.value = true;
        deleteActionError.value = null;

        try {
            await deleteCourse(course.id);
            coursePendingDelete.value = null;

            if (activeSchoolId.value === schoolId) {
                await loadCourses();
            }

            addToast({
                title: 'Kurs usunięty',
                description: `„${course.name}” został usunięty.`,
                variant: 'success',
            });
        } catch (err) {
            if (getApiErrorStatusCode(err) === 404) {
                coursePendingDelete.value = null;

                if (activeSchoolId.value === schoolId) await loadCourses();

                addToast({
                    title: 'Kurs jest już niedostępny',
                    variant: 'info',
                });
            } else {
                deleteActionError.value =
                    err instanceof Error
                        ? err.message
                        : 'Nie udało się usunąć kursu.';
            }
        } finally {
            isDeletingCourse.value = false;
        }
    }

    onMounted(loadSchools);
    onBeforeUnmount(() => {
        schoolsLoadSequence++;
        coursesLoadSequence++;
    });

    return {
        schools,
        courses,
        activeSchoolId,
        isSchoolsLoading,
        isCoursesLoading,
        schoolsLoadError,
        coursesLoadError,
        deleteActionError,
        coursePendingDelete,
        isDeletingCourse,
        handleActiveSchoolChange,
        loadSchools,
        loadCourses,
        requestDeleteCourse,
        cancelDeleteCourse,
        confirmDeleteCourse,
    };
}
