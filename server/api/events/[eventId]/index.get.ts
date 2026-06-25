import { bffEventsGet } from '~~/server/utils/eventsBff';
import { parseRequiredUuidRouterParam } from '~~/server/utils/requestValidation';

export default defineEventHandler(async (event) => {
    const eventId = parseRequiredUuidRouterParam(event, 'eventId', {
        required: 'Brak identyfikatora wydarzenia.',
        invalid: 'Nieprawidłowy identyfikator wydarzenia.',
    });

    const upstream = resolveUpstreamBase(event);

    if (upstream) {
        return bffEventsGet(event, upstream, eventId);
    }

    throw createError({
        statusCode: 404,
        statusMessage: 'Wydarzenie nie istnieje (tryb demo).',
    });
});
