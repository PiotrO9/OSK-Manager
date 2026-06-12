import type { Vehicle, VehicleStatus } from '~/types/vehicle';

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
    const { fetchDefaultDrivingSchool } = useDrivingSchoolsApi();

    const isManager = computed(() => session.value?.role === 'MANAGER');

    const resolvedSchoolId = ref<string | null>(null);
    const contextMessage = ref<string | null>(null);
    const loadError = ref<string | null>(null);
    const deleteActionError = ref<string | null>(null);
    const vehicles = ref<Vehicle[]>([]);
    const vehiclePendingDelete = ref<Vehicle | null>(null);
    const statusUpdatingVehicleId = ref<string | null>(null);

    const activePanel = ref<VehiclesListPanelId>('simple');

    function handleTabSelect(panel: VehiclesListPanelId) {
        activePanel.value = panel;
    }

    function handleTabKeydown(
        event: KeyboardEvent,
        panel: VehiclesListPanelId,
    ) {
        if (isEnterOrSpaceKey(event)) {
            event.preventDefault();
            activePanel.value = panel;
        }
    }

    function readSchoolIdFromQuery(): string | null {
        const raw = route.query.schoolId;
        const s = Array.isArray(raw) ? raw[0] : raw;

        if (typeof s !== 'string') return null;

        const t = s.trim();

        return t.length > 0 ? t : null;
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

        return result.school.id;
    }

    async function loadVehicles() {
        const sid = resolvedSchoolId.value;

        if (!sid) {
            vehicles.value = [];

            return;
        }

        loadError.value = null;

        try {
            vehicles.value = await fetchList(sid);
        } catch (err) {
            loadError.value =
                err instanceof Error
                    ? err.message
                    : 'Nie udało się wczytać listy pojazdów.';
            vehicles.value = [];
        }
    }

    async function runPageLoad() {
        resolvedSchoolId.value = await resolveSchoolId();

        if (!resolvedSchoolId.value) {
            vehicles.value = [];

            return;
        }

        await loadVehicles();
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
        const sid = resolvedSchoolId.value;

        if (!target || !sid) return;

        vehiclePendingDelete.value = null;
        deleteActionError.value = null;

        try {
            await deleteVehicle(target.id);
            await loadVehicles();
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
        const sid = resolvedSchoolId.value;

        if (!sid) return;

        try {
            await setVehicleAsDefault(sid, vehicle.id);
            await loadVehicles();
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
        status: VehicleStatus,
    ) {
        if (vehicle.status === status) return;

        if (statusUpdatingVehicleId.value !== null) return;

        statusUpdatingVehicleId.value = vehicle.id;

        try {
            const updated = await updateVehicleStatus(vehicle.id, status);
            const index = vehicles.value.findIndex((v) => v.id === vehicle.id);

            if (index === -1) {
                await loadVehicles();

                return;
            }

            vehicles.value = vehicles.value.map((item, i) =>
                i === index ? { ...item, ...updated } : item,
            );
        } catch (err) {
            addToast({
                title: 'Zmiana statusu',
                description:
                    err instanceof Error
                        ? err.message
                        : 'Nie udaĹ‚o siÄ™ zmieniÄ‡ statusu pojazdu.',
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
        contextMessage,
        loadError,
        deleteActionError,
        vehicles,
        vehiclePendingDelete,
        statusUpdatingVehicleId,
        activePanel,
        isListLoading,
        isDeleteLoading,
        isSetDefaultLoading,
        handleTabSelect,
        handleTabKeydown,
        handleRequestDeleteVehicle,
        handleVehicleDeleteDialogOpen,
        handleCancelDeleteVehicle,
        handleConfirmDeleteVehicle,
        handleSetDefaultVehicle,
        handleVehicleStatusChange,
    };
}
