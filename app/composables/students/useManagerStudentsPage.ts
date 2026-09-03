import type { StudentRegisterPayload } from '~/components/manager/students/ManagerStudentFormDialog.vue';
import {
    readQueryTruthyFlag,
    readUuidQueryValue,
} from '~/utils/students/managerStudentsPage';
import { useManagerStudentCourseAssignment } from './useManagerStudentCourseAssignment';
import { useManagerStudentsData } from './useManagerStudentsData';

export interface StudentsPagePagination {
    total: number;
    totalPages: number;
}

export function useManagerStudentsPage() {
    const route = useRoute();
    const { addToast } = useAppToast();
    const {
        isSaving: isFormSaving,
        apiError,
        createStudent,
        clearCreateError,
        resolveStudentRegisterError,
    } = useManagerStudentCreate();

    const {
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
    } = useManagerStudentsData();

    const formDialogOpen = ref(false);

    const openRegisterFormFromQuery = computed((): boolean => {
        return readQueryTruthyFlag(route.query.register);
    });

    const prefillSchoolId = computed((): string | null => {
        return readUuidQueryValue(route.query.schoolId);
    });

    const {
        assignDialogOpen,
        assignTargetDisplayName,
        isAssignSaving,
        assignApiError,
        handleOpenAssignCourse,
        handleAssignDialogOpenChange,
        handleAssignCourseSubmit,
    } = useManagerStudentCourseAssignment({
        activeSchoolId,
        courses,
        isCoursesLoading,
        loadCoursesForFilter,
        loadStudents,
    });

    function resolveInitialActiveSchoolId(): string {
        const pre = prefillSchoolId.value;

        if (pre && schools.value.some((s) => s.id === pre)) {
            return pre;
        }

        return schools.value[0]?.id ?? '';
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
