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
    const formDialogOpen = ref(false);
    const formDialogMode = ref<'create' | 'edit'>('create');
    const formName = ref('');
    const formCity = ref('');
    const formAddress = ref('');
    const formAsDefault = ref(false);
    const editTarget = ref<DrivingSchool | null>(null);

    const isEditSaving = computed(
        () => isUpdateLoading.value || isSetDefaultLoading.value,
    );
    const isFormSaving = computed(
        () => isLocalCreateSaving.value || isEditSaving.value,
    );
    const isDefaultSwitchLocked = computed(() =>
        isOskDefaultSwitchLocked(schools.value, editTarget.value),
    );

    function applyFormValues(values: ManagerOskFormValues) {
        formName.value = values.name;
        formCity.value = values.city;
        formAddress.value = values.address;
        formAsDefault.value = values.asDefault;
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
        formDialogOpen.value = true;
    }

    function handleFormDialogOpenChange(open: boolean) {
        formDialogOpen.value = open;

        if (!open) {
            editTarget.value = null;
        }
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
        resetFormFields,
        openCreateFormDialog,
        openEditFormDialog,
        handleFormDialogOpenChange,
    };
}
