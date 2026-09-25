import { executeBffAdapter } from '~~/server/utils/bff/bffAdapterExecutor';
import { bffScheduleAvailabilityOptions } from '~~/server/utils/schedule/scheduleAvailabilityBff';
import { parseScheduleAvailabilityOptions } from '~~/server/utils/schedule/parseScheduleAvailabilityOptions';

export default defineEventHandler(async (event) => {
    const body = parseScheduleAvailabilityOptions(await readBody(event));

    if (!body) {
        throw createError({
            statusCode: 400,
            message: 'Nieprawidłowe dane pobierania dostępnych godzin.',
        });
    }

    return executeBffAdapter(event, {
        upstream: ({ upstreamBase }) =>
            bffScheduleAvailabilityOptions(event, upstreamBase, body),
        mock: async () => {
            await requireAuthenticatedFromCookie(event);
            throw createError({
                statusCode: 503,
                message: 'Pobieranie godzin wymaga połączenia z backendem.',
            });
        },
    });
});
