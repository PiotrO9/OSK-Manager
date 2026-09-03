import {
    readQueryTruthyFlag,
    readUuidQueryValue,
} from '~/utils/students/managerStudentsPage';
import { useManagerStudentCourseAssignment } from './useManagerStudentCourseAssignment';
import { useManagerStudentRegistration } from './useManagerStudentRegistration';
import { useManagerStudentsListActions } from './useManagerStudentsListActions';
import { useManagerStudentsData } from './useManagerStudentsData';

export interface StudentsPagePagination {
    total: number;
    totalPages: number;
}

export function useManagerStudentsPage() {
    const route = useRoute();

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

    const {
        formDialogOpen,
        isFormSaving,
        apiError,
        openInitialRegisterForm,
        handleOpenCreateDialog,
        handleFormDialogOpenChange,
        handleStudentSubmit,
    } = useManagerStudentRegistration({
        schools,
        isSchoolsLoading,
        activeSchoolId,
        activeCourseId,
        currentPage,
        loadSchools,
        loadCoursesForFilter,
        loadStudents,
    });

    const {
        handleActiveSchoolChange,
        handleCourseFilterChange,
        handlePrevPage,
        handleNextPage,
    } = useManagerStudentsListActions({
        activeCourseId,
        currentPage,
        studentsPagination,
        isStudentsLoading,
        studentsLoadError,
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

    onMounted(async () => {
        await loadSchools();
        activeSchoolId.value = resolveInitialActiveSchoolId();

        if (openRegisterFormFromQuery.value) {
            openInitialRegisterForm();
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
