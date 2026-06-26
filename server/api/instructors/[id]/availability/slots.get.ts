import { bffSlotsGet } from '~~/server/utils/instructors/availabilityBff';
import { mockGenerateSlots } from '~~/server/utils/instructors/mockSlots';
import { parseRequiredUuidRouterParam } from '~~/server/utils/validation/requestValidation';
import { getValidatedSlotsDateRangeQuery } from '~~/server/utils/instructors/slotsDateRangeValidation';

export default defineEventHandler(async (event) => {
    const id = parseRequiredUuidRouterParam(event, 'id', {
        required: 'Brak identyfikatora instruktora.',
        invalid: 'Nieprawidłowy identyfikator instruktora.',
    });

    const query = getQuery(event);
    const { dateFromRaw, dateToRaw } = getValidatedSlotsDateRangeQuery(query);

    const upstream = resolveUpstreamBase(event);

    if (upstream) {
        return bffSlotsGet(event, upstream, id, dateFromRaw, dateToRaw);
    }

    await requireManagerFromCookie(event);

    return {
        success: true,
        data: {
            slots: mockGenerateSlots(id, dateFromRaw, dateToRaw),
        },
    };
});
