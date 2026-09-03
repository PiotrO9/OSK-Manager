import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ref } from 'vue';

const addToast = vi.fn();
const navigateTo = vi.fn();
const requestBffSuccess = vi.fn();
const route = {
    params: {
        id: 'instructor-1',
    },
};

vi.mock('../core/useApi', () => ({
    requestBffSuccess,
}));

function installNuxtDeleteGlobals(): void {
    vi.stubGlobal('ref', ref);
    vi.stubGlobal('useRoute', () => route);
    vi.stubGlobal('useAppToast', () => ({ addToast }));
    vi.stubGlobal('navigateTo', navigateTo);
}

describe('useManagerInstructorDetailsDelete', () => {
    beforeEach(() => {
        vi.resetModules();
        vi.unstubAllGlobals();
        vi.clearAllMocks();
        route.params.id = 'instructor-1';
        installNuxtDeleteGlobals();
    });

    it('opens delete dialog and closes edit dialog when form is idle', async () => {
        const { useManagerInstructorDetailsDelete } =
            await import('./useManagerInstructorDetailsDelete');
        const isSubmitting = ref(false);
        const isEditDialogOpen = ref(true);
        const data = useManagerInstructorDetailsDelete({
            isSubmitting,
            isEditDialogOpen,
        });

        data.handleOpenDeleteDialog();

        expect(isEditDialogOpen.value).toBe(false);
        expect(data.isDeleteDialogOpen.value).toBe(true);
    });

    it('does not open delete dialog while submitting', async () => {
        const { useManagerInstructorDetailsDelete } =
            await import('./useManagerInstructorDetailsDelete');
        const data = useManagerInstructorDetailsDelete({
            isSubmitting: ref(true),
            isEditDialogOpen: ref(true),
        });

        data.handleOpenDeleteDialog();

        expect(data.isDeleteDialogOpen.value).toBe(false);
    });

    it('deletes instructor and navigates back to instructors list', async () => {
        requestBffSuccess.mockResolvedValue(true);

        const { useManagerInstructorDetailsDelete } =
            await import('./useManagerInstructorDetailsDelete');
        const isEditDialogOpen = ref(true);
        const data = useManagerInstructorDetailsDelete({
            isSubmitting: ref(false),
            isEditDialogOpen,
        });

        data.isDeleteDialogOpen.value = true;
        await data.handleDeleteDialogConfirm();

        expect(data.isDeleteDialogOpen.value).toBe(false);
        expect(requestBffSuccess).toHaveBeenCalledWith(
            'DELETE',
            '/api/instructors/instructor-1',
            {
                fallbackMessage: 'Nie udało się usunąć instruktora.',
            },
        );
        expect(addToast).toHaveBeenCalledWith({
            title: 'Instruktor został usunięty',
            variant: 'success',
        });
        expect(isEditDialogOpen.value).toBe(false);
        expect(navigateTo).toHaveBeenCalledWith('/manager/instructors');
        expect(data.isDeleting.value).toBe(false);
    });

    it('shows error toast and clears loading state on delete failure', async () => {
        requestBffSuccess.mockRejectedValue(new Error('API down'));

        const { useManagerInstructorDetailsDelete } =
            await import('./useManagerInstructorDetailsDelete');
        const data = useManagerInstructorDetailsDelete({
            isSubmitting: ref(false),
            isEditDialogOpen: ref(false),
        });

        await data.handleDeleteDialogConfirm();

        expect(addToast).toHaveBeenCalledWith({
            title: 'Nie udało się usunąć instruktora',
            description: 'API down',
            variant: 'error',
        });
        expect(navigateTo).not.toHaveBeenCalled();
        expect(data.isDeleting.value).toBe(false);
    });
});
