import { isUuid } from '~~/server/utils/requestValidation';
import {
    bffUpstreamLessonRatingsList,
    mockLessonRatingsListPayload,
} from '~~/server/utils/lessonRatingsBff';

export default defineEventHandler(async (event) => {
    const query = getQuery(event);
    const schoolIdRaw = query.schoolId;
    const schoolId =
        typeof schoolIdRaw === 'string'
            ? schoolIdRaw.trim()
            : Array.isArray(schoolIdRaw)
              ? String(schoolIdRaw[0] ?? '').trim()
              : '';
    const instructorIdRaw = query.instructorId;
    const instructorId =
        typeof instructorIdRaw === 'string'
            ? instructorIdRaw.trim()
            : Array.isArray(instructorIdRaw)
              ? String(instructorIdRaw[0] ?? '').trim()
              : '';

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

    if (instructorId && !isUuid(instructorId)) {
        throw createError({
            statusCode: 400,
            message: 'Parametr instructorId musi byc poprawnym UUID.',
        });
    }

    const upstream = resolveUpstreamBase(event);

    if (upstream) {
        return bffUpstreamLessonRatingsList(event, upstream);
    }

    await requireManagerFromCookie(event);

    return {
        success: true,
        data: mockLessonRatingsListPayload(
            schoolId,
            instructorId.length > 0 ? instructorId : undefined,
        ),
    };
});
