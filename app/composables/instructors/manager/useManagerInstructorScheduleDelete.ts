import type { Ref } from 'vue';
import type { ScheduleLessonItem } from '~/types/schedule/schedule';
import { getApiFetchErrorMessage } from '~/utils/api/apiFetchErrorMessage';
import { formatManagerInstructorScheduleRangeLabel } from '~/utils/instructors/managerInstructorSchedulePage';

interface UseManagerInstructorScheduleDeleteOptions {
    items: Ref<ScheduleLessonItem[]>;
}

export function useManagerInstructorScheduleDelete({
    items,
}: UseManagerInstructorScheduleDeleteOptions) {
    const { addToast } = useAppToast();
    const { deleteInstructorEvent, isDeleteLoading: isEventDeleteLoading } =
        useInstructorEventsApi();

    const deleteDialogOpen = ref(false);
    const pendingDeleteItem = ref<ScheduleLessonItem | null>(null);

    const pendingDeleteTimeLabel = computed(() => {
        const item = pendingDeleteItem.value;

        if (!item) {
            return '';
        }

        return `${formatManagerInstructorScheduleRangeLabel(item.startTime)} - ${formatManagerInstructorScheduleRangeLabel(item.endTime)}`;
    });

    function handleRequestDelete(item: ScheduleLessonItem): void {
        pendingDeleteItem.value = item;
        deleteDialogOpen.value = true;
    }

    function handleDeleteDialogCancel(): void {
        deleteDialogOpen.value = false;
        pendingDeleteItem.value = null;
    }

    async function handleDeleteDialogConfirm(): Promise<void> {
        const item = pendingDeleteItem.value;

        if (!item) {
            return;
        }

        const removedId = item.id;

        try {
            await deleteInstructorEvent(removedId);

            addToast({
                title: 'Usunieto blok czasu',
                description: 'Blok zostal usuniety z harmonogramu.',
                variant: 'success',
            });

            items.value = items.value.filter((i) => i.id !== removedId);
            handleDeleteDialogCancel();
        } catch (err: unknown) {
            addToast({
                title: 'Nie udało się usunąć bloku',
                description: getApiFetchErrorMessage(
                    err,
                    'Spróbuj ponownie lub odśwież stronę.',
                ),
                variant: 'error',
            });
        }
    }

    return {
        deleteDialogOpen,
        pendingDeleteTimeLabel,
        isEventDeleteLoading,
        handleRequestDelete,
        handleDeleteDialogCancel,
        handleDeleteDialogConfirm,
    };
}
