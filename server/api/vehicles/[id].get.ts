import {
    mockVehicleRowToDetailPayload,
    mockVehiclesGetById,
} from '~~/server/utils/mockVehiclesStore';
import { parseRequiredUuidRouterParam } from '~~/server/utils/requestValidation';
import { bffUpstreamVehiclesGetById } from '~~/server/utils/vehiclesBff';

export default defineEventHandler(async (event) => {
    const id = parseRequiredUuidRouterParam(event, 'id', {
        required: 'Brak identyfikatora pojazdu.',
        invalid: 'Nieprawidłowy identyfikator pojazdu.',
    });

    const upstream = resolveUpstreamBase(event);

    if (upstream) {
        return bffUpstreamVehiclesGetById(event, upstream, id);
    }

    await requireManagerFromCookie(event);

    const row = mockVehiclesGetById(id);

    if (!row) {
        throw createError({
            statusCode: 404,
            message: 'Pojazd nie istnieje.',
        });
    }

    return {
        success: true,
        data: mockVehicleRowToDetailPayload(row),
    };
});
