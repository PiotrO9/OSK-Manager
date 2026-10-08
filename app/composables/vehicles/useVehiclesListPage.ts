import type { VehicleStatusUpdateBody } from '~/composables/vehicles/useVehiclesApi';
import type { DrivingSchool } from '~/types/schools/drivingSchool';
import type { Vehicle } from '~/types/vehicles/vehicle';
import {
    filterVehicles,
    formatVehiclesResultsLabel,
    type VehicleStatusFilter,
} from '~/utils/vehicles/filters';

export type VehiclesListPanelId = 'simple' | 'manager';

export function useVehiclesListPage() {
    const route = useRoute();
    const { session } = useAuthSession();
    const { addToast } = useAppToast();
    const {
        fetchList,
        isListLoading,
        deleteVehicle,
        isDeleteLoading,
        setVehicleAsDefault,
        isSetDefaultLoading,
        updateVehicleStatus,
    } = useVehiclesApi();
    const {
        fetchDefaultDrivingSchool,
        fetchList: fetchSchoolsList,
        isListLoading: isSchoolsLoading,
    } = useDrivingSchoolsApi();

    const isManager = computed(() => session.value?.role === 'MANAGER');

    const resolvedSchoolId = ref<string | null>(null);
    const schools = ref<DrivingSchool[]>([]);
    const defaultSchool = ref<DrivingSchool | null>(null);
    const schoolsLoadError = ref<string | null>(null);
    const contextMessage = ref<string | null>(null);
    const loadError = ref<string | null>(null);
    const deleteActionError = ref<string | null>(null);
    const vehicles = ref<Vehicle[]>([]);
    const vehiclePendingDelete = ref<Vehicle | null>(null);
    const statusUpdatingVehicleId = ref<string | null>(null);
    const isPageInitializing = shallowRef(true);

    const searchTerm = shallowRef('');
    const statusFilter = shallowRef<VehicleStatusFilter>('all');
    const activePanel = shallowRef<VehiclesListPanelId>('simple');
    let pageLoadSequence = 0;
    let vehiclesLoadSequence = 0;

    const filteredVehicles = computed(() =>
        filterVehicles(vehicles.value, searchTerm.value, statusFilter.value),
    );
    const hasActiveFilters = computed(
        () =>
            searchTerm.value.trim().length > 0 || statusFilter.value !== 'all',
    );
    const resultsLabel = computed(() => {
        const visible = filteredVehicles.value.length;
        const total = vehicles.value.length;
        const visibleLabel = formatVehiclesResultsLabel(visible);

        return hasActiveFilters.value
            ? `${visibleLabel} z ${total}`
            : visibleLabel;
    });
    const activeSchool = computed(() => {
        const schoolId = resolvedSchoolId.value;

        if (!schoolId) return null;

        return (
            schools.value.find((school) => school.id === schoolId) ??
            (defaultSchool.value?.id === schoolId ? defaultSchool.value : null)
        );
    });
    const isPageLoading = computed(
        () => isPageInitializing.value || isListLoading.value,
    );

    function handleTabSelect(panel: VehiclesListPanelId) {
        activePanel.value = panel;
    }

    function handleSearchChange(value: string) {
        searchTerm.value = value;
    }

    function handleStatusFilterChange(value: VehicleStatusFilter) {
        statusFilter.value = value;
    }

    function handleClearFilters() {
        searchTerm.value = '';
        statusFilter.value = 'all';
    }

    async function handleSchoolChange(schoolId: string) {
        const value = schoolId.trim();

        if (!value || value === resolvedSchoolId.value) return;

        resolvedSchoolId.value = value;
        await loadVehicles();
    }

    function readSchoolIdFromQuery(): string | null {
        const rawSchoolIdQuery = route.query.schoolId;
        const schoolIdQueryValue = Array.isArray(rawSchoolIdQuery)
            ? rawSchoolIdQuery[0]
            : rawSchoolIdQuery;

        if (typeof schoolIdQueryValue !== 'string') return null;

        const trimmedSchoolId = schoolIdQueryValue.trim();

        return trimmedSchoolId.length > 0 ? trimmedSchoolId : null;
    }

    async function resolveSchoolId(): Promise<string | null> {
        contextMessage.value = null;

        const fromQuery = readSchoolIdFromQuery();

        if (fromQuery) {
            return fromQuery;
        }

        if (!isManager.value) {
            contextMessage.value =
                'Brak wybranej szkoły. Użyj linku z identyfikatorem szkoły (parametr schoolId) lub zapytaj administratora.';

            return null;
        }

        const result = await fetchDefaultDrivingSchool();

        if (result.outcome === 'empty_response') {
            contextMessage.value =
                'Nie udało się pobrać domyślnej szkoły jazdy.';

            return null;
        }

        if (result.outcome === 'not_configured') {
            await navigateTo('/manager/osk');

            return null;
        }

        if (result.outcome === 'unreadable') {
            contextMessage.value = 'Nie udało się wczytać danych szkoły jazdy.';

            return null;
        }

        defaultSchool.value = result.school;

        return result.school.id;
    }

    async function loadSchools(force = false) {
        if (!isManager.value || (!force && schools.value.length > 0)) return;

        schoolsLoadError.value = null;

        try {
            schools.value = await fetchSchoolsList();
        } catch (err) {
            schoolsLoadError.value =
                err instanceof Error
                    ? err.message
                    : 'Nie udało się pobrać listy OSK.';
        }
    }

    async function loadVehicles() {
        const schoolId = resolvedSchoolId.value;
        const requestSequence = ++vehiclesLoadSequence;

        if (!schoolId) {
            vehicles.value = [];

            return;
        }

        loadError.value = null;

        try {
            const items = await fetchList(schoolId);

            if (requestSequence !== vehiclesLoadSequence) {
                return;
            }

            vehicles.value = items;
        } catch (err) {
            if (requestSequence !== vehiclesLoadSequence) {
                return;
            }

            loadError.value =
                err instanceof Error
                    ? err.message
                    : 'Nie udało się wczytać listy pojazdów.';
            vehicles.value = [];
        }
    }

    async function runPageLoad() {
        const requestSequence = ++pageLoadSequence;

        isPageInitializing.value = true;

        await loadSchools();
        const schoolId = await resolveSchoolId();

        if (requestSequence !== pageLoadSequence) {
            return;
        }

        resolvedSchoolId.value = schoolId;

        if (!resolvedSchoolId.value) {
            vehiclesLoadSequence += 1;
            vehicles.value = [];

            isPageInitializing.value = false;

            return;
        }

        await loadVehicles();

        if (requestSequence === pageLoadSequence) {
            isPageInitializing.value = false;
        }
    }

    onMounted(() => {
        void runPageLoad();
    });

    watch(
        () => route.query.schoolId,
        () => {
            void runPageLoad();
        },
    );

    onBeforeUnmount(() => {
        pageLoadSequence += 1;
        vehiclesLoadSequence += 1;
    });

    async function handleRetryLoad() {
        if (schoolsLoadError.value) {
            await loadSchools(true);
        }

        if (resolvedSchoolId.value) {
            await loadVehicles();

            return;
        }

        await runPageLoad();
    }

    function handleRequestDeleteVehicle(vehicle: Vehicle) {
        deleteActionError.value = null;
        vehiclePendingDelete.value = vehicle;
    }

    function handleVehicleDeleteDialogOpen(open: boolean) {
        if (!open) {
            vehiclePendingDelete.value = null;
        }
    }

    function handleCancelDeleteVehicle() {
        vehiclePendingDelete.value = null;
    }

    async function handleConfirmDeleteVehicle() {
        const target = vehiclePendingDelete.value;
        const schoolId = resolvedSchoolId.value;

        if (!target || !schoolId) return;

        vehiclePendingDelete.value = null;
        deleteActionError.value = null;

        try {
            await deleteVehicle(target.id);
            await loadVehicles();
            addToast({
                title: 'Pojazd usunięty',
                description: `${target.name} został usunięty z floty.`,
                variant: 'success',
            });
        } catch (err) {
            if (getApiErrorStatusCode(err) === 404) {
                await loadVehicles();

                return;
            }

            deleteActionError.value =
                err instanceof Error
                    ? err.message
                    : 'Nie udało się usunąć pojazdu.';
        }
    }

    async function handleSetDefaultVehicle(vehicle: Vehicle) {
        const schoolId = resolvedSchoolId.value;

        if (!schoolId) return;

        try {
            await setVehicleAsDefault(schoolId, vehicle.id);
            await loadVehicles();
            addToast({
                title: 'Domyślny pojazd zmieniony',
                description: `${vehicle.name} jest teraz domyślnym pojazdem.`,
                variant: 'success',
            });
        } catch (err) {
            addToast({
                title: 'Błąd',
                description:
                    err instanceof Error
                        ? err.message
                        : 'Nie udało się ustawić domyślnego pojazdu.',
                variant: 'error',
            });
        }
    }

    async function handleVehicleStatusChange(
        vehicle: Vehicle,
        payload: VehicleStatusUpdateBody,
    ) {
        if (
            vehicle.status === payload.status &&
            vehicle.unavailableUntil === (payload.unavailableUntil ?? null)
        ) {
            return;
        }

        if (statusUpdatingVehicleId.value !== null) return;

        statusUpdatingVehicleId.value = vehicle.id;

        try {
            const updated = await updateVehicleStatus(vehicle.id, payload);
            const currentVehicleIndex = vehicles.value.findIndex(
                (candidateVehicle) => candidateVehicle.id === vehicle.id,
            );

            if (currentVehicleIndex === -1) {
                await loadVehicles();

                return;
            }

            vehicles.value = vehicles.value.map(
                (currentVehicle, vehicleIndex) =>
                    vehicleIndex === currentVehicleIndex
                        ? { ...currentVehicle, ...updated }
                        : currentVehicle,
            );
        } catch (err) {
            addToast({
                title: 'Zmiana statusu',
                description:
                    err instanceof Error
                        ? err.message
                        : 'Nie udało się zmienić statusu pojazdu.',
                variant: 'error',
            });
        } finally {
            if (statusUpdatingVehicleId.value === vehicle.id) {
                statusUpdatingVehicleId.value = null;
            }
        }
    }

    return {
        isManager,
        resolvedSchoolId,
        schools,
        isSchoolsLoading,
        schoolsLoadError,
        activeSchool,
        contextMessage,
        loadError,
        deleteActionError,
        vehicles,
        filteredVehicles,
        searchTerm,
        statusFilter,
        hasActiveFilters,
        resultsLabel,
        vehiclePendingDelete,
        statusUpdatingVehicleId,
        activePanel,
        isListLoading: isPageLoading,
        isDeleteLoading,
        isSetDefaultLoading,
        handleTabSelect,
        handleSearchChange,
        handleStatusFilterChange,
        handleClearFilters,
        handleSchoolChange,
        handleRetryLoad,
        handleRequestDeleteVehicle,
        handleVehicleDeleteDialogOpen,
        handleCancelDeleteVehicle,
        handleConfirmDeleteVehicle,
        handleSetDefaultVehicle,
        handleVehicleStatusChange,
    };
}
