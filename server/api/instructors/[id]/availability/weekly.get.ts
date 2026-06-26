import { bffWeeklyGet } from '~~/server/utils/instructors/availabilityBff';
import { mockAvailabilityGetWeekly } from '~~/server/utils/instructors/mockAvailabilityStore';
import { parseRequiredUuidRouterParam } from '~~/server/utils/validation/requestValidation';

export default defineEventHandler(async (event) => {
    const id = parseRequiredUuidRouterParam(event, 'id', {
        required: 'Brak identyfikatora instruktora.',
        invalid: 'Nieprawidłowy identyfikator instruktora.',
    });

    const upstream = resolveUpstreamBase(event);

    if (upstream) {
        return bffWeeklyGet(event, upstream, id);
    }

    await requireManagerFromCookie(event);

    return {
        success: true,
        data: {
            weekly: mockAvailabilityGetWeekly(id),
        },
    };
});
