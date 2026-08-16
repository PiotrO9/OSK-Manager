import { executeBffAdapter } from '~~/server/utils/bff/bffAdapterExecutor';
import { bffEventsDelete } from '~~/server/utils/events/eventsBff';
import { parseRequiredUuidRouterParam } from '~~/server/utils/validation/requestValidation';

export default defineEventHandler(async (event) => {
    const eventId = parseRequiredUuidRouterParam(event, 'eventId', {
        required: 'Brak identyfikatora wydarzenia.',
        invalid: 'Nieprawidłowy identyfikator wydarzenia.',
    });

    return executeBffAdapter(event, {
        upstream: ({ upstreamBase }) =>
            bffEventsDelete(event, upstreamBase, eventId),
        mock: async () => {
            await requireManagerFromCookie(event);

            return {
                success: true,
            };
        },
    });
});
