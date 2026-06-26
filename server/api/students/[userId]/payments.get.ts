import { bffUpstreamStudentPaymentsList } from '~~/server/utils/payments/paymentsBff';
import {
    parseRequiredUuidQuery,
    parseRequiredUuidRouterParam,
} from '~~/server/utils/validation/requestValidation';

export default defineEventHandler(async (event) => {
    const studentUserId = parseRequiredUuidRouterParam(event, 'userId', {
        required: 'Brak identyfikatora kursanta.',
        invalid: 'NieprawidĹ‚owy identyfikator kursanta.',
    });

    const rawQuery = getQuery(event);
    const schoolId = parseRequiredUuidQuery(rawQuery, 'schoolId', {
        required: 'Parametr schoolId jest wymagany.',
        invalid: 'Parametr schoolId musi byÄ‡ poprawnym identyfikatorem UUID.',
    });

    const upstream = resolveUpstreamBase(event);

    if (upstream) {
        return bffUpstreamStudentPaymentsList(
            event,
            upstream,
            studentUserId,
            schoolId,
        );
    }

    await requireManagerFromCookie(event);

    return bffMockStudentPaymentsList();
});
