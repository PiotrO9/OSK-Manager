import { isUuid } from '~~/server/utils/parseVehicleRequestBody';
import { bffSlotsGet } from '~~/server/utils/availabilityBff';
import { mockGenerateSlots } from '~~/server/utils/mockSlots';
import { getValidatedSlotsDateRangeQuery } from '~~/server/utils/slotsDateRangeValidation';

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

    const query = getQuery(event);
    const { dateFromRaw, dateToRaw } = getValidatedSlotsDateRangeQuery(query);

    const upstream = resolveUpstreamBase(event);

    if (upstream) {
        return bffSlotsGet(event, upstream, id, dateFromRaw, dateToRaw);
    }

    await requireManagerFromCookie(event);

    return {
        success: true,
        data: {
            slots: mockGenerateSlots(id, dateFromRaw, dateToRaw),
        },
    };
});
