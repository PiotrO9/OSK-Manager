import { bffUpstreamInstructorsDelete } from '~~/server/utils/instructorsBff';
import { mockInstructorsDeleteById } from '~~/server/utils/mockInstructorsList';
import { parseRequiredUuidRouterParam } from '~~/server/utils/requestValidation';

export default defineEventHandler(async (event) => {
    const id = parseRequiredUuidRouterParam(event, 'id', {
        required: 'Brak identyfikatora instruktora.',
        invalid: 'Nieprawidłowy identyfikator instruktora.',
    });

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
