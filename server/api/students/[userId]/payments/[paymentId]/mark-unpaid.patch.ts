import { executeBffAdapter } from '~~/server/utils/bff/bffAdapterExecutor';
import {
    parseRequiredUuidRouterParam,
    parseOptionalSchoolIdFromBody,
} from '~~/server/utils/validation/requestValidation';
import { bffUpstreamMarkStudentPaymentUnpaid } from '~~/server/utils/payments/paymentsBff';

export default defineEventHandler(async (event) => {
    const studentUserId = parseRequiredUuidRouterParam(event, 'userId', {
        required: 'Brak identyfikatora kursanta.',
        invalid: 'Nieprawidłowy identyfikator kursanta.',
    });
    const paymentId = parseRequiredUuidRouterParam(event, 'paymentId', {
        required: 'Brak identyfikatora płatności.',
        invalid: 'Nieprawidłowy identyfikator płatności.',
    });
    const rawBody = await readBody(event);
    const schoolId = parseOptionalSchoolIdFromBody(rawBody);

    const body = { schoolId };

    return executeBffAdapter(event, {
        upstream: ({ upstreamBase }) =>
            bffUpstreamMarkStudentPaymentUnpaid(
                event,
                upstreamBase,
                studentUserId,
                paymentId,
                body,
            ),
        mock: async () => {
            await requireManagerFromCookie(event);

            return bffMockMarkStudentPaymentUnpaid(paymentId);
        },
    });
});
