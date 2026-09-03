import type { Ref } from 'vue';

interface StudentsPagePagination {
    total: number;
    totalPages: number;
}

interface UseManagerStudentsListActionsOptions {
    activeCourseId: Ref<string>;
    currentPage: Ref<number>;
    studentsPagination: Ref<StudentsPagePagination | null>;
    isStudentsLoading: Ref<boolean>;
    studentsLoadError: Ref<string | null>;
    loadCoursesForFilter: () => Promise<void>;
    loadStudents: () => Promise<void>;
}

export function useManagerStudentsListActions({
    activeCourseId,
    currentPage,
    studentsPagination,
    isStudentsLoading,
    studentsLoadError,
    loadCoursesForFilter,
    loadStudents,
}: UseManagerStudentsListActionsOptions) {
    async function handleActiveSchoolChange(): Promise<void> {
        activeCourseId.value = '';
        currentPage.value = 1;
        studentsLoadError.value = null;

        await Promise.all([loadCoursesForFilter(), loadStudents()]);
    }

    async function handleCourseFilterChange(): Promise<void> {
        currentPage.value = 1;
        await loadStudents();
    }

    function handlePrevPage(): void {
        if (currentPage.value <= 1 || isStudentsLoading.value) return;

        currentPage.value -= 1;
        void loadStudents();
    }

    function handleNextPage(): void {
        const max = studentsPagination.value?.totalPages ?? 0;

        if (currentPage.value >= max || isStudentsLoading.value) return;

        currentPage.value += 1;
        void loadStudents();
    }

    return {
        handleActiveSchoolChange,
        handleCourseFilterChange,
        handlePrevPage,
        handleNextPage,
    };
}
