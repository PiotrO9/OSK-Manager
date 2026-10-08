import { parseVehicleUpdatedAt } from '~/types/vehicles/vehicle';

export function formatVehicleUpdatedAt(updatedAt: string | null): string {
    const validDate = parseVehicleUpdatedAt(updatedAt);

    if (!validDate) {
        return 'Brak informacji o ostatniej aktualizacji danych pojazdu';
    }

    const formatted = new Intl.DateTimeFormat('pl-PL', {
        timeZone: 'Europe/Warsaw',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23',
    }).format(new Date(validDate));

    return `Dane pojazdu zaktualizowano: ${formatted}`;
}
