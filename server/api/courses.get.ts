import { executeBffAdapter } from '~~/server/utils/bff/bffAdapterExecutor';
import { bffUpstreamCoursesList } from '~~/server/utils/courses/coursesBff';
import { bffMockCoursesList } from '~~/server/utils/courses/coursesMockBff';
import { parseRequiredUuidQuery } from '~~/server/utils/validation/requestValidation';

export default defineEventHandler(async (event) => {
    const schoolId = parseRequiredUuidQuery(getQuery(event), 'schoolId', {
        required: 'Parametr schoolId jest wymagany.',
        invalid: 'Parametr schoolId musi być poprawnym identyfikatorem UUID.',
    });

    return executeBffAdapter(event, {
        upstream: ({ upstreamBase }) =>
            bffUpstreamCoursesList(event, upstreamBase, schoolId),
        mock: async () => {
            await requireManagerFromCookie(event);

            return bffMockCoursesList(schoolId);
        },
    });
});
