import { bffScheduleMeGet } from '~~/server/utils/schedule/scheduleBff';
import { parseScheduleMeQuery } from '~~/server/utils/schedule/scheduleQueryValidation';
import { requireStudentOrInstructorFromCookie } from '~~/server/utils/auth/requireStudentOrInstructorFromCookie';

export default defineEventHandler(async (event) => {
    const query = getQuery(event);
    const q = parseScheduleMeQuery(query as Record<string, unknown>);
    const params = new URLSearchParams({
        dateFrom: q.dateFrom,
        dateTo: q.dateTo,
    });

    const upstream = resolveUpstreamBase(event);

    if (upstream) {
        return bffScheduleMeGet(event, upstream, params.toString());
    }

    await requireStudentOrInstructorFromCookie(event);

    return {
        success: true,
        data: { items: [] },
    };
});
