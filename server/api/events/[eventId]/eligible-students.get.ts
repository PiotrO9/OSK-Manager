import { executeBffAdapter } from '~~/server/utils/bff/bffAdapterExecutor';
import { bffEventEligibleStudentsGet } from '~~/server/utils/events/eventStudentsBff';
import { parseRequiredUuidRouterParam } from '~~/server/utils/validation/requestValidation';

export default defineEventHandler(async (event) => {
    const eventId = parseRequiredUuidRouterParam(event, 'eventId', {
        required: 'Brak identyfikatora wydarzenia.',
        invalid: 'Nieprawidłowy identyfikator wydarzenia.',
    });

    return executeBffAdapter(event, {
        upstream: ({ upstreamBase }) =>
            bffEventEligibleStudentsGet(event, upstreamBase, eventId),
        mock: async () => {
            await requireManagerFromCookie(event);

            throw createError({
                statusCode: 404,
                statusMessage: 'Lista kwalifikacji niedostępna (tryb demo).',
            });
        },
    });
});
