import type { Ref } from 'vue';
import type { DrivingSchool } from '~/types/schools/drivingSchool';
import { isOskDefaultSwitchLocked } from '~/utils/schools/drivingSchoolRules';
import {
    buildManagerOskEditFormValues,
    getManagerOskBlankFormValues,
    type ManagerOskFormValues,
} from '~/utils/schools/managerOskPage';

interface UseManagerOskFormDialogStateOptions {
    schools: Ref<DrivingSchool[]>;
    deletingId: Ref<string | null>;
    isUpdateLoading: Ref<boolean>;
    isSetDefaultLoading: Ref<boolean>;
    isLocalCreateSaving: Ref<boolean>;
}

export function useManagerOskFormDialogState({
    schools,
    deletingId,
    isUpdateLoading,
    isSetDefaultLoading,
    isLocalCreateSaving,
}: UseManagerOskFormDialogStateOptions) {
    const formDialogOpen = shallowRef(false);
    const formDialogMode = shallowRef<'create' | 'edit'>('create');
    const formName = shallowRef('');
    const formCity = shallowRef('');
    const formAddress = shallowRef('');
    const formAsDefault = shallowRef(false);
    const editTarget = shallowRef<DrivingSchool | null>(null);
    const initialFormSnapshot = shallowRef('');

    const isEditSaving = computed(
        () => isUpdateLoading.value || isSetDefaultLoading.value,
    );
    const isFormSaving = computed(
        () => isLocalCreateSaving.value || isEditSaving.value,
    );
    const isDefaultSwitchLocked = computed(
        () =>
            (formDialogMode.value === 'create' && schools.value.length === 0) ||
            isOskDefaultSwitchLocked(schools.value, editTarget.value),
    );
    const formSnapshot = computed(() =>
        JSON.stringify({
            name: formName.value,
            city: formCity.value,
            address: formAddress.value,
            asDefault: formAsDefault.value,
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
        formAsDefault.value = values.asDefault;
    }

    function markFormClean() {
        initialFormSnapshot.value = formSnapshot.value;
    }

    function resetFormFields() {
        applyFormValues(getManagerOskBlankFormValues());
    }

    function openEditFormDialog(school: DrivingSchool) {
        if (
            deletingId.value !== null ||
            isEditSaving.value ||
            isLocalCreateSaving.value
        ) {
            return;
        }

        formDialogMode.value = 'edit';
        editTarget.value = school;
        applyFormValues(buildManagerOskEditFormValues(school));
        markFormClean();
        formDialogOpen.value = true;
    }

    function openCreateFormDialog() {
        if (
            deletingId.value !== null ||
            isLocalCreateSaving.value ||
            isEditSaving.value
        ) {
            return;
        }

        editTarget.value = null;
        formDialogMode.value = 'create';
        resetFormFields();
        formAsDefault.value = schools.value.length === 0;
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

    watch(
        () => isDefaultSwitchLocked.value,
        (locked) => {
            if (locked) {
                formAsDefault.value = true;
            }
        },
    );

    return {
        formDialogOpen,
        formDialogMode,
        formName,
        formCity,
        formAddress,
        formAsDefault,
        editTarget,
        isFormSaving,
        isDefaultSwitchLocked,
        isFormDirty,
        resetFormFields,
        markFormClean,
        openCreateFormDialog,
        openEditFormDialog,
        handleFormDialogOpenChange,
    };
}
