import { mockCourseParticipantAssign } from '~~/server/utils/mockStudentsList';
import { bffUpstreamStudentAssignToCourse } from '~~/server/utils/studentsBff';
import { isUuid } from '~~/server/utils/parseVehicleRequestBody';

export default defineEventHandler(async (event) => {
    const userIdRaw = getRouterParam(event, 'userId');
    const studentUserId = userIdRaw?.trim() ?? '';

    if (!studentUserId) {
        throw createError({
            statusCode: 400,
            message: 'Brak identyfikatora kursanta.',
        });
    }

    if (!isUuid(studentUserId)) {
        throw createError({
            statusCode: 400,
            message: 'Nieprawidłowy identyfikator kursanta.',
        });
    }

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

    const upstream = resolveUpstreamBase(event);

    if (upstream) {
        return bffUpstreamStudentAssignToCourse(event, upstream, studentUserId, {
            courseId,
        });
    }

    await requireManagerFromCookie(event);

    const result = mockCourseParticipantAssign({
        studentUserId,
        courseId,
    });

    if (!result.ok) {
        if (result.code === 'COURSE_NOT_FOUND') {
            throw createError({
                statusCode: 404,
                message: 'Course not found',
            });
        }

        if (result.code === 'STUDENT_NOT_IN_SCHOOL') {
            throw createError({
                statusCode: 403,
                message: 'Forbidden',
            });
        }

        throw createError({
            statusCode: 409,
            message: 'Student is already enrolled in this course',
        });
    }

    return {
        success: true,
        data: { participant: result.participant },
    };
});
