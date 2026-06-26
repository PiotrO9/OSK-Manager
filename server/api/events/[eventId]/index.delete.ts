import { bffEventsDelete } from '~~/server/utils/events/eventsBff';
import { parseRequiredUuidRouterParam } from '~~/server/utils/validation/requestValidation';

export default defineEventHandler(async (event) => {
    const eventId = parseRequiredUuidRouterParam(event, 'eventId', {
        required: 'Brak identyfikatora wydarzenia.',
        invalid: 'Nieprawidłowy identyfikator wydarzenia.',
    });

    const upstream = resolveUpstreamBase(event);

    if (upstream) {
        return bffEventsDelete(event, upstream, eventId);
    }

    await requireManagerFromCookie(event);

    return {
        success: true,
    };
});
