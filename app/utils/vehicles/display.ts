import type { Vehicle } from '~/types/vehicles/vehicle';
import {
    vehicleAvailabilityLabel,
    vehicleAvailabilityTone,
} from '~/utils/vehicles/availability';

export function displayVehicleText(value: string): string {
    const t = value.trim();

    return t.length > 0 ? t : '-';
}

export function formatVehicleOptionalDate(value: string | null): string {
    return value ?? 'Brak terminu';
}

export function formatVehicleMeta(vehicle: Vehicle): string {
    const year = vehicle.modelYear != null ? String(vehicle.modelYear) : null;
    const mileage =
        vehicle.mileageKm != null
            ? `${new Intl.NumberFormat('pl-PL').format(vehicle.mileageKm)} km`
            : null;

    return [year, mileage].filter(Boolean).join(' - ') || 'Brak metadanych';
}

export function vehicleStatusLabel(vehicle: Vehicle): string {
    return vehicleAvailabilityLabel(vehicle);
}

export function vehicleStatusTone(vehicle: Vehicle): 'success' | 'warning' {
    return vehicleAvailabilityTone(vehicle);
}
