import { bffUpstreamCoursesList } from '~~/server/utils/coursesBff';
import { bffMockCoursesList } from '~~/server/utils/coursesMockBff';
import { parseRequiredUuidQuery } from '~~/server/utils/requestValidation';

export default defineEventHandler(async (event) => {
    const schoolId = parseRequiredUuidQuery(getQuery(event), 'schoolId', {
        required: 'Parametr schoolId jest wymagany.',
        invalid: 'Parametr schoolId musi byÄ‡ poprawnym identyfikatorem UUID.',
    });

    const upstream = resolveUpstreamBase(event);

    if (upstream) {
        return bffUpstreamCoursesList(event, upstream, schoolId);
    }

    await requireManagerFromCookie(event);

    return bffMockCoursesList(schoolId);
});
