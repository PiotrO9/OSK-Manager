import type { Vehicle } from '~/types/vehicles/vehicle';

export type VehicleAvailabilityTone = 'success' | 'warning';

const YMD_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

function parseYmd(value: string | null): Date | null {
    if (!value) return null;

    const match = YMD_RE.exec(value.trim());

    if (!match) return null;

    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const date = new Date(Date.UTC(year, month - 1, day));

    if (
        date.getUTCFullYear() !== year ||
        date.getUTCMonth() !== month - 1 ||
        date.getUTCDate() !== day
    ) {
        return null;
    }

    return date;
}

export function formatYmdDatePl(value: string | null): string {
    const date = parseYmd(value);

    if (!date) return '';

    const day = String(date.getUTCDate()).padStart(2, '0');
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const year = String(date.getUTCFullYear());

    return `${day}.${month}.${year}`;
}

export function getUtcTodayYmd(now = new Date()): string {
    return formatUtcDateYmd(
        new Date(
            Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
        ),
    );
}

export function addUtcDaysYmd(days: number, now = new Date()): string {
    const today = new Date(`${getUtcTodayYmd(now)}T00:00:00.000Z`);

    today.setUTCDate(today.getUTCDate() + days);

    return formatUtcDateYmd(today);
}

export function isUnavailableUntilSelectable(
    value: string,
    now = new Date(),
): boolean {
    const selected = parseYmd(value);

    if (!selected) return false;

    const today = parseYmd(getUtcTodayYmd(now));

    return today !== null && selected.getTime() >= today.getTime();
}

export function vehicleAvailabilityLabel(vehicle: Vehicle): string {
    if (vehicle.status !== 'UNAVAILABLE') return 'Aktywny';

    if (!vehicle.unavailableUntil) return 'Nieaktywny';

    const formatted = formatYmdDatePl(vehicle.unavailableUntil);

    return formatted ? `Nieaktywny do ${formatted}` : 'Nieaktywny';
}

export function vehicleAvailabilityDescription(vehicle: Vehicle): string {
    if (vehicle.status !== 'UNAVAILABLE') {
        return 'Pojazd może być używany w harmonogramie.';
    }

    if (!vehicle.unavailableUntil) {
        return 'Pojazd oznaczony jako nieaktywny bezterminowo.';
    }

    const formatted = formatYmdDatePl(vehicle.unavailableUntil);

    return formatted
        ? `Pojazd oznaczony jako nieaktywny do ${formatted}.`
        : 'Pojazd oznaczony jako nieaktywny.';
}

export function vehicleAvailabilityTone(
    vehicle: Vehicle,
): VehicleAvailabilityTone {
    return vehicle.status === 'UNAVAILABLE' ? 'warning' : 'success';
}

function formatUtcDateYmd(value: Date): string {
    const year = value.getUTCFullYear();
    const month = String(value.getUTCMonth() + 1).padStart(2, '0');
    const day = String(value.getUTCDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}
