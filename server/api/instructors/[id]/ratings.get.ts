import { mockInstructorsGetById } from '~~/server/utils/instructors/mockInstructorsList';
import { executeBffAdapter } from '~~/server/utils/bff/bffAdapterExecutor';
import { bffUpstreamInstructorLessonRatingsList } from '~~/server/utils/ratings/lessonRatingsBff';
import { bffMockLessonRatingsList } from '~~/server/utils/ratings/ratingsMockBff';
import {
    parseOptionalUuidQuery,
    parseRequiredUuidRouterParam,
} from '~~/server/utils/validation/requestValidation';

export default defineEventHandler(async (event) => {
    const id = parseRequiredUuidRouterParam(event, 'id', {
        required: 'Brak identyfikatora instruktora.',
        invalid: 'Nieprawidlowy identyfikator instruktora.',
    });
    const schoolId = parseOptionalUuidQuery(getQuery(event), 'schoolId');

    return executeBffAdapter(event, {
        upstream: ({ upstreamBase }) =>
            bffUpstreamInstructorLessonRatingsList(event, upstreamBase, id),
        mock: async () => {
            await requireManagerFromCookie(event);

            const resolvedSchoolId =
                schoolId ?? mockInstructorsGetById(id)?.schoolId;

            if (!resolvedSchoolId)
                throw createError({
                    statusCode: 404,
                    message: 'Instruktor nie istnieje.',
                });

            return bffMockLessonRatingsList(event, {
                schoolId: resolvedSchoolId,
                instructorId: id,
            });
        },
    });
});
