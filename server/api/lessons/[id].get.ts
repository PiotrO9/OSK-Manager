import { executeBffAdapter } from '~~/server/utils/bff/bffAdapterExecutor';
import { bffLessonsGet } from '~~/server/utils/lessons/lessonsBff';
import { parseRequiredUuidRouterParam } from '~~/server/utils/validation/requestValidation';

export default defineEventHandler(async (event) => {
    const lessonId = parseRequiredUuidRouterParam(event, 'id', {
        required: 'Brak identyfikatora lekcji.',
        invalid: 'Nieprawidłowy identyfikator lekcji.',
    });

    return executeBffAdapter(event, {
        upstream: ({ upstreamBase }) =>
            bffLessonsGet(event, upstreamBase, lessonId),
        mock: () => {
            throw createError({
                statusCode: 404,
                statusMessage: 'Lekcja nie istnieje (tryb demo).',
            });
        },
    });
});
