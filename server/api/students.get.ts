import { mockCoursesGetById } from '~~/server/utils/mockCoursesList';
import { mockStudentsListPayload } from '~~/server/utils/mockStudentsList';
import {
    isUuid,
    parsePositiveIntQuery,
    parseRequiredUuidQuery,
    readQueryString,
} from '~~/server/utils/requestValidation';
import { bffUpstreamStudentsList } from '~~/server/utils/studentsBff';

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

    const upstream = resolveUpstreamBase(event);

    if (upstream) {
        return bffUpstreamStudentsList(event, upstream, {
            schoolId,
            page,
            limit,
            courseId,
        });
    }

    await requireManagerFromCookie(event);

    if (courseId !== undefined) {
        const course = mockCoursesGetById(courseId);

        if (!course || course.schoolId !== schoolId) {
            throw createError({
                statusCode: 404,
                message: 'Course not found',
            });
        }
    }

    return {
        success: true,
        data: mockStudentsListPayload(schoolId, page, limit, courseId),
    };
});
