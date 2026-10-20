import { onBeforeRouteLeave } from 'vue-router';
import type { DrivingSchool } from '~/types/schools/drivingSchool';
import type { CourseTypeOption } from '~/types/courses/courseType';
import { oskFormSchema } from '~/utils/forms/oskFormSchema';
import {
    buildManagerOskUpdateBody,
    getManagerOskErrorMessage,
} from '~/utils/schools/managerOskPage';

interface ManagerOskFormErrors {
    name: string;
}

export function useManagerOskPage() {
    const toast = useAppToast();
    const { fetchList: fetchCourseTypesList } = useCourseTypesApi();

    const {
        fetchList,
        remove,
        update,
        setAsDefault,
        isListLoading,
        isUpdateLoading,
        isSetDefaultLoading,
    } = useDrivingSchoolsApi();

    const schools = ref<DrivingSchool[]>([]);
    const courseTypes = ref<CourseTypeOption[]>([]);
    const courseTypesLoadError = shallowRef<string | null>(null);
    const isCourseTypesLoading = shallowRef(false);
    const loadError = shallowRef<string | null>(null);
    const deletingId = shallowRef<string | null>(null);
    const settingDefaultId = shallowRef<string | null>(null);
    const confirmTarget = shallowRef<DrivingSchool | null>(null);
    const formSubmitError = shallowRef('');
    const formErrors = reactive<ManagerOskFormErrors>({ name: '' });
    let loadRequestId = 0;
    let courseTypesLoadRequestId = 0;

    const isConfirmOpen = computed(() => confirmTarget.value !== null);
    const defaultSchool = computed(
        () => schools.value.find((school) => school.isDefault === true) ?? null,
    );
    const isMutating = computed(
        () =>
            deletingId.value !== null ||
            settingDefaultId.value !== null ||
            isUpdateLoading.value,
    );

    const {
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
        openEditFormDialog: openEditFormDialogState,
        handleFormDialogOpenChange: handleFormDialogStateOpenChange,
    } = useManagerOskFormDialogState({
        deletingId,
        isUpdateLoading,
        isSetDefaultLoading,
    });

    function clearFormFeedback() {
        formErrors.name = '';
        formSubmitError.value = '';
    }

    function openEditFormDialog(school: DrivingSchool) {
        clearFormFeedback();
        openEditFormDialogState(school);

        if (formDialogOpen.value && courseTypes.value.length === 0) {
            void loadCourseTypes();
        }
    }

    async function loadCourseTypes() {
        const requestId = ++courseTypesLoadRequestId;

        courseTypesLoadError.value = null;
        isCourseTypesLoading.value = true;

        try {
            const nextCourseTypes = await fetchCourseTypesList();

            if (requestId === courseTypesLoadRequestId) {
                courseTypes.value = nextCourseTypes;
            }
        } catch (err) {
            if (requestId !== courseTypesLoadRequestId) return;

            courseTypesLoadError.value = getManagerOskErrorMessage(
                err,
                'Nie udało się pobrać katalogu kategorii.',
            );
        } finally {
            if (requestId === courseTypesLoadRequestId) {
                isCourseTypesLoading.value = false;
            }
        }
    }

    function handleFormDialogOpenChange(open: boolean) {
        const changed = handleFormDialogStateOpenChange(open);

        if (changed && !open) {
            clearFormFeedback();
        }
    }

    async function loadSchools() {
        const requestId = ++loadRequestId;

        loadError.value = null;

        try {
            const nextSchools = await fetchList();

            if (requestId === loadRequestId) {
                schools.value = nextSchools;
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
            await update(
                school.id,
                buildManagerOskUpdateBody({
                    ...parsed.data,
                    enabledCourseKinds: formEnabledCourseKinds.value,
                    offeredCourseTypeIds: formOfferedCourseTypeIds.value,
                }),
            );
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

    async function submitFormDialog() {
        if (isFormSaving.value) return;

        await submitEditForm();
    }

    function handleBeforeUnload(event: BeforeUnloadEvent) {
        if (!isFormDirty.value) return;

        event.preventDefault();
        event.returnValue = '';
    }

    watch(
        [
            formName,
            formCity,
            formAddress,
            formEnabledCourseKinds,
            formOfferedCourseTypeIds,
        ],
        () => {
            if (formErrors.name) {
                formErrors.name = '';
            }

            formSubmitError.value = '';
        },
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
        loadRequestId++;
        courseTypesLoadRequestId++;
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
        formName,
        formCity,
        formAddress,
        formEnabledCourseKinds,
        formOfferedCourseTypeIds,
        courseTypes,
        courseTypesLoadError,
        isCourseTypesLoading,
        loadCourseTypes,
        formErrors,
        formSubmitError,
        isFormSaving,
        openEditFormDialog,
        handleFormDialogOpenChange,
        submitFormDialog,
    };
}
