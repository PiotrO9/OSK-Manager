import { executeBffAdapter } from '~~/server/utils/bff/bffAdapterExecutor';
import {
    parseRequiredUuidRouterParam,
    parseSchoolIdFromBody,
} from '~~/server/utils/validation/requestValidation';
import { bffUpstreamMarkStudentPaymentPaid } from '~~/server/utils/payments/paymentsBff';

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
    const schoolId = parseSchoolIdFromBody(rawBody);

    if (!schoolId) {
        throw createError({
            statusCode: 400,
            message: 'Pole schoolId jest wymagane.',
        });
    }

    const body = { schoolId };

    return executeBffAdapter(event, {
        upstream: ({ upstreamBase }) =>
            bffUpstreamMarkStudentPaymentPaid(
                event,
                upstreamBase,
                studentUserId,
                paymentId,
                body,
            ),
        mock: async () => {
            await requireManagerFromCookie(event);

            return bffMockMarkStudentPaymentPaid(paymentId);
        },
    });
});
