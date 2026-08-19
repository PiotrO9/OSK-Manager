import { executeBffAdapter } from '~~/server/utils/bff/bffAdapterExecutor';
import { bffUpstreamInstructorsGetById } from '~~/server/utils/instructors/instructorsBff';
import { bffMockInstructorsGetById } from '~~/server/utils/instructors/instructorsMockBff';
import { parseRequiredUuidRouterParam } from '~~/server/utils/validation/requestValidation';

export default defineEventHandler(async (event) => {
    const id = parseRequiredUuidRouterParam(event, 'id', {
        required: 'Brak identyfikatora instruktora.',
        invalid: 'Nieprawidłowy identyfikator instruktora.',
    });

    return executeBffAdapter(event, {
        upstream: ({ upstreamBase }) =>
            bffUpstreamInstructorsGetById(event, upstreamBase, id),
        mock: async () => {
            await requireManagerFromCookie(event);

            return bffMockInstructorsGetById(id);
        },
    });
});
