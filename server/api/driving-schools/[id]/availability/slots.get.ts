import { executeBffAdapter } from '~~/server/utils/bff/bffAdapterExecutor';
import { isUuid } from '~~/server/utils/validation/requestValidation';
import {
    bffSchoolSlotsGet,
    type SchoolSlotsEntryResponse,
} from '~~/server/utils/instructors/availabilityBff';
import { applyMockSchoolSlotFilters } from '~~/server/utils/schedule/mockSchoolSlotFilters';
import { mockGenerateSchoolSlots } from '~~/server/utils/instructors/mockSlots';
import {
    buildQueryStringFromGetQuery,
    getValidatedSlotsDateRangeQuery,
} from '~~/server/utils/instructors/slotsDateRangeValidation';

interface SchoolSlotsResponse {
    success: true;
    data: { slots: SchoolSlotsEntryResponse[]; total: number };
}

export default defineEventHandler(async (event) => {
    const idRaw = getRouterParam(event, 'id');
    const id = idRaw?.trim() ?? '';

    if (!id) {
        throw createError({
            statusCode: 400,
            message: 'Brak identyfikatora szkoły.',
        });
    }

    if (!isUuid(id)) {
        throw createError({
            statusCode: 400,
            message: 'Nieprawidłowy identyfikator szkoły.',
        });
    }

    const query = getQuery(event);
    const { dateFromRaw, dateToRaw } = getValidatedSlotsDateRangeQuery(query);

    return executeBffAdapter<SchoolSlotsResponse>(event, {
        upstream: ({ upstreamBase }) => {
            const queryString = buildQueryStringFromGetQuery(query);

            return bffSchoolSlotsGet(event, upstreamBase, id, queryString);
        },
        mock: async () => {
            await requireManagerFromCookie(event);

            const { slots: rawSlots } = mockGenerateSchoolSlots(
                id,
                dateFromRaw,
                dateToRaw,
            );

            const { slots, total } = applyMockSchoolSlotFilters(
                rawSlots,
                query,
            );

            return {
                success: true,
                data: {
                    slots,
                    total,
                },
            };
        },
    });
});
