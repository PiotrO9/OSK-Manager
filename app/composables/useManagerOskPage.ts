import type { DrivingSchool } from '~/types/drivingSchool';
import {
    getOskClearDefaultBlockedMessage,
    isOskDefaultSwitchLocked,
} from '~/utils/drivingSchoolRules';
import { toastFormZodError } from '~/utils/formToast';
import { oskFormSchema } from '~/utils/oskFormSchema';

export function useManagerOskPage() {
    const toast = useAppToast();

    const {
        fetchList,
        remove,
        create,
        update,
        setAsDefault,
        isListLoading,
        isUpdateLoading,
        isSetDefaultLoading,
    } = useDrivingSchoolsApi();

    const schools = ref<DrivingSchool[]>([]);
    const loadError = ref<string | null>(null);
    const deletingId = ref<string | null>(null);
    const confirmTarget = ref<DrivingSchool | null>(null);

    const formDialogOpen = ref(false);
    const formDialogMode = ref<'create' | 'edit'>('create');
    const formName = ref('');
    const formCity = ref('');
    const formAddress = ref('');
    const formAsDefault = ref(false);
    const editTarget = ref<DrivingSchool | null>(null);

    const isLocalCreateSaving = ref(false);

    const isConfirmOpen = computed(() => confirmTarget.value !== null);
    const isEditSaving = computed(
        () => isUpdateLoading.value || isSetDefaultLoading.value,
    );
    const isFormSaving = computed(
        () => isLocalCreateSaving.value || isEditSaving.value,
    );

    const isDefaultSwitchLocked = computed(() =>
        isOskDefaultSwitchLocked(schools.value, editTarget.value),
    );

    async function loadSchools() {
        loadError.value = null;

        try {
            schools.value = await fetchList();
        } catch (err) {
            loadError.value =
                err instanceof Error
                    ? err.message
                    : 'Nie udało się wczytać listy OSK.';
        }
    }

    function resetFormFields() {
        formName.value = '';
        formCity.value = '';
        formAddress.value = '';
        formAsDefault.value = false;
    }

    function handleRequestDelete(school: DrivingSchool) {
        if (deletingId.value !== null) return;

        confirmTarget.value = school;
    }

    function handleCancelDelete() {
        confirmTarget.value = null;
    }

    function handleConfirmOpenChange(open: boolean) {
        if (!open) {
            confirmTarget.value = null;
        }
    }

    async function handleConfirmDelete() {
        const school = confirmTarget.value;

        if (!school) return;

        confirmTarget.value = null;
        deletingId.value = school.id;

        try {
            await remove(school.id);

            schools.value = schools.value.filter((s) => s.id !== school.id);

            toast.addToast({
                title: 'Usunięto',
                description: `Szkoła „${school.name}" została usunięta.`,
                variant: 'success',
            });
        } catch (err) {
            toast.addToast({
                title: 'Błąd',
                description:
                    err instanceof Error
                        ? err.message
                        : 'Nie udało się usunąć OSK.',
                variant: 'error',
            });
        } finally {
            deletingId.value = null;
        }
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
        formName.value = school.name;
        formCity.value = school.city ?? '';
        formAddress.value = school.address ?? '';
        formAsDefault.value = school.isDefault === true;
        formDialogOpen.value = true;
    }

    function handleFormDialogOpenChange(open: boolean) {
        formDialogOpen.value = open;

        if (!open) {
            editTarget.value = null;
        }
    }

    async function submitFormDialog() {
        if (isFormSaving.value) return;

        const parsed = oskFormSchema.safeParse({
            name: formName.value,
            city: formCity.value,
            address: formAddress.value,
        });

        if (!parsed.success) {
            toastFormZodError(toast.addToast, parsed.error);

            return;
        }

        const cityTrim = parsed.data.city?.trim();
        const addressTrim = parsed.data.address?.trim();

        if (formDialogMode.value === 'edit') {
            const school = editTarget.value;

            if (!school) return;

            if (!formAsDefault.value && school.isDefault === true) {
                toast.addToast({
                    title: 'Domyślna OSK',
                    description: getOskClearDefaultBlockedMessage(
                        schools.value.length,
                    ),
                    variant: 'error',
                });

                return;
            }

            try {
                await update(school.id, {
                    name: parsed.data.name,
                    city: cityTrim ?? null,
                    address: addressTrim ?? null,
                });

                if (formAsDefault.value) {
                    await setAsDefault(school.id);
                }

                await loadSchools();

                toast.addToast({
                    title: 'Zapisano',
                    description: `Dane szkoły „${parsed.data.name}" zostały zaktualizowane.`,
                    variant: 'success',
                });

                formDialogOpen.value = false;
                editTarget.value = null;
            } catch (err) {
                toast.addToast({
                    title: 'Błąd',
                    description:
                        err instanceof Error
                            ? err.message
                            : 'Nie udało się zapisać zmian.',
                    variant: 'error',
                });
            }

            return;
        }

        isLocalCreateSaving.value = true;

        try {
            await create({
                name: parsed.data.name,
                ...(cityTrim ? { city: cityTrim } : {}),
                ...(addressTrim ? { address: addressTrim } : {}),
            });

            await loadSchools();

            toast.addToast({
                title: 'Dodano',
                description: `Szkoła „${parsed.data.name}" została utworzona.`,
                variant: 'success',
            });

            formDialogOpen.value = false;
            resetFormFields();
        } catch (err) {
            toast.addToast({
                title: 'Błąd',
                description:
                    err instanceof Error
                        ? err.message
                        : 'Nie udało się dodać OSK.',
                variant: 'error',
            });
        } finally {
            isLocalCreateSaving.value = false;
        }
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

    watch(
        () => isDefaultSwitchLocked.value,
        (locked) => {
            if (locked) {
                formAsDefault.value = true;
            }
        },
    );

    onMounted(() => {
        loadSchools();
    });

    return {
        schools,
        loadError,
        isListLoading,
        loadSchools,
        deletingId,
        confirmTarget,
        isConfirmOpen,
        handleRequestDelete,
        handleCancelDelete,
        handleConfirmOpenChange,
        handleConfirmDelete,
        formDialogOpen,
        formDialogMode,
        formName,
        formCity,
        formAddress,
        formAsDefault,
        isFormSaving,
        isDefaultSwitchLocked,
        openCreateFormDialog,
        openEditFormDialog,
        handleFormDialogOpenChange,
        submitFormDialog,
    };
}
