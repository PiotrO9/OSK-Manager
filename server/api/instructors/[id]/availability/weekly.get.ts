import { isUuid } from '~~/server/utils/parseVehicleRequestBody';
import { bffWeeklyGet } from '~~/server/utils/availabilityBff';
import { mockAvailabilityGetWeekly } from '~~/server/utils/mockAvailabilityStore';

export default defineEventHandler(async (event) => {
    const idRaw = getRouterParam(event, 'id');
    const id = idRaw?.trim() ?? '';

    if (!id) {
        throw createError({
            statusCode: 400,
            message: 'Brak identyfikatora instruktora.',
        });
    }

    if (!isUuid(id)) {
        throw createError({
            statusCode: 400,
            message: 'Nieprawidłowy identyfikator instruktora.',
        });
    }

    const upstream = resolveUpstreamBase(event);

    if (upstream) {
        return bffWeeklyGet(event, upstream, id);
    }

    await requireManagerFromCookie(event);

    return {
        success: true,
        data: {
            weekly: mockAvailabilityGetWeekly(id),
        },
    };
});
