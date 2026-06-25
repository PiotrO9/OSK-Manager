import { bffEventEligibleStudentsGet } from '~~/server/utils/eventsBff';
import { parseRequiredUuidRouterParam } from '~~/server/utils/requestValidation';

export default defineEventHandler(async (event) => {
    const eventId = parseRequiredUuidRouterParam(event, 'eventId', {
        required: 'Brak identyfikatora wydarzenia.',
        invalid: 'Nieprawidłowy identyfikator wydarzenia.',
    });

    const upstream = resolveUpstreamBase(event);

    if (upstream) {
        return bffEventEligibleStudentsGet(event, upstream, eventId);
    }

    await requireManagerFromCookie(event);

    throw createError({
        statusCode: 404,
        statusMessage: 'Lista kwalifikacji niedostępna (tryb demo).',
    });
});
