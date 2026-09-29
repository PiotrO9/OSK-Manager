import { onBeforeRouteLeave } from 'vue-router';
import type { DrivingSchool } from '~/types/schools/drivingSchool';
import { oskFormSchema } from '~/utils/forms/oskFormSchema';
import {
    buildManagerOskCreateBody,
    buildManagerOskUpdateBody,
    getManagerOskErrorMessage,
} from '~/utils/schools/managerOskPage';

interface ManagerOskFormErrors {
    name: string;
}

export function useManagerOskPage() {
    const route = useRoute();
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
    const loadError = shallowRef<string | null>(null);
    const deletingId = shallowRef<string | null>(null);
    const settingDefaultId = shallowRef<string | null>(null);
    const confirmTarget = shallowRef<DrivingSchool | null>(null);
    const isLocalCreateSaving = shallowRef(false);
    const formSubmitError = shallowRef('');
    const hasLoadedSchools = shallowRef(false);
    const formErrors = reactive<ManagerOskFormErrors>({ name: '' });
    let loadRequestId = 0;

    const isConfirmOpen = computed(() => confirmTarget.value !== null);
    const defaultSchool = computed(
        () => schools.value.find((school) => school.isDefault === true) ?? null,
    );
    const isMutating = computed(
        () =>
            deletingId.value !== null ||
            settingDefaultId.value !== null ||
            isLocalCreateSaving.value ||
            isUpdateLoading.value,
    );

    const {
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
        openCreateFormDialog: openCreateFormDialogState,
        openEditFormDialog: openEditFormDialogState,
        handleFormDialogOpenChange: handleFormDialogStateOpenChange,
    } = useManagerOskFormDialogState({
        schools,
        deletingId,
        isUpdateLoading,
        isSetDefaultLoading,
        isLocalCreateSaving,
    });

    function clearFormFeedback() {
        formErrors.name = '';
        formSubmitError.value = '';
    }

    function openCreateFormDialog() {
        clearFormFeedback();
        openCreateFormDialogState();
    }

    function openEditFormDialog(school: DrivingSchool) {
        clearFormFeedback();
        openEditFormDialogState(school);
    }

    async function clearCreateActionQuery() {
        if (route.query.action !== 'create') return;

        const query = { ...route.query };

        delete query.action;

        await navigateTo({ path: route.path, query }, { replace: true });
    }

    function handleFormDialogOpenChange(open: boolean) {
        const changed = handleFormDialogStateOpenChange(open);

        if (changed && !open) {
            clearFormFeedback();
            void clearCreateActionQuery();
        }
    }

    async function loadSchools() {
        const requestId = ++loadRequestId;

        loadError.value = null;

        try {
            const nextSchools = await fetchList();

            if (requestId === loadRequestId) {
                schools.value = nextSchools;
                hasLoadedSchools.value = true;
            }
        } catch (err) {
            if (requestId !== loadRequestId) return;

            loadError.value = getManagerOskErrorMessage(
                err,
                'Nie udało się wczytać listy OSK.',
            );
        }
    }

    function handleRequestDelete(school: DrivingSchool) {
        if (isMutating.value) return;

        confirmTarget.value = school;
    }

    function handleCancelDelete() {
        if (deletingId.value !== null) return;

        confirmTarget.value = null;
    }

    function handleConfirmOpenChange(open: boolean) {
        if (!open) {
            handleCancelDelete();
        }
    }

    async function handleConfirmDelete() {
        const school = confirmTarget.value;

        if (!school || deletingId.value !== null) return;

        deletingId.value = school.id;

        try {
            await remove(school.id);
            confirmTarget.value = null;
            await loadSchools();

            toast.addToast({
                title: 'Usunięto szkołę',
                description: `Szkoła „${school.name}” została usunięta z listy.`,
                variant: 'success',
            });
        } catch (err) {
            toast.addToast({
                title: 'Nie udało się usunąć szkoły',
                description: getManagerOskErrorMessage(
                    err,
                    'Spróbuj ponownie za chwilę.',
                ),
                variant: 'error',
            });
        } finally {
            deletingId.value = null;
        }
    }

    async function handleSetDefault(school: DrivingSchool) {
        if (school.isDefault === true || isMutating.value) return;

        settingDefaultId.value = school.id;

        try {
            await setAsDefault(school.id);
            schools.value = schools.value.map((item) => ({
                ...item,
                isDefault: item.id === school.id,
            }));

            toast.addToast({
                title: 'Zmieniono domyślną szkołę',
                description: `„${school.name}” będzie domyślnym kontekstem w aplikacji.`,
                variant: 'success',
            });
        } catch (err) {
            toast.addToast({
                title: 'Nie udało się zmienić domyślnej szkoły',
                description: getManagerOskErrorMessage(
                    err,
                    'Spróbuj ponownie za chwilę.',
                ),
                variant: 'error',
            });
        } finally {
            settingDefaultId.value = null;
        }
    }

    function validateForm() {
        clearFormFeedback();

        const parsed = oskFormSchema.safeParse({
            name: formName.value,
            city: formCity.value,
            address: formAddress.value,
        });

        if (!parsed.success) {
            formErrors.name =
                parsed.error.flatten().fieldErrors.name?.[0] ??
                'Podaj nazwę szkoły jazdy.';
        }

        return parsed;
    }

    async function submitEditForm() {
        const school = editTarget.value;

        if (!school) return;

        const parsed = validateForm();

        if (!parsed.success) return;

        try {
            await update(school.id, buildManagerOskUpdateBody(parsed.data));
            await loadSchools();
            markFormClean();
            handleFormDialogOpenChange(false);

            toast.addToast({
                title: 'Zapisano zmiany',
                description: `Dane szkoły „${parsed.data.name}” zostały zaktualizowane.`,
                variant: 'success',
            });
        } catch (err) {
            formSubmitError.value = getManagerOskErrorMessage(
                err,
                'Nie udało się zapisać zmian. Spróbuj ponownie.',
            );
        }
    }

    async function submitCreateForm() {
        const parsed = validateForm();

        if (!parsed.success) return;

        isLocalCreateSaving.value = true;

        try {
            const createdSchool = await create(
                buildManagerOskCreateBody(parsed.data),
            );
            let defaultChangeError: unknown = null;

            if (formAsDefault.value && schools.value.length > 0) {
                try {
                    await setAsDefault(createdSchool.id);
                } catch (err) {
                    defaultChangeError = err;
                }
            }

            await loadSchools();
            isLocalCreateSaving.value = false;
            markFormClean();
            handleFormDialogOpenChange(false);
            resetFormFields();

            if (defaultChangeError) {
                toast.addToast({
                    title: 'Szkoła została dodana',
                    description:
                        'Nie udało się ustawić jej jako domyślnej. Możesz zrobić to z poziomu listy.',
                    variant: 'warning',
                });
            } else {
                toast.addToast({
                    title: 'Dodano szkołę',
                    description: `Szkoła „${parsed.data.name}” jest gotowa do konfiguracji.`,
                    variant: 'success',
                });
            }
        } catch (err) {
            formSubmitError.value = getManagerOskErrorMessage(
                err,
                'Nie udało się dodać szkoły. Spróbuj ponownie.',
            );
        } finally {
            isLocalCreateSaving.value = false;
        }
    }

    async function submitFormDialog() {
        if (isFormSaving.value) return;

        if (formDialogMode.value === 'edit') {
            await submitEditForm();

            return;
        }

        await submitCreateForm();
    }

    function handleBeforeUnload(event: BeforeUnloadEvent) {
        if (!isFormDirty.value) return;

        event.preventDefault();
        event.returnValue = '';
    }

    watch([formName, formCity, formAddress, formAsDefault], () => {
        if (formErrors.name) {
            formErrors.name = '';
        }

        formSubmitError.value = '';
    });

    watch(
        [() => route.query.action, hasLoadedSchools],
        ([action, hasLoaded]) => {
            if (action === 'create' && hasLoaded && !formDialogOpen.value) {
                openCreateFormDialog();
            }
        },
        { immediate: true },
    );

    onBeforeRouteLeave(() => {
        if (!isFormDirty.value || !import.meta.client) return true;

        return window.confirm(
            'Masz niezapisane zmiany. Czy na pewno chcesz opuścić stronę?',
        );
    });

    onMounted(() => {
        void loadSchools();
        window.addEventListener('beforeunload', handleBeforeUnload);
    });

    onBeforeUnmount(() => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
    });

    return {
        schools,
        defaultSchool,
        loadError,
        isListLoading,
        loadSchools,
        deletingId,
        settingDefaultId,
        confirmTarget,
        isConfirmOpen,
        handleRequestDelete,
        handleCancelDelete,
        handleConfirmOpenChange,
        handleConfirmDelete,
        handleSetDefault,
        formDialogOpen,
        formDialogMode,
        formName,
        formCity,
        formAddress,
        formAsDefault,
        formErrors,
        formSubmitError,
        isFormSaving,
        isDefaultSwitchLocked,
        openCreateFormDialog,
        openEditFormDialog,
        handleFormDialogOpenChange,
        submitFormDialog,
    };
}
