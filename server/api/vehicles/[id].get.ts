import { parseRequiredUuidRouterParam } from '~~/server/utils/validation/requestValidation';
import { bffUpstreamVehiclesGetById } from '~~/server/utils/vehicles/vehiclesBff';

export default defineEventHandler(async (event) => {
    const id = parseRequiredUuidRouterParam(event, 'id', {
        required: 'Brak identyfikatora pojazdu.',
        invalid: 'Nieprawidłowy identyfikator pojazdu.',
    });

    const upstream = resolveUpstreamBase(event);

    if (upstream) {
        return bffUpstreamVehiclesGetById(event, upstream, id);
    }

    await requireManagerFromCookie(event);

    return bffMockVehiclesGetById(id);
});
