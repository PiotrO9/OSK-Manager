import type { H3Event } from 'h3';
import type { MockDrivingSchoolOfferedType } from '~~/server/utils/schools/mockDrivingSchoolsStore';
import { upstreamRequest } from '~~/server/utils/upstream/upstreamRequest';

export interface CourseTypesPayload {
    courseTypes: MockDrivingSchoolOfferedType[];
}

export async function bffUpstreamCourseTypesList(
    event: H3Event,
    upstreamBase: string,
): Promise<{ success: true; data: CourseTypesPayload }> {
    const { data } = await upstreamRequest<CourseTypesPayload>(
        event,
        upstreamBase,
        {
            path: '/course-types',
            fallbackError: 'Nie udało się pobrać katalogu kategorii',
        },
    );

    return {
        success: true,
        data: {
            courseTypes: Array.isArray(data?.courseTypes)
                ? data.courseTypes
                : [],
        },
    };
}
