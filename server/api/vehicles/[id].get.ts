import { executeBffAdapter } from '~~/server/utils/bff/bffAdapterExecutor';
import { parseRequiredUuidRouterParam } from '~~/server/utils/validation/requestValidation';
import { bffUpstreamVehiclesGetById } from '~~/server/utils/vehicles/vehiclesBff';

export default defineEventHandler(async (event) => {
    const id = parseRequiredUuidRouterParam(event, 'id', {
        required: 'Brak identyfikatora pojazdu.',
        invalid: 'Nieprawidłowy identyfikator pojazdu.',
    });

    return executeBffAdapter(event, {
        upstream: ({ upstreamBase }) =>
            bffUpstreamVehiclesGetById(event, upstreamBase, id),
        mock: async () => {
            await requireManagerFromCookie(event);

            return bffMockVehiclesGetById(id);
        },
    });
});
