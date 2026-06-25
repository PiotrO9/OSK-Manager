import {
    bffUpstreamInstructorLessonRatingsList,
    mockLessonRatingsListPayload,
} from '~~/server/utils/lessonRatingsBff';
import {
    parseRequiredUuidQuery,
    parseRequiredUuidRouterParam,
} from '~~/server/utils/requestValidation';

export default defineEventHandler(async (event) => {
    const id = parseRequiredUuidRouterParam(event, 'id', {
        required: 'Brak identyfikatora instruktora.',
        invalid: 'Nieprawidlowy identyfikator instruktora.',
    });
    const query = getQuery(event);
    const schoolId = parseRequiredUuidQuery(query, 'schoolId', {
        required: 'Parametr schoolId jest wymagany.',
        invalid: 'Parametr schoolId musi byc poprawnym UUID.',
    });

    const upstream = resolveUpstreamBase(event);

    if (upstream) {
        return bffUpstreamInstructorLessonRatingsList(event, upstream, id);
    }

    await requireManagerFromCookie(event);

    return {
        success: true,
        data: mockLessonRatingsListPayload(schoolId, id),
    };
});
