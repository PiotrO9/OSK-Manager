import { bffLessonsGet } from '~~/server/utils/lessonsBff';
import { isUuid } from '~~/server/utils/parseVehicleRequestBody';

export default defineEventHandler(async (event) => {
    const lessonIdRaw = getRouterParam(event, 'id');
    const lessonId = lessonIdRaw?.trim() ?? '';

    if (!lessonId) {
        throw createError({
            statusCode: 400,
            message: 'Brak identyfikatora lekcji.',
        });
    }

    if (!isUuid(lessonId)) {
        throw createError({
            statusCode: 400,
            message: 'Nieprawidłowy identyfikator lekcji.',
        });
    }

    const upstream = resolveUpstreamBase(event);

    if (upstream) {
        return bffLessonsGet(event, upstream, lessonId);
    }

    throw createError({
        statusCode: 404,
        statusMessage: 'Lekcja nie istnieje (tryb demo).',
    });
});
