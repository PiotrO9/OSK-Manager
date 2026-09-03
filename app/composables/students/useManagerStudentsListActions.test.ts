import { describe, expect, it, vi } from 'vitest';
import { ref } from 'vue';

interface StudentsPagePagination {
    total: number;
    totalPages: number;
}

function createListActionsOptions() {
    return {
        activeCourseId: ref('course-1'),
        currentPage: ref(3),
        studentsPagination: ref<StudentsPagePagination | null>({
            total: 50,
            totalPages: 5,
        }),
        isStudentsLoading: ref(false),
        studentsLoadError: ref<string | null>('Błąd listy'),
        loadCoursesForFilter: vi.fn().mockResolvedValue(undefined),
        loadStudents: vi.fn().mockResolvedValue(undefined),
    };
}

describe('useManagerStudentsListActions', () => {
    it('resets course, page and error when active school changes', async () => {
        const options = createListActionsOptions();
        const { useManagerStudentsListActions } =
            await import('./useManagerStudentsListActions');
        const actions = useManagerStudentsListActions(options);

        await actions.handleActiveSchoolChange();

        expect(options.activeCourseId.value).toBe('');
        expect(options.currentPage.value).toBe(1);
        expect(options.studentsLoadError.value).toBeNull();
        expect(options.loadCoursesForFilter).toHaveBeenCalledTimes(1);
        expect(options.loadStudents).toHaveBeenCalledTimes(1);
    });

    it('resets page and reloads students when course filter changes', async () => {
        const options = createListActionsOptions();
        const { useManagerStudentsListActions } =
            await import('./useManagerStudentsListActions');
        const actions = useManagerStudentsListActions(options);

        await actions.handleCourseFilterChange();

        expect(options.currentPage.value).toBe(1);
        expect(options.loadStudents).toHaveBeenCalledTimes(1);
        expect(options.loadCoursesForFilter).not.toHaveBeenCalled();
    });

    it('moves to previous page and reloads students when possible', async () => {
        const options = createListActionsOptions();
        const { useManagerStudentsListActions } =
            await import('./useManagerStudentsListActions');
        const actions = useManagerStudentsListActions(options);

        actions.handlePrevPage();

        expect(options.currentPage.value).toBe(2);
        expect(options.loadStudents).toHaveBeenCalledTimes(1);
    });

    it('does not move to previous page on first page or during loading', async () => {
        const { useManagerStudentsListActions } =
            await import('./useManagerStudentsListActions');

        const firstPageOptions = createListActionsOptions();

        firstPageOptions.currentPage.value = 1;
        useManagerStudentsListActions(firstPageOptions).handlePrevPage();

        const loadingOptions = createListActionsOptions();

        loadingOptions.isStudentsLoading.value = true;
        useManagerStudentsListActions(loadingOptions).handlePrevPage();

        expect(firstPageOptions.currentPage.value).toBe(1);
        expect(firstPageOptions.loadStudents).not.toHaveBeenCalled();
        expect(loadingOptions.currentPage.value).toBe(3);
        expect(loadingOptions.loadStudents).not.toHaveBeenCalled();
    });

    it('moves to next page and reloads students when possible', async () => {
        const options = createListActionsOptions();
        const { useManagerStudentsListActions } =
            await import('./useManagerStudentsListActions');
        const actions = useManagerStudentsListActions(options);

        actions.handleNextPage();

        expect(options.currentPage.value).toBe(4);
        expect(options.loadStudents).toHaveBeenCalledTimes(1);
    });

    it('does not move to next page on last page, without pagination, or during loading', async () => {
        const { useManagerStudentsListActions } =
            await import('./useManagerStudentsListActions');

        const lastPageOptions = createListActionsOptions();

        lastPageOptions.currentPage.value = 5;
        useManagerStudentsListActions(lastPageOptions).handleNextPage();

        const missingPaginationOptions = createListActionsOptions();

        missingPaginationOptions.studentsPagination.value = null;
        useManagerStudentsListActions(
            missingPaginationOptions,
        ).handleNextPage();

        const loadingOptions = createListActionsOptions();

        loadingOptions.isStudentsLoading.value = true;
        useManagerStudentsListActions(loadingOptions).handleNextPage();

        expect(lastPageOptions.currentPage.value).toBe(5);
        expect(lastPageOptions.loadStudents).not.toHaveBeenCalled();
        expect(missingPaginationOptions.currentPage.value).toBe(3);
        expect(missingPaginationOptions.loadStudents).not.toHaveBeenCalled();
        expect(loadingOptions.currentPage.value).toBe(3);
        expect(loadingOptions.loadStudents).not.toHaveBeenCalled();
    });
});
