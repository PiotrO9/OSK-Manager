import type { Ref } from 'vue';
import {
    getManagerInstructorDeleteErrorMessage,
    getManagerInstructorRouteString,
} from '~/utils/instructors/managerInstructorDetailsPage';
import { requestBffSuccess } from '../core/useApi';

interface UseManagerInstructorDetailsDeleteOptions {
    isSubmitting: Ref<boolean>;
    isEditDialogOpen: Ref<boolean>;
}

export function useManagerInstructorDetailsDelete({
    isSubmitting,
    isEditDialogOpen,
}: UseManagerInstructorDetailsDeleteOptions) {
    const route = useRoute();
    const { addToast } = useAppToast();

    const isDeleteDialogOpen = ref(false);
    const isDeleting = ref(false);

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
        isDeleteDialogOpen,
        isDeleting,
        handleOpenDeleteDialog,
        handleDeleteDialogCancel,
        handleDeleteDialogOpenChange,
        handleDeleteDialogConfirm,
    };
}
