import type { CourseListItem } from '~/types/courses/course';
import type { DrivingSchool } from '~/types/schools/drivingSchool';
import type { StudentListItem } from '~/types/students/student';
import { resolveStudentsListError } from '~/utils/students/managerStudentsPage';

const STUDENTS_PAGE_LIMIT = 20;

interface StudentsPagePagination {
    total: number;
    totalPages: number;
}

export function useManagerStudentsData() {
    const { fetchList: fetchSchoolsList } = useDrivingSchoolsApi();
    const { fetchList: fetchCoursesList } = useCoursesApi();
    const { fetchList: fetchStudentsPage } = useStudentsApi();

    const schools = ref<DrivingSchool[]>([]);
    const schoolsLoadError = ref<string | null>(null);
    const isSchoolsLoading = ref(false);

    const activeSchoolId = ref('');
    const courses = ref<CourseListItem[]>([]);
    const isCoursesLoading = ref(false);
    const coursesLoadError = ref<string | null>(null);

    const activeCourseId = ref('');
    const currentPage = ref(1);

    const students = ref<StudentListItem[]>([]);
    const studentsPagination = ref<StudentsPagePagination | null>(null);
    const isStudentsLoading = ref(false);
    const studentsLoadError = ref<string | null>(null);

    const activeSchool = computed(
        () =>
            schools.value.find(
                (school) => school.id === activeSchoolId.value,
            ) ?? null,
    );

    const activeCourse = computed(
        () =>
            courses.value.find(
                (course) => course.id === activeCourseId.value,
            ) ?? null,
    );

    const totalStudentsCount = computed(
        () => studentsPagination.value?.total ?? students.value.length,
    );

    const activeStudentsOnPage = computed(
        () => students.value.filter((student) => student.isActive).length,
    );

    const studentsWithPkkOnPage = computed(
        () =>
            students.value.filter(
                (student) =>
                    student.pkkNumber !== null && student.pkkNumber.length > 0,
            ).length,
    );

    const visibleStudentsLabel = computed(() => {
        const total = studentsPagination.value?.total ?? students.value.length;

        if (total === students.value.length) {
            return `${students.value.length} wyników`;
        }

        return `${students.value.length} z ${total} wyników`;
    });

    async function loadSchools() {
        schoolsLoadError.value = null;
        isSchoolsLoading.value = true;

        try {
            schools.value = await fetchSchoolsList();
        } catch (e) {
            schoolsLoadError.value =
                e instanceof Error
                    ? e.message
                    : 'Nie udało się pobrać listy OSK.';
        } finally {
            isSchoolsLoading.value = false;
        }
    }

    async function loadCoursesForFilter() {
        const sid = activeSchoolId.value.trim();

        if (!sid) {
            courses.value = [];

            return;
        }

        coursesLoadError.value = null;
        isCoursesLoading.value = true;

        try {
            courses.value = await fetchCoursesList(sid);
        } catch (err) {
            courses.value = [];
            coursesLoadError.value =
                err instanceof Error
                    ? err.message
                    : 'Nie udało się pobrać listy kursów.';
        } finally {
            isCoursesLoading.value = false;
        }
    }

    async function loadStudents() {
        const sid = activeSchoolId.value.trim();

        if (!sid) {
            students.value = [];
            studentsPagination.value = null;

            return;
        }

        studentsLoadError.value = null;
        isStudentsLoading.value = true;

        try {
            const courseIdTrimmed = activeCourseId.value.trim();
            const page = await fetchStudentsPage({
                schoolId: sid,
                page: currentPage.value,
                limit: STUDENTS_PAGE_LIMIT,
                ...(courseIdTrimmed.length > 0
                    ? { courseId: courseIdTrimmed }
                    : {}),
            });

            students.value = page.items;
            studentsPagination.value = {
                total: page.total,
                totalPages: page.totalPages,
            };
        } catch (err) {
            students.value = [];
            studentsPagination.value = null;
            studentsLoadError.value = resolveStudentsListError(err);
        } finally {
            isStudentsLoading.value = false;
        }
    }

    return {
        schools,
        schoolsLoadError,
        isSchoolsLoading,
        activeSchoolId,
        courses,
        isCoursesLoading,
        coursesLoadError,
        activeCourseId,
        currentPage,
        students,
        studentsPagination,
        isStudentsLoading,
        studentsLoadError,
        activeSchool,
        activeCourse,
        totalStudentsCount,
        activeStudentsOnPage,
        studentsWithPkkOnPage,
        visibleStudentsLabel,
        loadSchools,
        loadCoursesForFilter,
        loadStudents,
    };
}
