import { bffUpstreamInstructorsGetById } from '~~/server/utils/instructorsBff';
import { isUuid } from '~~/server/utils/parseVehicleRequestBody';
import { mockInstructorsGetById } from '~~/server/utils/mockInstructorsList';

export default defineEventHandler(async (event) => {
    const idRaw = getRouterParam(event, 'id');
    const id = idRaw?.trim() ?? '';

    if (!id) {
        throw createError({
            statusCode: 400,
            message: 'Brak identyfikatora instruktora.',
        });
    }

    if (!isUuid(id)) {
        throw createError({
            statusCode: 400,
            message: 'Nieprawidłowy identyfikator instruktora.',
        });
    }

    const upstream = resolveUpstreamBase(event);

    if (upstream) {
        return bffUpstreamInstructorsGetById(event, upstream, id);
    }

    await requireManagerFromCookie(event);

    const detail = mockInstructorsGetById(id);

    if (!detail) {
        throw createError({
            statusCode: 404,
            message: 'Instruktor nie istnieje.',
        });
    }

    return {
        success: true,
        data: detail,
    };
});
