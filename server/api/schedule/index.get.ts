import { bffScheduleManagerGet } from '~~/server/utils/scheduleBff';
import { parseScheduleManagerQuery } from '~~/server/utils/scheduleQueryValidation';

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

    const upstream = resolveUpstreamBase(event);

    if (upstream) {
        return bffScheduleManagerGet(event, upstream, params.toString());
    }

    await requireManagerFromCookie(event);

    return {
        success: true,
        data: { items: [] },
    };
});
