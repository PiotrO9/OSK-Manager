import type { Vehicle } from '~/types/vehicles/vehicle';

export function vehicleDeletionBlockMessage(vehicle: Vehicle): string | null {
    if (vehicle.deletionBlockReason === 'DEFAULT') {
        return 'Nie można usunąć domyślnego pojazdu. Najpierw wybierz inny pojazd domyślny.';
    }

    if (vehicle.deletionBlockReason === 'SCHEDULED_LESSONS') {
        return 'Nie można usunąć pojazdu z trwającymi lub zaplanowanymi lekcjami.';
    }

    return null;
}
