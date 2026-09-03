import { executeBffAdapter } from '~~/server/utils/bff/bffAdapterExecutor';
import { isUuid } from '~~/server/utils/validation/requestValidation';
import { bffAggregateSchoolSchedule } from '~~/server/utils/schedule/schoolScheduleBff';
import type { ScheduleItemResponse } from '~~/server/utils/schedule/scheduleBff';
import { getValidatedSlotsDateRangeQuery } from '~~/server/utils/instructors/slotsDateRangeValidation';

interface SchoolScheduleResponse {
    success: true;
    data: { items: ScheduleItemResponse[] };
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
    const { dateFromRaw, dateToRaw } = getValidatedSlotsDateRangeQuery(
        query as Record<string, unknown>,
    );

    return executeBffAdapter<SchoolScheduleResponse>(event, {
        upstream: ({ upstreamBase }) =>
            bffAggregateSchoolSchedule(
                event,
                upstreamBase,
                id,
                dateFromRaw,
                dateToRaw,
            ),
        mock: async () => {
            await requireManagerFromCookie(event);

            return {
                success: true,
                data: { items: [] },
            };
        },
    });
});
