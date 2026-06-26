import { bffUpstreamInstructorsGetById } from '~~/server/utils/instructorsBff';
import { bffMockInstructorsGetById } from '~~/server/utils/instructorsMockBff';
import { parseRequiredUuidRouterParam } from '~~/server/utils/requestValidation';

export default defineEventHandler(async (event) => {
    const id = parseRequiredUuidRouterParam(event, 'id', {
        required: 'Brak identyfikatora instruktora.',
        invalid: 'NieprawidĹ‚owy identyfikator instruktora.',
    });

    const upstream = resolveUpstreamBase(event);

    if (upstream) {
        return bffUpstreamInstructorsGetById(event, upstream, id);
    }

    await requireManagerFromCookie(event);

    return bffMockInstructorsGetById(id);
});
