import type { Ref } from 'vue';
import type { StatusTone } from '~/types/ui';
import type { VehicleDetail } from '~/types/vehicles/vehicle';
import {
    formatVehicleOptionalDate,
    getVehicleDeadlinePresentation,
} from '~/utils/vehicles/display';
import {
    vehicleAvailabilityDescription,
    vehicleAvailabilityLabel,
    vehicleAvailabilityTone,
} from '~/utils/vehicles/availability';

interface UseVehicleDetailsPresentationOptions {
    vehicle: Ref<VehicleDetail>;
}

export interface VehicleDetailsStatusPresentation {
    label: string;
    description: string;
    tone: StatusTone;
}

export interface VehicleDetailsRow {
    label: string;
    value: string;
    copyable?: boolean;
    updatedAt?: string | null;
}

export interface VehicleDetailsDeadlineItem {
    label: string;
    value: string;
    state: 'missing' | 'expired' | 'soon' | 'valid';
    tone: StatusTone;
}

export function useVehicleDetailsPresentation({
    vehicle,
}: UseVehicleDetailsPresentationOptions) {
    const vehicleTitle = computed(() =>
        displayVehicleDetailsText(vehicle.value.name),
    );

    const vehicleInitials = computed(() =>
        getVehicleDetailsInitials(
            vehicle.value.name,
            vehicle.value.registrationNumber,
        ),
    );

    const registrationNumberLabel = computed(() =>
        displayVehicleDetailsText(vehicle.value.registrationNumber),
    );

    const availability = computed<VehicleDetailsStatusPresentation>(() => ({
        label: vehicleAvailabilityLabel(vehicle.value),
        tone: vehicleAvailabilityTone(vehicle.value),
        description: vehicleAvailabilityDescription(vehicle.value),
    }));

    const profileRows = computed<VehicleDetailsRow[]>(() => [
        {
            label: 'Rocznik',
            value: displayVehicleDetailsOptional(vehicle.value.modelYear),
        },
        {
            label: 'Przebieg',
            value:
                vehicle.value.mileageKm === null
                    ? 'Brak danych'
                    : `${displayVehicleDetailsOptional(vehicle.value.mileageKm)} km`,
            updatedAt: vehicle.value.updatedAt,
        },
    ]);

    const deadlineItems = computed<VehicleDetailsDeadlineItem[]>(() => {
        const inspection = getVehicleDeadlinePresentation(
            vehicle.value.inspectionDate,
        );
        const insurance = getVehicleDeadlinePresentation(
            vehicle.value.insuranceDate,
        );

        return [
            {
                label: 'Przegląd techniczny',
                value: inspection.label,
                state: inspection.state,
                tone: inspection.tone,
            },
            {
                label: 'Ubezpieczenie OC',
                value: insurance.label,
                state: insurance.state,
                tone: insurance.tone,
            },
        ];
    });

    const technicalRows = computed<VehicleDetailsRow[]>(() => [
        {
            label: 'Nazwa pojazdu',
            value: vehicleTitle.value,
        },
        {
            label: 'Numer rejestracyjny',
            value: registrationNumberLabel.value,
            copyable: true,
        },
        {
            label: 'Rocznik',
            value: displayVehicleDetailsOptional(vehicle.value.modelYear),
        },
        {
            label: 'Przebieg',
            value:
                vehicle.value.mileageKm === null
                    ? 'Brak danych'
                    : `${displayVehicleDetailsOptional(vehicle.value.mileageKm)} km`,
            updatedAt: vehicle.value.updatedAt,
        },
        {
            label: 'Niedostępny do',
            value: vehicle.value.unavailableUntil
                ? formatVehicleOptionalDate(vehicle.value.unavailableUntil)
                : 'Nie dotyczy',
        },
        {
            label: 'Pojazd domyślny',
            value: vehicle.value.isDefault ? 'Tak' : 'Nie',
        },
    ]);

    return {
        availability,
        deadlineItems,
        profileRows,
        registrationNumberLabel,
        technicalRows,
        vehicleInitials,
        vehicleTitle,
    };
}

export function displayVehicleDetailsText(value: string): string {
    const trimmed = value.trim();

    return trimmed.length > 0 ? trimmed : 'Brak danych';
}

export function displayVehicleDetailsOptional(
    value: string | number | null,
): string {
    if (value === null) return 'Brak danych';

    if (typeof value === 'number') {
        return new Intl.NumberFormat('pl-PL').format(value);
    }

    const trimmed = value.trim();

    return trimmed.length > 0 ? trimmed : 'Brak danych';
}

export function displayVehicleDetailsDate(value: string | null): string {
    if (!value) return 'Brak danych';

    const date = new Date(`${value}T00:00:00Z`);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat('pl-PL', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC',
    }).format(date);
}

export function getVehicleDetailsInitials(
    name: string,
    registrationNumber: string,
): string {
    const source = name.trim() || registrationNumber.trim();
    const initials = source
        .split(/\s+/)
        .filter((part) => part.length > 0)
        .slice(0, 2)
        .map((part) => part.charAt(0))
        .join('');

    return initials.length > 0 ? initials.toUpperCase() : 'PO';
}
