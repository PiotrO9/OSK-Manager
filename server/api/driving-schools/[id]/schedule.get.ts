import { isUuid } from '~~/server/utils/validation/requestValidation';
import { bffAggregateSchoolSchedule } from '~~/server/utils/schedule/schoolScheduleBff';
import { getValidatedSlotsDateRangeQuery } from '~~/server/utils/instructors/slotsDateRangeValidation';

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

    const upstream = resolveUpstreamBase(event);

    if (upstream) {
        return bffAggregateSchoolSchedule(
            event,
            upstream,
            id,
            dateFromRaw,
            dateToRaw,
        );
    }

    await requireManagerFromCookie(event);

    return {
        success: true,
        data: { items: [] },
    };
});
