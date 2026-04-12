import { bffEventsGet } from '~~/server/utils/eventsBff';
import { isUuid } from '~~/server/utils/parseVehicleRequestBody';

export default defineEventHandler(async (event) => {
    const eventIdRaw = getRouterParam(event, 'eventId');
    const eventId = eventIdRaw?.trim() ?? '';

    if (!eventId) {
        throw createError({
            statusCode: 400,
            message: 'Brak identyfikatora wydarzenia.',
        });
    }

    if (!isUuid(eventId)) {
        throw createError({
            statusCode: 400,
            message: 'Nieprawidłowy identyfikator wydarzenia.',
        });
    }

    const upstream = resolveUpstreamBase(event);

    if (upstream) {
        return bffEventsGet(event, upstream, eventId);
    }

    throw createError({
        statusCode: 404,
        statusMessage: 'Wydarzenie nie istnieje (tryb demo).',
    });
});
