import {
    parseRequiredUuidRouterParam,
    parseSchoolIdFromBody,
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
    const schoolId = parseSchoolIdFromBody(rawBody);

    if (!schoolId) {
        throw createError({
            statusCode: 400,
            message: 'Pole schoolId jest wymagane.',
        });
    }

    const body = { schoolId };
    const upstream = resolveUpstreamBase(event);

    if (upstream) {
        return bffUpstreamMarkStudentPaymentUnpaid(
            event,
            upstream,
            studentUserId,
            paymentId,
            body,
        );
    }

    await requireManagerFromCookie(event);

    return bffMockMarkStudentPaymentUnpaid(paymentId);
});
