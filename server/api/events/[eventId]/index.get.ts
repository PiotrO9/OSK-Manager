import { executeBffAdapter } from '~~/server/utils/bff/bffAdapterExecutor';
import { bffEventsGet } from '~~/server/utils/events/eventsCrudBff';
import { parseRequiredUuidRouterParam } from '~~/server/utils/validation/requestValidation';

export default defineEventHandler(async (event) => {
    const eventId = parseRequiredUuidRouterParam(event, 'eventId', {
        required: 'Brak identyfikatora wydarzenia.',
        invalid: 'Nieprawidłowy identyfikator wydarzenia.',
    });

    return executeBffAdapter(event, {
        upstream: ({ upstreamBase }) =>
            bffEventsGet(event, upstreamBase, eventId),
        mock: () => {
            throw createError({
                statusCode: 404,
                statusMessage: 'Wydarzenie nie istnieje (tryb demo).',
            });
        },
    });
});
