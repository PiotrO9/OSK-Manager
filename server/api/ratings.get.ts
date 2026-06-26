import { bffUpstreamLessonRatingsList } from '~~/server/utils/lessonRatingsBff';
import { bffMockLessonRatingsList } from '~~/server/utils/ratingsMockBff';
import { isUuid } from '~~/server/utils/requestValidation';

function readQueryString(raw: unknown): string {
    if (typeof raw === 'string') {
        return raw.trim();
    }

    if (Array.isArray(raw)) {
        return String(raw[0] ?? '').trim();
    }

    return '';
}

export default defineEventHandler(async (event) => {
    const query = getQuery(event);
    const schoolId = readQueryString(query.schoolId);
    const instructorId = readQueryString(query.instructorId);

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

    return bffMockLessonRatingsList({
        schoolId,
        ...(instructorId ? { instructorId } : {}),
    });
});
