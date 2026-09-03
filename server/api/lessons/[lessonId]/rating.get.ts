import { executeBffAdapter } from '~~/server/utils/bff/bffAdapterExecutor';
import {
    bffLessonRatingGet,
    type LessonRatingResponse,
} from '~~/server/utils/lessons/lessonsBff';
import { parseRequiredUuidRouterParam } from '~~/server/utils/validation/requestValidation';
import { requireStudentFromCookie } from '~~/server/utils/auth/requireStudentFromCookie';

interface LessonRatingGetResponse {
    success: true;
    data: { rating: LessonRatingResponse | null };
}

export default defineEventHandler(async (event) => {
    const lessonId = parseRequiredUuidRouterParam(event, 'lessonId', {
        required: 'Nieprawidlowy identyfikator lekcji.',
        invalid: 'Nieprawidlowy identyfikator lekcji.',
    });

    return executeBffAdapter<LessonRatingGetResponse>(event, {
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
