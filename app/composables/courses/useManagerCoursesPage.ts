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
    let schoolsLoadSeq = 0;
    let coursesLoadSeq = 0;

    async function loadSchools() {
        const seq = ++schoolsLoadSeq;

        schoolsLoadError.value = null;
        isSchoolsLoading.value = true;

        try {
            const items = await fetchSchoolsList();

            if (seq !== schoolsLoadSeq) {
                return;
            }

            schools.value = items;

            if (!items.some((school) => school.id === activeSchoolId.value)) {
                activeSchoolId.value = resolveInitialActiveSchoolId();
                await loadCourses();
            }
        } catch (e) {
            if (seq !== schoolsLoadSeq) {
                return;
            }

            schoolsLoadError.value =
                e instanceof Error
                    ? e.message
                    : 'Nie udało się pobrać listy OSK.';
        } finally {
            if (seq === schoolsLoadSeq) {
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
        const sid = activeSchoolId.value.trim();
        const seq = ++coursesLoadSeq;

        courses.value = [];
        coursesLoadError.value = null;

        if (!sid) {
            isCoursesLoading.value = false;

            return;
        }

        coursesLoadError.value = null;
        isCoursesLoading.value = true;

        try {
            const items = await fetchCoursesList(sid);

            if (seq !== coursesLoadSeq) {
                return;
            }

            courses.value = items;
        } catch (err) {
            if (seq !== coursesLoadSeq) {
                return;
            }

            courses.value = [];
            coursesLoadError.value = resolveCoursesListError(err);
        } finally {
            if (seq === coursesLoadSeq) {
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
        schoolsLoadSeq++;
        coursesLoadSeq++;
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
