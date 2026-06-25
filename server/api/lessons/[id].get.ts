import { bffLessonsGet } from '~~/server/utils/lessonsBff';
import { parseRequiredUuidRouterParam } from '~~/server/utils/requestValidation';

export default defineEventHandler(async (event) => {
    const lessonId = parseRequiredUuidRouterParam(event, 'id', {
        required: 'Brak identyfikatora lekcji.',
        invalid: 'Nieprawidłowy identyfikator lekcji.',
    });

    const upstream = resolveUpstreamBase(event);

    if (upstream) {
        return bffLessonsGet(event, upstream, lessonId);
    }

    throw createError({
        statusCode: 404,
        statusMessage: 'Lekcja nie istnieje (tryb demo).',
    });
});
