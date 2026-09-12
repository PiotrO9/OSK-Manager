import { useManagerInstructorDetailsCourseTypes } from './useManagerInstructorDetailsCourseTypes';
import { useManagerInstructorDetailsData } from './useManagerInstructorDetailsData';
import { useManagerInstructorDetailsDelete } from './useManagerInstructorDetailsDelete';
import { useManagerInstructorDetailsEdit } from './useManagerInstructorDetailsEdit';
import { useManagerInstructorDetailsRatingSummary } from './useManagerInstructorDetailsRatingSummary';
import { displayManagerInstructorText } from '~/utils/instructors/managerInstructorDetailsPage';
import { usePageMeta } from '../core/usePageMeta';

export function useManagerInstructorDetailsPage() {
    const route = useRoute();

    const {
        editBaseline,
        editForm,
        errorMessage,
        instructor,
        isLoading,
        loadInstructor,
    } = useManagerInstructorDetailsData();
    const {
        courseTypes,
        courseTypesError,
        isCourseTypesLoading,
        loadCourseTypes,
    } = useManagerInstructorDetailsCourseTypes();
    const {
        isSubmitting,
        submitError,
        isEditDialogOpen,
        resetEditState,
        handleEnterEdit,
        handleSubmitEdit,
    } = useManagerInstructorDetailsEdit({
        instructor,
        editForm,
        editBaseline,
    });
    const {
        isDeleteDialogOpen,
        isDeleting,
        handleOpenDeleteDialog,
        handleDeleteDialogCancel,
        handleDeleteDialogOpenChange,
        handleDeleteDialogConfirm,
    } = useManagerInstructorDetailsDelete({
        isSubmitting,
        isEditDialogOpen,
    });
    const { ratingSummary, isRatingSummaryLoading, loadRatingSummary } =
        useManagerInstructorDetailsRatingSummary();

    const instructorSubpageQuery = computed<Record<string, string>>(() => {
        const schoolId = instructor.value?.schoolId.trim() ?? '';
        const query: Record<string, string> = {};

        if (!schoolId) {
            return query;
        }

        query.schoolId = schoolId;

        return query;
    });

    usePageMeta({
        title: () => instructor.value?.name?.trim() || 'Instruktor',
        description: () => 'Szczegóły instruktora.',
    });

    watch(
        () => route.params.id,
        async (id) => {
            resetEditState();
            isDeleteDialogOpen.value = false;
            await Promise.all([loadInstructor(id), loadCourseTypes()]);
            await loadRatingSummary(id, instructor.value?.schoolId ?? '');
        },
        { immediate: true },
    );

    return {
        route,
        instructor,
        editForm,
        courseTypes,
        courseTypesError,
        isLoading,
        errorMessage,
        isSubmitting,
        submitError,
        isEditDialogOpen,
        isDeleteDialogOpen,
        isDeleting,
        ratingSummary,
        isRatingSummaryLoading,
        isCourseTypesLoading,
        instructorSubpageQuery,
        displayText: displayManagerInstructorText,
        loadInstructor,
        handleEnterEdit,
        handleSubmitEdit,
        handleOpenDeleteDialog,
        handleDeleteDialogCancel,
        handleDeleteDialogOpenChange,
        handleDeleteDialogConfirm,
    };
}
