import { bffUpstreamCoursesGetById } from '~~/server/utils/coursesBff';
import { isUuid } from '~~/server/utils/parseVehicleRequestBody';
import { mockCoursesGetById } from '~~/server/utils/mockCoursesList';

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
