import { parseRequiredRouterParam } from '~~/server/utils/requestValidation';
import { bffUpstreamVehiclesDelete } from '~~/server/utils/vehiclesBff';

export default defineEventHandler(async (event) => {
    const id = parseRequiredRouterParam(
        event,
        'id',
        'Brak identyfikatora pojazdu.',
    );

    const upstream = resolveUpstreamBase(event);

    if (upstream) {
        return bffUpstreamVehiclesDelete(event, upstream, id);
    }

    await requireManagerFromCookie(event);

    const deleted = mockVehiclesDelete(id);

    if (!deleted) {
        throw createError({
            statusCode: 404,
            message: 'Pojazd nie istnieje.',
        });
    }

    return { success: true };
});
