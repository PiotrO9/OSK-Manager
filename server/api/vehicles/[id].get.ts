import { bffUpstreamVehiclesGetById } from '~~/server/utils/vehiclesBff';
import { isUuid } from '~~/server/utils/parseVehicleRequestBody';
import {
    mockVehicleRowToDetailPayload,
    mockVehiclesGetById,
} from '~~/server/utils/mockVehiclesStore';

export default defineEventHandler(async (event) => {
    const idRaw = getRouterParam(event, 'id');
    const id = idRaw?.trim() ?? '';

    if (!id) {
        throw createError({
            statusCode: 400,
            message: 'Brak identyfikatora pojazdu.',
        });
    }

    if (!isUuid(id)) {
        throw createError({
            statusCode: 400,
            message: 'Nieprawidłowy identyfikator pojazdu.',
        });
    }

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
