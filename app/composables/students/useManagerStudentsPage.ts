import type { StudentRegisterPayload } from '~/components/manager/students/ManagerStudentFormDialog.vue';
import type { CourseListItem } from '~/types/courses/course';
import type { DrivingSchool } from '~/types/schools/drivingSchool';
import {
    formatStudentDisplayName,
    type StudentListItem,
} from '~/types/students/student';
import {
    readQueryTruthyFlag,
    readUuidQueryValue,
    resolveAssignToCourseError,
    resolveStudentsListError,
} from '~/utils/students/managerStudentsPage';

const STUDENTS_PAGE_LIMIT = 20;

export interface StudentsPagePagination {
    total: number;
    totalPages: number;
}

export function useManagerStudentsPage() {
    const route = useRoute();
    const { fetchList: fetchSchoolsList } = useDrivingSchoolsApi();
    const { fetchList: fetchCoursesList } = useCoursesApi();
    const { fetchList: fetchStudentsPage, assignToCourse } = useStudentsApi();
    const { addToast } = useAppToast();
    const {
        isSaving: isFormSaving,
        apiError,
        createStudent,
        clearCreateError,
        resolveStudentRegisterError,
    } = useManagerStudentCreate();

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

    const formDialogOpen = ref(false);

    const assignDialogOpen = ref(false);
    const assignTargetStudent = ref<StudentListItem | null>(null);
    const isAssignSaving = ref(false);
    const assignApiError = ref<string | null>(null);

    const openRegisterFormFromQuery = computed((): boolean => {
        return readQueryTruthyFlag(route.query.register);
    });

    const prefillSchoolId = computed((): string | null => {
        return readUuidQueryValue(route.query.schoolId);
    });

    const assignTargetDisplayName = computed(() => {
        const s = assignTargetStudent.value;

        if (!s) {
            return '';
        }

        return formatStudentDisplayName(s);
    });

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

    function resolveInitialActiveSchoolId(): string {
        const pre = prefillSchoolId.value;

        if (pre && schools.value.some((s) => s.id === pre)) {
            return pre;
        }

        return schools.value[0]?.id ?? '';
    }

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

    async function handleActiveSchoolChange() {
        activeCourseId.value = '';
        currentPage.value = 1;
        studentsLoadError.value = null;

        await Promise.all([loadCoursesForFilter(), loadStudents()]);
    }

    async function handleCourseFilterChange() {
        currentPage.value = 1;
        await loadStudents();
    }

    function handlePrevPage() {
        if (currentPage.value <= 1 || isStudentsLoading.value) return;

        currentPage.value -= 1;
        void loadStudents();
    }

    function handleNextPage() {
        const max = studentsPagination.value?.totalPages ?? 0;

        if (currentPage.value >= max || isStudentsLoading.value) return;

        currentPage.value += 1;
        void loadStudents();
    }

    function handleOpenCreateDialog() {
        clearCreateError();
        formDialogOpen.value = true;

        if (schools.value.length === 0 && !isSchoolsLoading.value) {
            loadSchools();
        }
    }

    function handleFormDialogOpenChange(open: boolean) {
        formDialogOpen.value = open;

        if (!open) {
            clearCreateError();
        }
    }

    function handleOpenAssignCourse(student: StudentListItem) {
        assignTargetStudent.value = student;
        assignApiError.value = null;
        assignDialogOpen.value = true;

        if (!activeSchoolId.value.trim()) {
            return;
        }

        if (courses.value.length === 0 && !isCoursesLoading.value) {
            void loadCoursesForFilter();
        }
    }

    function handleAssignDialogOpenChange(open: boolean) {
        assignDialogOpen.value = open;

        if (!open) {
            assignTargetStudent.value = null;
            assignApiError.value = null;
        }
    }

    async function handleAssignCourseSubmit(courseId: string) {
        const student = assignTargetStudent.value;

        if (!student || isAssignSaving.value) {
            return;
        }

        assignApiError.value = null;
        isAssignSaving.value = true;

        try {
            await assignToCourse({ userId: student.userId, courseId });

            addToast({
                title: 'Kursant zapisany na kurs',
                variant: 'success',
            });

            assignDialogOpen.value = false;
            assignTargetStudent.value = null;

            await loadStudents();
        } catch (err) {
            const message = resolveAssignToCourseError(err);

            assignApiError.value = message;

            addToast({
                title: 'Nie udało się zapisać na kurs',
                description: message,
                variant: 'error',
            });
        } finally {
            isAssignSaving.value = false;
        }
    }

    async function handleStudentSubmit(payload: StudentRegisterPayload) {
        if (isFormSaving.value) return;

        try {
            await createStudent(payload);

            addToast({
                title: 'Kursant został utworzony',
                variant: 'success',
            });

            formDialogOpen.value = false;

            if (schools.value.some((s) => s.id === payload.schoolId)) {
                activeSchoolId.value = payload.schoolId;
            }

            activeCourseId.value = '';
            currentPage.value = 1;

            if (activeSchoolId.value) {
                await Promise.all([loadCoursesForFilter(), loadStudents()]);
            }

            await navigateTo('/manager/students', { replace: true });
        } catch (err) {
            const message = resolveStudentRegisterError(err);

            addToast({
                title: 'Nie udało się utworzyć konta',
                description: message,
                variant: 'error',
            });
        }
    }

    onMounted(async () => {
        await loadSchools();
        activeSchoolId.value = resolveInitialActiveSchoolId();

        if (openRegisterFormFromQuery.value) {
            clearCreateError();
            formDialogOpen.value = true;
        }

        if (activeSchoolId.value) {
            await Promise.all([loadCoursesForFilter(), loadStudents()]);
        }
    });

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
        formDialogOpen,
        assignDialogOpen,
        assignTargetDisplayName,
        isAssignSaving,
        assignApiError,
        isFormSaving,
        apiError,
        prefillSchoolId,
        activeSchool,
        activeCourse,
        totalStudentsCount,
        activeStudentsOnPage,
        studentsWithPkkOnPage,
        visibleStudentsLabel,
        loadSchools,
        loadStudents,
        handleActiveSchoolChange,
        handleCourseFilterChange,
        handlePrevPage,
        handleNextPage,
        handleOpenCreateDialog,
        handleFormDialogOpenChange,
        handleOpenAssignCourse,
        handleAssignDialogOpenChange,
        handleAssignCourseSubmit,
        handleStudentSubmit,
    };
}
