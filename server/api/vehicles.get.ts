import { executeBffAdapter } from '~~/server/utils/bff/bffAdapterExecutor';
import {
    parseRequiredUuidQuery,
    readQueryString,
} from '~~/server/utils/validation/requestValidation';

export default defineEventHandler(async (event) => {
    const rawQuery = getQuery(event);
    const schoolId = parseRequiredUuidQuery(rawQuery, 'schoolId', {
        required: 'Parametr schoolId jest wymagany.',
        invalid: 'Parametr schoolId musi być poprawnym identyfikatorem UUID.',
    });

    const startTime = readQueryString(rawQuery.startTime);
    const endTime = readQueryString(rawQuery.endTime);

    if (startTime.length > 0 !== endTime.length > 0) {
        throw createError({
            statusCode: 400,
            message:
                'Parametry startTime i endTime muszą być podane razem lub wcale.',
        });
    }

    const timeFilter =
        startTime.length > 0 && endTime.length > 0
            ? { startTime, endTime }
            : undefined;

    return executeBffAdapter(event, {
        upstream: ({ upstreamBase }) =>
            bffUpstreamVehiclesList(event, upstreamBase, schoolId, timeFilter),
        mock: async () => {
            await requireAuthenticatedFromCookie(event);

            return bffMockVehiclesList(schoolId);
        },
    });
});
