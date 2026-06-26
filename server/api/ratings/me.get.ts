import { bffUpstreamOwnLessonRatingsList } from '~~/server/utils/lessonRatingsBff';
import { bffMockOwnLessonRatingsList } from '~~/server/utils/ratingsMockBff';

export default defineEventHandler(async (event) => {
    const upstream = resolveUpstreamBase(event);

    if (upstream) {
        return bffUpstreamOwnLessonRatingsList(event, upstream);
    }

    await requireInstructorFromCookie(event);

    return bffMockOwnLessonRatingsList();
});
