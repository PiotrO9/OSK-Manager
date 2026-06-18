import { isUuid } from '~~/server/utils/parseVehicleRequestBody';
import {
    bffUpstreamInstructorLessonRatingsList,
    mockLessonRatingsListPayload,
} from '~~/server/utils/lessonRatingsBff';

export default defineEventHandler(async (event) => {
    const idRaw = getRouterParam(event, 'id');
    const id = idRaw?.trim() ?? '';
    const query = getQuery(event);
    const schoolIdRaw = query.schoolId;
    const schoolId =
        typeof schoolIdRaw === 'string'
            ? schoolIdRaw.trim()
            : Array.isArray(schoolIdRaw)
              ? String(schoolIdRaw[0] ?? '').trim()
              : '';

    if (!id) {
        throw createError({
            statusCode: 400,
            message: 'Brak identyfikatora instruktora.',
        });
    }

    if (!isUuid(id)) {
        throw createError({
            statusCode: 400,
            message: 'Nieprawidlowy identyfikator instruktora.',
        });
    }

    if (!schoolId) {
        throw createError({
            statusCode: 400,
            message: 'Parametr schoolId jest wymagany.',
        });
    }

    if (!isUuid(schoolId)) {
        throw createError({
            statusCode: 400,
            message: 'Parametr schoolId musi byc poprawnym UUID.',
        });
    }

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
