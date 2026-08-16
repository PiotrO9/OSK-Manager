import { executeBffAdapter } from '~~/server/utils/bff/bffAdapterExecutor';
import { bffLessonRatingGet } from '~~/server/utils/lessons/lessonsBff';
import { parseRequiredUuidRouterParam } from '~~/server/utils/validation/requestValidation';
import { requireStudentFromCookie } from '~~/server/utils/auth/requireStudentFromCookie';

export default defineEventHandler(async (event) => {
    const lessonId = parseRequiredUuidRouterParam(event, 'lessonId', {
        required: 'Nieprawidlowy identyfikator lekcji.',
        invalid: 'Nieprawidlowy identyfikator lekcji.',
    });

    return executeBffAdapter(event, {
        upstream: ({ upstreamBase }) =>
            bffLessonRatingGet(event, upstreamBase, lessonId),
        mock: async () => {
            await requireStudentFromCookie(event);

            return {
                success: true,
                data: {
                    rating: null,
                },
            };
        },
    });
});
