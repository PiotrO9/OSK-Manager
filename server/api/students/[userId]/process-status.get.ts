import { executeBffAdapter } from '~~/server/utils/bff/bffAdapterExecutor';
import {
    parseOptionalUuidQuery,
    parseRequiredUuidRouterParam,
} from '~~/server/utils/validation/requestValidation';
import { bffUpstreamStudentProcessStatus } from '~~/server/utils/students/studentsBff';

export default defineEventHandler(async (event) => {
    const studentUserId = parseRequiredUuidRouterParam(event, 'userId', {
        required: 'Brak identyfikatora kursanta.',
        invalid: 'Nieprawidłowy identyfikator kursanta.',
    });

    const rawQuery = getQuery(event);
    const schoolId = parseOptionalUuidQuery(rawQuery, 'schoolId');

    return executeBffAdapter(event, {
        upstream: ({ upstreamBase }) =>
            bffUpstreamStudentProcessStatus(
                event,
                upstreamBase,
                studentUserId,
                schoolId,
            ),
        mock: async () => {
            await requireManagerFromCookie(event);

            return bffMockStudentProcessStatus(studentUserId, schoolId);
        },
    });
});
