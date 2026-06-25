import { parseRequiredUuidQuery } from '~~/server/utils/requestValidation';

export default defineEventHandler(async (event) => {
    const rawQuery = getQuery(event);
    const schoolId = parseRequiredUuidQuery(rawQuery, 'schoolId', {
        required: 'Parametr schoolId jest wymagany.',
        invalid: 'Parametr schoolId musi być poprawnym identyfikatorem UUID.',
    });

    const upstream = resolveUpstreamBase(event);

    if (upstream) {
        return bffUpstreamInstructorsList(event, upstream, schoolId);
    }

    await requireManagerFromCookie(event);

    return {
        success: true,
        data: mockInstructorsListPayload(schoolId),
    };
});
