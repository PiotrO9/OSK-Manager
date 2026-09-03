import {
    normalizeInstructorDetail,
    normalizeInstructorDetailForEdit,
    type InstructorDetail,
} from '~/types/instructors/instructor';
import type { LessonRatingsSummary } from '~/types/lessons/lessonRating';
import { useManagerInstructorDetailsCourseTypes } from './useManagerInstructorDetailsCourseTypes';
import { useManagerInstructorDetailsData } from './useManagerInstructorDetailsData';
import {
    buildManagerInstructorDirtyPatch,
    displayManagerInstructorText,
    getManagerInstructorDeleteErrorMessage,
    getManagerInstructorGenericSaveErrorMessage,
    getManagerInstructorRouteString,
    getManagerInstructorSaveErrorMessage,
    validateManagerInstructorPatch,
} from '~/utils/instructors/managerInstructorDetailsPage';
import { requestBffData, requestBffSuccess } from '../core/useApi';
import { usePageMeta } from '../core/usePageMeta';

type InstructorDetailData = InstructorDetail | null;

export function useManagerInstructorDetailsPage() {
    const route = useRoute();
    const { addToast } = useAppToast();
    const { fetchInstructorRatings } = useLessonRatingsListApi();

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
    const isSubmitting = ref(false);
    const submitError = ref<string | null>(null);
    const isEditDialogOpen = ref(false);
    const isDeleteDialogOpen = ref(false);
    const isDeleting = ref(false);
    const ratingSummary = ref<LessonRatingsSummary>({
        averageRating: null,
        totalCount: 0,
    });
    const isRatingSummaryLoading = ref(false);

    const instructorSubpageQuery = computed((): Record<string, string> => {
        const schoolId = getManagerInstructorRouteString(route.query.schoolId);

        return schoolId.length > 0 ? { schoolId } : {};
    });

    usePageMeta({
        title: () => instructor.value?.name?.trim() || 'Instruktor',
        description: () => 'Szczegóły instruktora.',
    });

    async function loadRatingSummary(rawId: unknown): Promise<void> {
        const id = getManagerInstructorRouteString(rawId);
        const schoolId = getManagerInstructorRouteString(route.query.schoolId);

        ratingSummary.value = { averageRating: null, totalCount: 0 };

        if (!id || !schoolId) {
            return;
        }

        isRatingSummaryLoading.value = true;

        try {
            const payload = await fetchInstructorRatings(id, {
                schoolId,
                period: 'all',
                limit: 1,
            });

            ratingSummary.value = payload.summary;
        } catch {
            ratingSummary.value = { averageRating: null, totalCount: 0 };
        } finally {
            isRatingSummaryLoading.value = false;
        }
    }

    watch(
        () => route.params.id,
        async (id) => {
            submitError.value = null;
            isEditDialogOpen.value = false;
            isDeleteDialogOpen.value = false;
            await Promise.all([
                loadInstructor(id),
                loadCourseTypes(),
                loadRatingSummary(id),
            ]);
        },
        { immediate: true },
    );

    watch(isEditDialogOpen, (open) => {
        if (open) {
            return;
        }

        submitError.value = null;

        if (editBaseline.value && editForm.value) {
            editForm.value = { ...editBaseline.value };
        }
    });

    function handleEnterEdit(): void {
        submitError.value = null;

        if (editBaseline.value) {
            editForm.value = { ...editBaseline.value };
        }

        isEditDialogOpen.value = true;
    }

    async function handleSubmitEdit(): Promise<void> {
        submitError.value = null;

        const patch = buildManagerInstructorDirtyPatch(
            editForm.value,
            editBaseline.value,
        );

        if (!patch) {
            isEditDialogOpen.value = false;

            return;
        }

        const validationMessage = validateManagerInstructorPatch(patch);

        if (validationMessage) {
            submitError.value = validationMessage;

            return;
        }

        const id = getManagerInstructorRouteString(route.params.id);

        if (!id) {
            return;
        }

        isSubmitting.value = true;

        try {
            const updated = await requestBffData<InstructorDetailData>(
                'PATCH',
                `/api/instructors/${encodeURIComponent(id)}`,
                {
                    body: patch,
                    fallbackMessage:
                        getManagerInstructorGenericSaveErrorMessage(),
                },
            );
            const normalized = normalizeInstructorDetail(updated);
            const forEdit = normalizeInstructorDetailForEdit(updated);

            if (!normalized || !forEdit) {
                submitError.value =
                    'Nieprawidłowa odpowiedź serwera po zapisie. Spróbuj ponownie.';

                return;
            }

            instructor.value = normalized;
            editForm.value = { ...forEdit };
            editBaseline.value = { ...forEdit };

            addToast({
                title: 'Zapisano zmiany',
                description: 'Dane instruktora zostały zaktualizowane.',
                variant: 'success',
            });

            isEditDialogOpen.value = false;
        } catch (err: unknown) {
            submitError.value = getManagerInstructorSaveErrorMessage(err);
        } finally {
            isSubmitting.value = false;
        }
    }

    function handleOpenDeleteDialog(): void {
        if (isDeleting.value || isSubmitting.value) {
            return;
        }

        isEditDialogOpen.value = false;
        isDeleteDialogOpen.value = true;
    }

    function handleDeleteDialogCancel(): void {
        isDeleteDialogOpen.value = false;
    }

    function handleDeleteDialogOpenChange(open: boolean): void {
        isDeleteDialogOpen.value = open;
    }

    async function runDeleteInstructor(): Promise<void> {
        if (isDeleting.value) {
            return;
        }

        const id = getManagerInstructorRouteString(route.params.id);

        if (!id) {
            return;
        }

        isDeleting.value = true;

        try {
            await requestBffSuccess(
                'DELETE',
                `/api/instructors/${encodeURIComponent(id)}`,
                {
                    fallbackMessage: 'Nie udało się usunąć instruktora.',
                },
            );

            addToast({
                title: 'Instruktor został usunięty',
                variant: 'success',
            });

            isEditDialogOpen.value = false;

            await navigateTo('/manager/instructors');
        } catch (err: unknown) {
            addToast({
                title: 'Nie udało się usunąć instruktora',
                description: getManagerInstructorDeleteErrorMessage(err),
                variant: 'error',
            });
        } finally {
            isDeleting.value = false;
        }
    }

    async function handleDeleteDialogConfirm(): Promise<void> {
        isDeleteDialogOpen.value = false;
        await runDeleteInstructor();
    }

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
