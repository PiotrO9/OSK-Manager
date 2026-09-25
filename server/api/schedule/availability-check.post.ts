import { executeBffAdapter } from '~~/server/utils/bff/bffAdapterExecutor';
import { bffScheduleAvailabilityCheck } from '~~/server/utils/schedule/scheduleAvailabilityBff';
import { parseScheduleAvailabilityCheck } from '~~/server/utils/schedule/parseScheduleAvailabilityCheck';

export default defineEventHandler(async (event) => {
    const body = parseScheduleAvailabilityCheck(await readBody(event));

    if (!body) {
        throw createError({
            statusCode: 400,
            message: 'Nieprawidłowe dane sprawdzenia dostępności.',
        });
    }

    return executeBffAdapter(event, {
        upstream: ({ upstreamBase }) =>
            bffScheduleAvailabilityCheck(event, upstreamBase, body),
        mock: async () => {
            await requireAuthenticatedFromCookie(event);
            throw createError({
                statusCode: 503,
                message:
                    'Sprawdzanie dostępności wymaga połączenia z backendem.',
            });
        },
    });
});
