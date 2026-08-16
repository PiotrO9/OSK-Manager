import { executeBffAdapter } from '~~/server/utils/bff/bffAdapterExecutor';
import { bffUpstreamInstructorLessonRatingsList } from '~~/server/utils/ratings/lessonRatingsBff';
import { bffMockLessonRatingsList } from '~~/server/utils/ratings/ratingsMockBff';
import {
    parseRequiredUuidQuery,
    parseRequiredUuidRouterParam,
} from '~~/server/utils/validation/requestValidation';

export default defineEventHandler(async (event) => {
    const id = parseRequiredUuidRouterParam(event, 'id', {
        required: 'Brak identyfikatora instruktora.',
        invalid: 'Nieprawidlowy identyfikator instruktora.',
    });
    const schoolId = parseRequiredUuidQuery(getQuery(event), 'schoolId', {
        required: 'Parametr schoolId jest wymagany.',
        invalid: 'Parametr schoolId musi byc poprawnym UUID.',
    });

    return executeBffAdapter(event, {
        upstream: ({ upstreamBase }) =>
            bffUpstreamInstructorLessonRatingsList(event, upstreamBase, id),
        mock: async () => {
            await requireManagerFromCookie(event);

            return bffMockLessonRatingsList({ schoolId, instructorId: id });
        },
    });
});
