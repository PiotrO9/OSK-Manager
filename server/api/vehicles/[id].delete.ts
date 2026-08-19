import { executeBffAdapter } from '~~/server/utils/bff/bffAdapterExecutor';
import { parseRequiredRouterParam } from '~~/server/utils/validation/requestValidation';
import { bffUpstreamVehiclesDelete } from '~~/server/utils/vehicles/vehiclesBff';

export default defineEventHandler(async (event) => {
    const id = parseRequiredRouterParam(
        event,
        'id',
        'Brak identyfikatora pojazdu.',
    );

    return executeBffAdapter(event, {
        upstream: ({ upstreamBase }) =>
            bffUpstreamVehiclesDelete(event, upstreamBase, id),
        mock: async () => {
            await requireManagerFromCookie(event);

            return bffMockVehiclesDelete(id);
        },
    });
});
