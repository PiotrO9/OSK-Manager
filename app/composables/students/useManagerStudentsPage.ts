import { useManagerStudentCourseAssignment } from './useManagerStudentCourseAssignment';
import { useManagerStudentRegistration } from './useManagerStudentRegistration';
import { useManagerStudentsListActions } from './useManagerStudentsListActions';
import { useManagerStudentsPageInit } from './useManagerStudentsPageInit';
import { useManagerStudentsData } from './useManagerStudentsData';

export interface StudentsPagePagination {
    total: number;
    totalPages: number;
}

export function useManagerStudentsPage() {
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

    const { prefillSchoolId } = useManagerStudentsPageInit({
        schools,
        activeSchoolId,
        loadSchools,
        loadCoursesForFilter,
        loadStudents,
        openInitialRegisterForm,
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
