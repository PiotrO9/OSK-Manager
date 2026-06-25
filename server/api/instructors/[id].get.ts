import { bffUpstreamInstructorsGetById } from '~~/server/utils/instructorsBff';
import { mockInstructorsGetById } from '~~/server/utils/mockInstructorsList';
import { parseRequiredUuidRouterParam } from '~~/server/utils/requestValidation';

export default defineEventHandler(async (event) => {
    const id = parseRequiredUuidRouterParam(event, 'id', {
        required: 'Brak identyfikatora instruktora.',
        invalid: 'Nieprawidłowy identyfikator instruktora.',
    });

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
