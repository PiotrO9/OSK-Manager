import {
    bffUpstreamOwnLessonRatingsList,
    mockOwnLessonRatingsPayload,
} from '~~/server/utils/lessonRatingsBff';

export default defineEventHandler(async (event) => {
    const upstream = resolveUpstreamBase(event);

    if (upstream) {
        return bffUpstreamOwnLessonRatingsList(event, upstream);
    }

    await requireInstructorFromCookie(event);

    return {
        success: true,
        data: mockOwnLessonRatingsPayload(),
    };
});
