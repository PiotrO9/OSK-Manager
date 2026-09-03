import type { ComputedRef, Ref } from 'vue';
import { getApiFetchErrorMessage } from '~/utils/api/apiFetchErrorMessage';

type ScheduleBackHref =
    | string
    | {
          path: string;
          query?: Record<string, string>;
      };

interface ManagerEventEditDeleteToast {
    title: string;
    description?: string;
    variant: 'success' | 'error';
}

interface UseManagerEventEditDeleteActionInput {
    eventId: ComputedRef<string>;
    scheduleBackHref: ComputedRef<ScheduleBackHref>;
    isDeleteLoading: Ref<boolean>;
    deleteInstructorEvent: (id: string) => Promise<void>;
    addToast: (toast: ManagerEventEditDeleteToast) => void;
}

export function useManagerEventEditDeleteAction(
    input: UseManagerEventEditDeleteActionInput,
) {
    const deleteDialogOpen = ref(false);

    function handleOpenDeleteDialog(): void {
        deleteDialogOpen.value = true;
    }

    function handleDeleteDialogCancel(): void {
        deleteDialogOpen.value = false;
    }

    async function handleDeleteDialogConfirm(): Promise<void> {
        const id = input.eventId.value.trim();

        if (!id) {
            return;
        }

        try {
            await input.deleteInstructorEvent(id);

            input.addToast({
                title: 'Usunięto blok czasu',
                description: 'Blok został usunięty z harmonogramu.',
                variant: 'success',
            });

            deleteDialogOpen.value = false;
            await navigateTo(input.scheduleBackHref.value);
        } catch (err: unknown) {
            input.addToast({
                title: 'Nie udało się usunąć wydarzenia',
                description: getApiFetchErrorMessage(
                    err,
                    'Spróbuj ponownie lub wróć do terminarza.',
                ),
                variant: 'error',
            });
        }
    }

    return {
        deleteDialogOpen,
        isDeleteLoading: input.isDeleteLoading,
        handleOpenDeleteDialog,
        handleDeleteDialogCancel,
        handleDeleteDialogConfirm,
    };
}
