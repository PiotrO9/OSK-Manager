import type { Vehicle } from '~/types/vehicles/vehicle';
import type { StatusTone } from '~/types/ui';
import {
    vehicleAvailabilityLabel,
    vehicleAvailabilityTone,
} from '~/utils/vehicles/availability';

export function displayVehicleText(value: string): string {
    const t = value.trim();

    return t.length > 0 ? t : '-';
}

export function formatVehicleOptionalDate(value: string | null): string {
    if (!value) return 'Brak terminu';

    const date = new Date(`${value}T12:00:00Z`);

    if (Number.isNaN(date.getTime())) return value;

    return new Intl.DateTimeFormat('pl-PL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        timeZone: 'UTC',
    }).format(date);
}

export interface VehicleDeadlinePresentation {
    label: string;
    state: 'missing' | 'expired' | 'soon' | 'valid';
    tone: StatusTone;
}

export function getVehicleDeadlinePresentation(
    value: string | null,
    now: Date = new Date(),
): VehicleDeadlinePresentation {
    if (!value) {
        return { label: 'Brak terminu', state: 'missing', tone: 'neutral' };
    }

    const deadline = new Date(`${value}T12:00:00Z`);

    if (Number.isNaN(deadline.getTime())) {
        return { label: value, state: 'missing', tone: 'neutral' };
    }

    const todayUtc = Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate(),
        12,
    );
    const daysLeft = Math.ceil((deadline.getTime() - todayUtc) / 86_400_000);
    const formattedDate = formatVehicleOptionalDate(value);

    if (daysLeft < 0) {
        return {
            label: `${formattedDate} · po terminie`,
            state: 'expired',
            tone: 'danger',
        };
    }

    if (daysLeft <= 30) {
        return {
            label: `${formattedDate} · wkrótce`,
            state: 'soon',
            tone: 'warning',
        };
    }

    return { label: formattedDate, state: 'valid', tone: 'success' };
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
