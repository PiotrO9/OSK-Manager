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
        studentViewCounts,
        isStudentsLoading,
        studentsLoadError,
        activeSchool,
        activeCourse,
        search,
        quickView,
        advancedFilters,
        totalStudentsCount,
        activeStudentsOnPage,
        studentsWithPkkOnPage,
        visibleStudentsLabel,
        invalidateStudentsRequest,
        loadSchools,
        loadCoursesForFilter,
        loadStudents,
    } = useManagerStudentsData();

    const advancedFilterState = useManagerStudentsAdvancedFilters({
        advancedFilters,
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

    const listActions = useManagerStudentsListActions({
        activeCourseId,
        currentPage,
        studentsPagination,
        isStudentsLoading,
        studentsLoadError,
        loadCoursesForFilter,
        loadStudents,
    });

    async function handleActiveSchoolChange(): Promise<void> {
        advancedFilterState.clearConcreteCourseFilters();
        await listActions.handleActiveSchoolChange();
    }

    const { handleCourseFilterChange, handlePrevPage, handleNextPage } =
        listActions;

    let resettingFilters = false;

    watch(
        [search, quickView, advancedFilters],
        ([text], [previousText], onCleanup) => {
            if (resettingFilters) return;

            invalidateStudentsRequest();
            currentPage.value = 1;
            const timer = setTimeout(
                () => {
                    void loadStudents();
                },
                text !== previousText && text.trim() ? 350 : 0,
            );

            onCleanup(() => clearTimeout(timer));
        },
    );

    const { prefillSchoolId, initialSchoolId } = useManagerStudentsPageInit({
        schools,
        activeSchoolId,
        loadSchools,
        loadCoursesForFilter,
        loadStudents,
        openInitialRegisterForm,
    });

    async function clearAllStudentFilters(): Promise<void> {
        const schoolChanged = activeSchoolId.value !== initialSchoolId.value;
        const hasFilters =
            schoolChanged ||
            search.value !== '' ||
            quickView.value !== 'all' ||
            activeCourseId.value !== '' ||
            advancedFilters.value.length > 0;

        resettingFilters = true;
        activeSchoolId.value = initialSchoolId.value;
        search.value = '';
        quickView.value = 'all';
        activeCourseId.value = '';
        advancedFilterState.clearAdvancedFilters();
        currentPage.value = 1;
        await nextTick();
        resettingFilters = false;

        if (hasFilters) {
            if (schoolChanged) {
                await loadCoursesForFilter();
            }

            await loadStudents();
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
        studentViewCounts,
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
        initialSchoolId,
        search,
        quickView,
        advancedFilters,
        advancedFiltersCount: advancedFilterState.advancedFiltersCount,
        hasAdvancedFilters: advancedFilterState.hasAdvancedFilters,
        advancedFilterDraft: advancedFilterState.draft,
        advancedFilterDraftError: advancedFilterState.draftError,
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
        clearAllStudentFilters,
        startNewAdvancedFilter: advancedFilterState.startNewFilter,
        startEditAdvancedFilter: advancedFilterState.startEditFilter,
        updateAdvancedFilterDraft: advancedFilterState.updateDraft,
        applyAdvancedFilterDraft: advancedFilterState.applyDraft,
        removeAdvancedFilter: advancedFilterState.removeFilter,
        clearAdvancedFilters: advancedFilterState.clearAdvancedFilters,
        handleOpenCreateDialog,
        handleFormDialogOpenChange,
        handleOpenAssignCourse,
        handleAssignDialogOpenChange,
        handleAssignCourseSubmit,
        handleStudentSubmit,
    };
}
