import { executeBffAdapter } from '~~/server/utils/bff/bffAdapterExecutor';
import { bffUpstreamStudentPaymentsList } from '~~/server/utils/payments/paymentsBff';
import {
    parseOptionalUuidQuery,
    parseRequiredUuidRouterParam,
} from '~~/server/utils/validation/requestValidation';

export default defineEventHandler(async (event) => {
    const studentUserId = parseRequiredUuidRouterParam(event, 'userId', {
        required: 'Brak identyfikatora kursanta.',
        invalid: 'Nieprawidłowy identyfikator kursanta.',
    });

    const rawQuery = getQuery(event);
    const schoolId = parseOptionalUuidQuery(rawQuery, 'schoolId');

    return executeBffAdapter(event, {
        upstream: ({ upstreamBase }) =>
            bffUpstreamStudentPaymentsList(
                event,
                upstreamBase,
                studentUserId,
                schoolId,
            ),
        mock: async () => {
            await requireManagerFromCookie(event);

            return bffMockStudentPaymentsList();
        },
    });
});
