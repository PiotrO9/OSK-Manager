import { executeBffAdapter } from '~~/server/utils/bff/bffAdapterExecutor';
import { parseRequiredUuidRouterParam } from '~~/server/utils/validation/requestValidation';
import { bffUpstreamStudentDetail } from '~~/server/utils/students/studentsBff';

export default defineEventHandler(async (event) => {
    const studentUserId = parseRequiredUuidRouterParam(event, 'userId', {
        required: 'Brak identyfikatora kursanta.',
        invalid: 'Nieprawidłowy identyfikator kursanta.',
    });

    return executeBffAdapter(event, {
        upstream: ({ upstreamBase }) =>
            bffUpstreamStudentDetail(event, upstreamBase, studentUserId),
        mock: async () => {
            await requireManagerFromCookie(event);

            return bffMockStudentDetail(studentUserId);
        },
    });
});
