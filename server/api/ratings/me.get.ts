import { bffUpstreamOwnLessonRatingsList } from '~~/server/utils/ratings/lessonRatingsBff';
import { bffMockOwnLessonRatingsList } from '~~/server/utils/ratings/ratingsMockBff';

export default defineEventHandler(async (event) => {
    const upstream = resolveUpstreamBase(event);

    if (upstream) {
        return bffUpstreamOwnLessonRatingsList(event, upstream);
    }

    await requireInstructorFromCookie(event);

    return bffMockOwnLessonRatingsList();
});
