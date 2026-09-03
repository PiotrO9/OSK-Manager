import { executeBffAdapter } from '~~/server/utils/bff/bffAdapterExecutor';
import {
    bffScheduleMeGet,
    type ScheduleItemResponse,
} from '~~/server/utils/schedule/scheduleBff';
import { parseScheduleMeQuery } from '~~/server/utils/schedule/scheduleQueryValidation';
import { requireStudentOrInstructorFromCookie } from '~~/server/utils/auth/requireStudentOrInstructorFromCookie';

interface ScheduleResponse {
    success: true;
    data: { items: ScheduleItemResponse[] };
}

export default defineEventHandler(async (event) => {
    const query = getQuery(event);
    const q = parseScheduleMeQuery(query as Record<string, unknown>);
    const params = new URLSearchParams({
        dateFrom: q.dateFrom,
        dateTo: q.dateTo,
    });

    return executeBffAdapter<ScheduleResponse>(event, {
        upstream: ({ upstreamBase }) =>
            bffScheduleMeGet(event, upstreamBase, params.toString()),
        mock: async () => {
            await requireStudentOrInstructorFromCookie(event);

            return {
                success: true,
                data: { items: [] },
            };
        },
    });
});
