import { bffUpstreamCoursesPatch } from '~~/server/utils/coursesBff';
import {
    mockCoursesGetById,
    mockCoursesPatchInstructor,
} from '~~/server/utils/mockCoursesList';
import { parseCoursePatchInstructorBody } from '~~/server/utils/parseCoursePatchBody';
import { isUuid } from '~~/server/utils/parseVehicleRequestBody';

export default defineEventHandler(async (event) => {
    const idRaw = getRouterParam(event, 'id');
    const id = idRaw?.trim() ?? '';

    if (!id) {
        throw createError({
            statusCode: 400,
            message: 'Brak identyfikatora kursu.',
        });
    }

    if (!isUuid(id)) {
        throw createError({
            statusCode: 400,
            message: 'Nieprawidłowy identyfikator kursu.',
        });
    }

    const body = await readBody(event);
    const parsed = parseCoursePatchInstructorBody(body);

    if ('error' in parsed) {
        throw createError({
            statusCode: 400,
            message: parsed.error,
        });
    }

    const { record } = parsed;

    const upstream = resolveUpstreamBase(event);

    if (upstream) {
        return bffUpstreamCoursesPatch(event, upstream, id, record);
    }

    await requireManagerFromCookie(event);

    if (!('instructorId' in record)) {
        const course = mockCoursesGetById(id);

        if (!course) {
            throw createError({
                statusCode: 404,
                message: 'Kurs nie istnieje.',
            });
        }

        return {
            success: true,
            data: { course },
        };
    }

    const instructorProfileId = record.instructorId as string | null;

    const patchResult = mockCoursesPatchInstructor(id, instructorProfileId);

    if (patchResult.outcome === 'course_not_found') {
        throw createError({
            statusCode: 404,
            message: 'Kurs nie istnieje.',
        });
    }

    if (patchResult.outcome === 'instructor_not_in_school') {
        throw createError({
            statusCode: 400,
            message:
                'Wybrany instruktor nie jest przypisany do szkoły tego kursu.',
        });
    }

    return {
        success: true,
        data: { course: patchResult.course },
    };
});
