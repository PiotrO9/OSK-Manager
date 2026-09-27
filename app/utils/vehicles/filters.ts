import type { Vehicle, VehicleStatus } from '~/types/vehicles/vehicle';

export type VehicleStatusFilter = 'all' | VehicleStatus;

export function formatVehiclesResultsLabel(count: number): string {
    const absoluteCount = Math.abs(count);
    const lastDigit = absoluteCount % 10;
    const lastTwoDigits = absoluteCount % 100;

    if (absoluteCount === 1) return '1 wynik';

    if (
        lastDigit >= 2 &&
        lastDigit <= 4 &&
        (lastTwoDigits < 12 || lastTwoDigits > 14)
    ) {
        return `${count} wyniki`;
    }

    return `${count} wyników`;
}

function normalizeSearchValue(value: string): string {
    return value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLocaleLowerCase('pl-PL')
        .replace(/\s+/g, ' ')
        .trim();
}

export function filterVehicles(
    vehicles: readonly Vehicle[],
    searchTerm: string,
    statusFilter: VehicleStatusFilter,
): Vehicle[] {
    const query = normalizeSearchValue(searchTerm);
    const compactQuery = query.replace(/\s/g, '');

    return vehicles.filter((vehicle) => {
        if (statusFilter !== 'all' && vehicle.status !== statusFilter) {
            return false;
        }

        if (!query) return true;

        const name = normalizeSearchValue(vehicle.name);
        const registration = normalizeSearchValue(vehicle.registrationNumber);

        return (
            name.includes(query) ||
            registration.includes(query) ||
            registration.replace(/\s/g, '').includes(compactQuery)
        );
    });
}
