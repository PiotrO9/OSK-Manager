import type { DrivingSchool } from '~/types/schools/drivingSchool';
import { getManagerOskErrorMessage } from '~/utils/schools/managerOskPage';

export function useManagerOskPage() {
    const toast = useAppToast();
    const { fetchList, remove, setAsDefault, isListLoading } =
        useDrivingSchoolsApi();

    const schools = ref<DrivingSchool[]>([]);
    const loadError = shallowRef<string | null>(null);
    const deletingId = shallowRef<string | null>(null);
    const settingDefaultId = shallowRef<string | null>(null);
    const confirmTarget = shallowRef<DrivingSchool | null>(null);
    let loadRequestId = 0;

    const isConfirmOpen = computed(() => confirmTarget.value !== null);
    const defaultSchool = computed(
        () => schools.value.find((school) => school.isDefault === true) ?? null,
    );
    const isMutating = computed(
        () => deletingId.value !== null || settingDefaultId.value !== null,
    );

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

    onMounted(() => {
        void loadSchools();
    });

    onBeforeUnmount(() => {
        loadRequestId++;
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
    };
}
