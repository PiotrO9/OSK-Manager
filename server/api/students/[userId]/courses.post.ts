import { executeBffAdapter } from '~~/server/utils/bff/bffAdapterExecutor';
import {
    isUuid,
    parseRequiredUuidRouterParam,
} from '~~/server/utils/validation/requestValidation';
import { bffUpstreamStudentAssignToCourse } from '~~/server/utils/students/studentsBff';

export default defineEventHandler(async (event) => {
    const studentUserId = parseRequiredUuidRouterParam(event, 'userId', {
        required: 'Brak identyfikatora kursanta.',
        invalid: 'Nieprawidłowy identyfikator kursanta.',
    });

    const body = await readBody(event);

    if (body === null || typeof body !== 'object') {
        throw createError({
            statusCode: 400,
            message: 'Oczekiwano treści JSON.',
        });
    }

    const courseRaw = (body as Record<string, unknown>).courseId;

    if (typeof courseRaw !== 'string') {
        throw createError({
            statusCode: 400,
            message: 'Pole courseId jest wymagane.',
        });
    }

    const courseId = courseRaw.trim();

    if (!courseId) {
        throw createError({
            statusCode: 400,
            message: 'Pole courseId jest wymagane.',
        });
    }

    if (!isUuid(courseId)) {
        throw createError({
            statusCode: 400,
            message: 'Nieprawidłowy identyfikator kursu.',
        });
    }

    return executeBffAdapter(event, {
        upstream: ({ upstreamBase }) =>
            bffUpstreamStudentAssignToCourse(
                event,
                upstreamBase,
                studentUserId,
                {
                    courseId,
                },
            ),
        mock: async () => {
            await requireManagerFromCookie(event);

            return bffMockStudentAssignToCourse(studentUserId, courseId);
        },
    });
});
