import { executeBffAdapter } from '~~/server/utils/bff/bffAdapterExecutor';
import {
    isUuid,
    parsePositiveIntQuery,
    parseRequiredUuidQuery,
    readQueryString,
} from '~~/server/utils/validation/requestValidation';
import { bffUpstreamStudentsList } from '~~/server/utils/students/studentsBff';

export default defineEventHandler(async (event) => {
    const rawQuery = getQuery(event);
    const schoolId = parseRequiredUuidQuery(rawQuery, 'schoolId', {
        required: 'Parametr schoolId jest wymagany.',
        invalid: 'Parametr schoolId musi być poprawnym identyfikatorem UUID.',
    });

    const page = parsePositiveIntQuery(rawQuery.page, 1);

    if (page < 1) {
        throw createError({
            statusCode: 400,
            message: 'Parametr page musi być liczbą całkowitą ≥ 1.',
        });
    }

    const limit = parsePositiveIntQuery(rawQuery.limit, 20);

    if (limit < 1 || limit > 100) {
        throw createError({
            statusCode: 400,
            message: 'Parametr limit musi być w zakresie 1–100.',
        });
    }

    const courseIdRaw = readQueryString(rawQuery.courseId);
    const courseId = courseIdRaw.length > 0 ? courseIdRaw : undefined;

    if (courseId !== undefined && !isUuid(courseId)) {
        throw createError({
            statusCode: 400,
            message:
                'Parametr courseId musi być poprawnym identyfikatorem UUID.',
        });
    }

    return executeBffAdapter(event, {
        upstream: ({ upstreamBase }) =>
            bffUpstreamStudentsList(event, upstreamBase, {
                schoolId,
                page,
                limit,
                courseId,
            }),
        mock: async () => {
            await requireManagerFromCookie(event);

            return bffMockStudentsList({ schoolId, page, limit, courseId });
        },
    });
});
