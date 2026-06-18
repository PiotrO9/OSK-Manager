import { bffLessonRatingGet } from '~~/server/utils/lessonsBff';
import { isUuid } from '~~/server/utils/parseVehicleRequestBody';
import { requireStudentFromCookie } from '~~/server/utils/requireStudentFromCookie';

export default defineEventHandler(async (event) => {
    const lessonId = getRouterParam(event, 'lessonId')?.trim() ?? '';

    if (!lessonId || !isUuid(lessonId)) {
        throw createError({
            statusCode: 400,
            message: 'Nieprawidlowy identyfikator lekcji.',
        });
    }

    const upstream = resolveUpstreamBase(event);

    if (upstream) {
        return bffLessonRatingGet(event, upstream, lessonId);
    }

    await requireStudentFromCookie(event);

    return {
        success: true,
        data: {
            rating: null,
        },
    };
});
