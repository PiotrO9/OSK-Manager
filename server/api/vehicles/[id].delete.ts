import { parseRequiredRouterParam } from '~~/server/utils/validation/requestValidation';
import { bffUpstreamVehiclesDelete } from '~~/server/utils/vehicles/vehiclesBff';

export default defineEventHandler(async (event) => {
    const id = parseRequiredRouterParam(
        event,
        'id',
        'Brak identyfikatora pojazdu.',
    );

    const upstream = resolveUpstreamBase(event);

    if (upstream) {
        return bffUpstreamVehiclesDelete(event, upstream, id);
    }

    await requireManagerFromCookie(event);

    return bffMockVehiclesDelete(id);
});
