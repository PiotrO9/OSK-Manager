import { executeBffAdapter } from '~~/server/utils/bff/bffAdapterExecutor';
import { bffUpstreamOwnLessonRatingsList } from '~~/server/utils/ratings/lessonRatingsBff';
import { bffMockOwnLessonRatingsList } from '~~/server/utils/ratings/ratingsMockBff';

export default defineEventHandler(async (event) => {
    return executeBffAdapter(event, {
        upstream: ({ upstreamBase }) =>
            bffUpstreamOwnLessonRatingsList(event, upstreamBase),
        mock: async () => {
            await requireInstructorFromCookie(event);

            return bffMockOwnLessonRatingsList();
        },
    });
});
