import { bffUpstreamInstructorsGetById } from '~~/server/utils/instructors/instructorsBff';
import { bffMockInstructorsGetById } from '~~/server/utils/instructors/instructorsMockBff';
import { parseRequiredUuidRouterParam } from '~~/server/utils/validation/requestValidation';

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

    return bffMockInstructorsGetById(id);
});
