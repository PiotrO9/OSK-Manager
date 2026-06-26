import {
    parseRequiredUuidQuery,
    readQueryString,
} from '~~/server/utils/requestValidation';

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

    const upstream = resolveUpstreamBase(event);

    if (upstream) {
        return bffUpstreamVehiclesList(event, upstream, schoolId, timeFilter);
    }

    await requireAuthenticatedFromCookie(event);

    return bffMockVehiclesList(schoolId);
});
