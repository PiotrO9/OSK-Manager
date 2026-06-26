import { bffLessonRatingGet } from '~~/server/utils/lessons/lessonsBff';
import { parseRequiredUuidRouterParam } from '~~/server/utils/validation/requestValidation';
import { requireStudentFromCookie } from '~~/server/utils/auth/requireStudentFromCookie';

export default defineEventHandler(async (event) => {
    const lessonId = parseRequiredUuidRouterParam(event, 'lessonId', {
        required: 'Nieprawidlowy identyfikator lekcji.',
        invalid: 'Nieprawidlowy identyfikator lekcji.',
    });

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
