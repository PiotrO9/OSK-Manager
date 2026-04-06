import { bffUpstreamVehiclesDelete } from '~~/server/utils/vehiclesBff';

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id');

    if (!id || !id.trim()) {
        throw createError({
            statusCode: 400,
            message: 'Brak identyfikatora pojazdu.',
        });
    }

    const upstream = resolveUpstreamBase(event);

    if (upstream) {
        return bffUpstreamVehiclesDelete(event, upstream, id.trim());
    }

    await requireManagerFromCookie(event);

    const deleted = mockVehiclesDelete(id.trim());

    if (!deleted) {
        throw createError({
            statusCode: 404,
            message: 'Pojazd nie istnieje.',
        });
    }

    return { success: true };
});
