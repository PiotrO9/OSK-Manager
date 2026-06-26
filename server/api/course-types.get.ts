import { bffUpstreamCourseTypesList } from '~~/server/utils/courses/courseTypesBff';
import { MOCK_DEFAULT_OFFERED_COURSE_TYPES } from '~~/server/utils/schools/mockDrivingSchoolsStore';

export default defineEventHandler(async (event) => {
    const upstream = resolveUpstreamBase(event);

    if (upstream) {
        return bffUpstreamCourseTypesList(event, upstream);
    }

    await requireManagerFromCookie(event);

    return {
        success: true,
        data: {
            courseTypes: MOCK_DEFAULT_OFFERED_COURSE_TYPES,
        },
    };
});
