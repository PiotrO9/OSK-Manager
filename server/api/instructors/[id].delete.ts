import { executeBffAdapter } from '~~/server/utils/bff/bffAdapterExecutor';
import { bffUpstreamInstructorsDelete } from '~~/server/utils/instructors/instructorsBff';
import { bffMockInstructorsDelete } from '~~/server/utils/instructors/instructorsMockBff';
import { parseRequiredUuidRouterParam } from '~~/server/utils/validation/requestValidation';

export default defineEventHandler(async (event) => {
    const id = parseRequiredUuidRouterParam(event, 'id', {
        required: 'Brak identyfikatora instruktora.',
        invalid: 'Nieprawidłowy identyfikator instruktora.',
    });

    return executeBffAdapter(event, {
        upstream: ({ upstreamBase }) =>
            bffUpstreamInstructorsDelete(event, upstreamBase, id),
        mock: async () => {
            await requireManagerFromCookie(event);

            return bffMockInstructorsDelete(id);
        },
    });
});
