import type { MockVehicleStatus } from '~~/server/utils/vehicles/mockVehiclesStore';
import { parseRequiredUuidRouterParam } from '~~/server/utils/validation/requestValidation';
import { bffUpstreamVehiclesUpdateStatus } from '~~/server/utils/vehicles/vehiclesBff';

function parseVehicleStatus(raw: unknown): MockVehicleStatus | null {
    if (!raw || typeof raw !== 'object') return null;

    const value = (raw as { status?: unknown }).status;
    const status = typeof value === 'string' ? value.trim().toUpperCase() : '';

    return status === 'ACTIVE' || status === 'UNAVAILABLE' ? status : null;
}

export default defineEventHandler(async (event) => {
    const id = parseRequiredUuidRouterParam(event, 'id', {
        required: 'Brak identyfikatora pojazdu.',
        invalid: 'Nieprawidłowy identyfikator pojazdu.',
    });

    const body = await readBody(event);
    const status = parseVehicleStatus(body);

    if (!status) {
        throw createError({
            statusCode: 400,
            message: 'Pole status musi być ACTIVE albo UNAVAILABLE.',
        });
    }

    const upstream = resolveUpstreamBase(event);

    if (upstream) {
        return bffUpstreamVehiclesUpdateStatus(event, upstream, id, {
            status,
        });
    }

    await requireManagerFromCookie(event);

    return bffMockVehiclesUpdateStatus(id, status);
});
