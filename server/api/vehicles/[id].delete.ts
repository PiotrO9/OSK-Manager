import { parseRequiredRouterParam } from '~~/server/utils/requestValidation';
import { bffUpstreamVehiclesDelete } from '~~/server/utils/vehiclesBff';

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
