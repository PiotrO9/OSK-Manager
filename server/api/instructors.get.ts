import { bffUpstreamInstructorsList } from '~~/server/utils/instructorsBff';
import { bffMockInstructorsList } from '~~/server/utils/instructorsMockBff';
import { parseRequiredUuidQuery } from '~~/server/utils/requestValidation';

export default defineEventHandler(async (event) => {
    const schoolId = parseRequiredUuidQuery(getQuery(event), 'schoolId', {
        required: 'Parametr schoolId jest wymagany.',
        invalid: 'Parametr schoolId musi byÄ‡ poprawnym identyfikatorem UUID.',
    });

    const upstream = resolveUpstreamBase(event);

    if (upstream) {
        return bffUpstreamInstructorsList(event, upstream, schoolId);
    }

    await requireManagerFromCookie(event);

    return bffMockInstructorsList(schoolId);
});
