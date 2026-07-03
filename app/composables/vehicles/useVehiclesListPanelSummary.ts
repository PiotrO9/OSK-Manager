import type { VehiclesListPanelId } from '~/composables/vehicles/useVehiclesListPage';
import type { Vehicle } from '~/types/vehicles/vehicle';

export interface VehiclesListPanelSummaryProps {
    activePanel: VehiclesListPanelId;
    resolvedSchoolId: string | null;
    vehicles: Vehicle[];
}

export function useVehiclesListPanelSummary(
    props: Readonly<VehiclesListPanelSummaryProps>,
) {
    const createVehicleTarget = computed(() => ({
        path: '/vehicles/new',
        query: props.resolvedSchoolId
            ? { schoolId: props.resolvedSchoolId }
            : {},
    }));

    const availableVehiclesCount = computed(
        () =>
            props.vehicles.filter((vehicle) => isVehicleAvailable(vehicle))
                .length,
    );

    const unavailableVehiclesCount = computed(
        () =>
            props.vehicles.filter((vehicle) => !isVehicleAvailable(vehicle))
                .length,
    );

    const defaultVehiclesCount = computed(
        () => props.vehicles.filter((vehicle) => vehicle.isDefault).length,
    );

    const resultsLabel = computed(() => {
        const count = props.vehicles.length;

        if (count === 1) return '1 wynik';

        if (count > 1 && count < 5) return `${count} wyniki`;

        return `${count} wynikow`;
    });

    const summaryItems = computed(() => [
        {
            label: 'Pojazdy',
            value: props.vehicles.length,
            tone: 'neutral' as const,
        },
        {
            label: 'Dostepne',
            value: availableVehiclesCount.value,
            tone: 'success' as const,
        },
        {
            label: 'Niedostępne',
            value: unavailableVehiclesCount.value,
            tone: 'warning' as const,
        },
        {
            label: 'Domyslne',
            value: defaultVehiclesCount.value,
            tone: 'info' as const,
        },
    ]);

    const activePanelLabel = computed(() =>
        props.activePanel === 'manager' ? 'statusy' : 'lista',
    );

    return {
        activePanelLabel,
        createVehicleTarget,
        displayText,
        formatOptionalDate,
        formatVehicleMeta,
        resultsLabel,
        summaryItems,
        vehicleStatusLabel,
        vehicleStatusTone,
    };
}

function displayText(value: string): string {
    const t = value.trim();

    return t.length > 0 ? t : '-';
}

function isVehicleAvailable(vehicle: Vehicle): boolean {
    return vehicle.status !== 'UNAVAILABLE';
}

function formatOptionalDate(value: string | null): string {
    return value ?? 'Brak terminu';
}

function formatVehicleMeta(vehicle: Vehicle): string {
    const year = vehicle.modelYear != null ? String(vehicle.modelYear) : null;
    const mileage =
        vehicle.mileageKm != null
            ? `${new Intl.NumberFormat('pl-PL').format(vehicle.mileageKm)} km`
            : null;

    return [year, mileage].filter(Boolean).join(' - ') || 'Brak metadanych';
}

function vehicleStatusLabel(vehicle: Vehicle): string {
    return isVehicleAvailable(vehicle) ? 'Dostępny' : 'Niedostępny';
}

function vehicleStatusTone(vehicle: Vehicle): 'success' | 'warning' {
    return isVehicleAvailable(vehicle) ? 'success' : 'warning';
}
