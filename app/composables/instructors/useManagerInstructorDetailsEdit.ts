import type { Ref } from 'vue';
import {
    normalizeInstructorDetail,
    normalizeInstructorDetailForEdit,
    type InstructorDetail,
    type InstructorEditFormModel,
} from '~/types/instructors/instructor';
import {
    buildManagerInstructorDirtyPatch,
    getManagerInstructorGenericSaveErrorMessage,
    getManagerInstructorRouteString,
    getManagerInstructorSaveErrorMessage,
    validateManagerInstructorPatch,
} from '~/utils/instructors/managerInstructorDetailsPage';
import { requestBffData } from '../core/useApi';

type InstructorDetailData = InstructorDetail | null;

interface UseManagerInstructorDetailsEditOptions {
    instructor: Ref<InstructorDetail | null>;
    editForm: Ref<InstructorEditFormModel | null>;
    editBaseline: Ref<InstructorEditFormModel | null>;
}

export function useManagerInstructorDetailsEdit({
    instructor,
    editForm,
    editBaseline,
}: UseManagerInstructorDetailsEditOptions) {
    const route = useRoute();
    const { addToast } = useAppToast();

    const isSubmitting = ref(false);
    const submitError = ref<string | null>(null);
    const isEditDialogOpen = ref(false);

    watch(isEditDialogOpen, (open) => {
        if (open) {
            return;
        }

        submitError.value = null;

        if (editBaseline.value && editForm.value) {
            editForm.value = { ...editBaseline.value };
        }
    });

    function resetEditState(): void {
        submitError.value = null;
        isEditDialogOpen.value = false;
    }

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

    return {
        isSubmitting,
        submitError,
        isEditDialogOpen,
        resetEditState,
        handleEnterEdit,
        handleSubmitEdit,
    };
}
