import { bffUpstreamInstructorsDelete } from '~~/server/utils/instructorsBff';
import { isUuid } from '~~/server/utils/parseVehicleRequestBody';
import { mockInstructorsDeleteById } from '~~/server/utils/mockInstructorsList';

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
        return bffUpstreamInstructorsDelete(event, upstream, id);
    }

    await requireManagerFromCookie(event);

    const deleted = mockInstructorsDeleteById(id);

    if (!deleted) {
        throw createError({
            statusCode: 404,
            message: 'Instruktor nie istnieje.',
        });
    }

    return {
        success: true,
    };
});
