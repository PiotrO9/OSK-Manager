import { executeBffAdapter } from '~~/server/utils/bff/bffAdapterExecutor';
import { bffUpstreamInstructorsList } from '~~/server/utils/instructors/instructorsBff';
import { bffMockInstructorsList } from '~~/server/utils/instructors/instructorsMockBff';
import { parseRequiredUuidQuery } from '~~/server/utils/validation/requestValidation';

export default defineEventHandler(async (event) => {
    const schoolId = parseRequiredUuidQuery(getQuery(event), 'schoolId', {
        required: 'Parametr schoolId jest wymagany.',
        invalid: 'Parametr schoolId musi być poprawnym identyfikatorem UUID.',
    });

    return executeBffAdapter(event, {
        upstream: ({ upstreamBase }) =>
            bffUpstreamInstructorsList(event, upstreamBase, schoolId),
        mock: async () => {
            await requireManagerFromCookie(event);

            return bffMockInstructorsList(schoolId);
        },
    });
});
