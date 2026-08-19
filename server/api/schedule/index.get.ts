import { executeBffAdapter } from '~~/server/utils/bff/bffAdapterExecutor';
import { bffScheduleManagerGet } from '~~/server/utils/schedule/scheduleBff';
import { parseScheduleManagerQuery } from '~~/server/utils/schedule/scheduleQueryValidation';

export default defineEventHandler(async (event) => {
    const query = getQuery(event);
    const q = parseScheduleManagerQuery(query as Record<string, unknown>);

    const params = new URLSearchParams({
        dateFrom: q.dateFrom,
        dateTo: q.dateTo,
    });

    if (q.instructorId !== undefined) {
        params.set('instructorId', q.instructorId);
    } else {
        params.set('studentId', q.studentId!);
        params.set('schoolId', q.schoolId!);
    }

    return executeBffAdapter(event, {
        upstream: ({ upstreamBase }) =>
            bffScheduleManagerGet(event, upstreamBase, params.toString()),
        mock: async () => {
            await requireManagerFromCookie(event);

            return {
                success: true,
                data: { items: [] },
            };
        },
    });
});
