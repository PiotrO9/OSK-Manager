import { executeBffAdapter } from '~~/server/utils/bff/bffAdapterExecutor';
import {
    bffUpstreamCourseTypesList,
    type CourseTypesPayload,
} from '~~/server/utils/courses/courseTypesBff';
import { MOCK_DEFAULT_OFFERED_COURSE_TYPES } from '~~/server/utils/schools/mockDrivingSchoolsStore';

interface CourseTypesResponse {
    success: true;
    data: CourseTypesPayload;
}

export default defineEventHandler(async (event) => {
    return executeBffAdapter<CourseTypesResponse>(event, {
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
