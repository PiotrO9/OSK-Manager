import { bffUpstreamCoursesGetById } from '~~/server/utils/coursesBff';
import { mockCoursesGetById } from '~~/server/utils/mockCoursesList';
import { parseRequiredUuidRouterParam } from '~~/server/utils/requestValidation';

export default defineEventHandler(async (event) => {
    const id = parseRequiredUuidRouterParam(event, 'id', {
        required: 'Brak identyfikatora kursu.',
        invalid: 'Nieprawidłowy identyfikator kursu.',
    });

    const upstream = resolveUpstreamBase(event);

    if (upstream) {
        return bffUpstreamCoursesGetById(event, upstream, id);
    }

    await requireManagerFromCookie(event);

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
});
