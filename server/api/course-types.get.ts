import { executeBffAdapter } from '~~/server/utils/bff/bffAdapterExecutor';
import { bffUpstreamCourseTypesList } from '~~/server/utils/courses/courseTypesBff';
import { MOCK_DEFAULT_OFFERED_COURSE_TYPES } from '~~/server/utils/schools/mockDrivingSchoolsStore';

export default defineEventHandler(async (event) => {
    return executeBffAdapter(event, {
        upstream: ({ upstreamBase }) =>
            bffUpstreamCourseTypesList(event, upstreamBase),
        mock: async () => {
            await requireManagerFromCookie(event);

            return {
                success: true,
                data: {
                    courseTypes: MOCK_DEFAULT_OFFERED_COURSE_TYPES,
                },
            };
        },
    });
});
