import { bffUpstreamInstructorLessonRatingsList } from '~~/server/utils/lessonRatingsBff';
import { bffMockLessonRatingsList } from '~~/server/utils/ratingsMockBff';
import {
    parseRequiredUuidQuery,
    parseRequiredUuidRouterParam,
} from '~~/server/utils/requestValidation';

export default defineEventHandler(async (event) => {
    const id = parseRequiredUuidRouterParam(event, 'id', {
        required: 'Brak identyfikatora instruktora.',
        invalid: 'Nieprawidlowy identyfikator instruktora.',
    });
    const schoolId = parseRequiredUuidQuery(getQuery(event), 'schoolId', {
        required: 'Parametr schoolId jest wymagany.',
        invalid: 'Parametr schoolId musi byc poprawnym UUID.',
    });
    const upstream = resolveUpstreamBase(event);

    if (upstream) {
        return bffUpstreamInstructorLessonRatingsList(event, upstream, id);
    }

    await requireManagerFromCookie(event);

    return bffMockLessonRatingsList({ schoolId, instructorId: id });
});
