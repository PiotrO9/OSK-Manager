import type { Ref } from 'vue';
import type { DrivingSchool } from '~/types/schools/drivingSchool';
import type { CourseKind } from '~~/shared/contracts/courses';
import {
    buildManagerOskEditFormValues,
    type ManagerOskFormValues,
} from '~/utils/schools/managerOskPage';

interface UseManagerOskFormDialogStateOptions {
    deletingId: Ref<string | null>;
    isUpdateLoading: Ref<boolean>;
    isSetDefaultLoading: Ref<boolean>;
}

export function useManagerOskFormDialogState({
    deletingId,
    isUpdateLoading,
    isSetDefaultLoading,
}: UseManagerOskFormDialogStateOptions) {
    const formDialogOpen = shallowRef(false);
    const formName = shallowRef('');
    const formCity = shallowRef('');
    const formAddress = shallowRef('');
    const formEnabledCourseKinds = shallowRef<CourseKind[]>([]);
    const formOfferedCourseTypeIds = shallowRef<string[]>([]);
    const editTarget = shallowRef<DrivingSchool | null>(null);
    const initialFormSnapshot = shallowRef('');

    const isFormSaving = computed(
        () => isUpdateLoading.value || isSetDefaultLoading.value,
    );
    const formSnapshot = computed(() =>
        JSON.stringify({
            name: formName.value,
            city: formCity.value,
            address: formAddress.value,
            enabledCourseKinds: formEnabledCourseKinds.value,
            offeredCourseTypeIds: formOfferedCourseTypeIds.value,
        }),
    );
    const isFormDirty = computed(
        () =>
            formDialogOpen.value &&
            formSnapshot.value !== initialFormSnapshot.value,
    );

    function applyFormValues(values: ManagerOskFormValues) {
        formName.value = values.name;
        formCity.value = values.city;
        formAddress.value = values.address;
        formEnabledCourseKinds.value = values.enabledCourseKinds;
        formOfferedCourseTypeIds.value = values.offeredCourseTypeIds;
    }

    function markFormClean() {
        initialFormSnapshot.value = formSnapshot.value;
    }

    function openEditFormDialog(school: DrivingSchool) {
        if (deletingId.value !== null || isFormSaving.value) {
            return;
        }

        editTarget.value = school;
        applyFormValues(buildManagerOskEditFormValues(school));
        markFormClean();
        formDialogOpen.value = true;
    }

    function handleFormDialogOpenChange(open: boolean): boolean {
        if (!open && isFormSaving.value) {
            return false;
        }

        if (
            !open &&
            isFormDirty.value &&
            import.meta.client &&
            !window.confirm(
                'Masz niezapisane zmiany. Czy na pewno chcesz zamknąć formularz?',
            )
        ) {
            return false;
        }

        formDialogOpen.value = open;

        if (!open) {
            editTarget.value = null;
        }

        return true;
    }

    return {
        formDialogOpen,
        formName,
        formCity,
        formAddress,
        formEnabledCourseKinds,
        formOfferedCourseTypeIds,
        editTarget,
        isFormSaving,
        isFormDirty,
        markFormClean,
        openEditFormDialog,
        handleFormDialogOpenChange,
    };
}
