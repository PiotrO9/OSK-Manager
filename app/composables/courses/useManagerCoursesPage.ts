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

    const route = useRoute();
    const { fetchList: fetchSchoolsList } = useDrivingSchoolsApi();
    const { fetchList: fetchCoursesList } = useCoursesApi();

    const schools = ref<DrivingSchool[]>([]);
    const schoolsLoadError = ref<string | null>(null);
    const isSchoolsLoading = ref(false);

    const activeSchoolId = ref('');
    const courses = ref<CourseListItem[]>([]);
    const isCoursesLoading = ref(false);
    const coursesLoadError = ref<string | null>(null);
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
                await loadCourses();
            }
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
        const requested =
            typeof route.query.schoolId === 'string'
                ? route.query.schoolId
                : '';

        return (
            schools.value.find((school) => school.id === requested)?.id ??
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
        activeSchoolId.value = value;
        coursesLoadError.value = null;
        await loadCourses();
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
        handleActiveSchoolChange,
        loadSchools,
        loadCourses,
    };
}
