import { beforeEach, describe, expect, it, vi } from 'vitest';
import { computed, ref } from 'vue';

import { useManagerEventEditDeleteAction } from './useManagerEventEditDeleteAction';

const navigateTo = vi.fn();

function installNuxtGlobals(): void {
    vi.stubGlobal('ref', ref);
    vi.stubGlobal('navigateTo', navigateTo);
}

function setupDeleteAction(
    options: {
        eventId?: string;
        deleteInstructorEvent?: (id: string) => Promise<void>;
    } = {},
) {
    const deleteInstructorEvent =
        options.deleteInstructorEvent ?? vi.fn().mockResolvedValue(undefined);
    const addToast = vi.fn();
    const isDeleteLoading = ref(false);

    const action = useManagerEventEditDeleteAction({
        eventId: computed(() => options.eventId ?? 'event-1'),
        scheduleBackHref: computed(() => ({
            path: '/manager/instructors/instructor-1/schedule',
            query: { schoolId: 'school-1' },
        })),
        isDeleteLoading,
        deleteInstructorEvent,
        addToast,
    });

    return {
        action,
        addToast,
        deleteInstructorEvent,
        isDeleteLoading,
    };
}

describe('useManagerEventEditDeleteAction', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.unstubAllGlobals();
        installNuxtGlobals();
        navigateTo.mockResolvedValue(undefined);
    });

    it('opens and cancels delete dialog', () => {
        const { action } = setupDeleteAction();

        action.handleOpenDeleteDialog();
        expect(action.deleteDialogOpen.value).toBe(true);

        action.handleDeleteDialogCancel();
        expect(action.deleteDialogOpen.value).toBe(false);
    });

    it('deletes event, closes dialog and navigates back', async () => {
        const { action, addToast, deleteInstructorEvent } = setupDeleteAction();

        action.handleOpenDeleteDialog();
        await action.handleDeleteDialogConfirm();

        expect(deleteInstructorEvent).toHaveBeenCalledWith('event-1');
        expect(addToast).toHaveBeenCalledWith({
            title: 'Usunięto blok czasu',
            description: 'Blok został usunięty z harmonogramu.',
            variant: 'success',
        });
        expect(action.deleteDialogOpen.value).toBe(false);
        expect(navigateTo).toHaveBeenCalledWith({
            path: '/manager/instructors/instructor-1/schedule',
            query: { schoolId: 'school-1' },
        });
    });

    it('does nothing when event id is missing', async () => {
        const { action, addToast, deleteInstructorEvent } = setupDeleteAction({
            eventId: ' ',
        });

        await action.handleDeleteDialogConfirm();

        expect(deleteInstructorEvent).not.toHaveBeenCalled();
        expect(addToast).not.toHaveBeenCalled();
        expect(navigateTo).not.toHaveBeenCalled();
    });

    it('keeps dialog open and shows error toast when delete fails', async () => {
        const { action, addToast } = setupDeleteAction({
            deleteInstructorEvent: vi
                .fn()
                .mockRejectedValue(new Error('API unavailable')),
        });

        action.handleOpenDeleteDialog();
        await action.handleDeleteDialogConfirm();

        expect(addToast).toHaveBeenCalledWith({
            title: 'Nie udało się usunąć wydarzenia',
            description: 'API unavailable',
            variant: 'error',
        });
        expect(action.deleteDialogOpen.value).toBe(true);
        expect(navigateTo).not.toHaveBeenCalled();
    });
});
