import { executeBffAdapter } from '~~/server/utils/bff/bffAdapterExecutor';
import {
    isUuid,
    parseRequiredUuidRouterParam,
    parseSchoolIdFromBody,
    readOptionalDateString,
    readTrimmedBodyString,
} from '~~/server/utils/validation/requestValidation';
import { bffUpstreamCreateStudentPayment } from '~~/server/utils/payments/paymentsBff';

function readPaymentBody(raw: unknown): {
    schoolId: string;
    paymentPlanId: string;
    amount: string;
    dueDate: string | null;
    method: string | null;
} {
    if (!raw || typeof raw !== 'object') {
        throw createError({
            statusCode: 400,
            message: 'Oczekiwano treści JSON.',
        });
    }

    const body = raw as Record<string, unknown>;
    const schoolId = parseSchoolIdFromBody(body);
    const paymentPlanId = readTrimmedBodyString(body, 'paymentPlanId');
    const amount = readTrimmedBodyString(body, 'amount').replace(',', '.');
    const dueDate = readOptionalDateString(body, 'dueDate') ?? null;
    const method = readTrimmedBodyString(body, 'method') || null;

    if (!schoolId) {
        throw createError({
            statusCode: 400,
            message: 'Pole schoolId jest wymagane.',
        });
    }

    if (!isUuid(paymentPlanId)) {
        throw createError({
            statusCode: 400,
            message: 'Nieprawidłowy identyfikator planu płatności.',
        });
    }

    if (!/^\d+(\.\d{1,2})?$/.test(amount) || Number(amount) <= 0) {
        throw createError({
            statusCode: 400,
            message:
                'Kwota musi być dodatnią wartością z maksymalnie dwoma miejscami po przecinku.',
        });
    }

    return { schoolId, paymentPlanId, amount, dueDate, method };
}

export default defineEventHandler(async (event) => {
    const studentUserId = parseRequiredUuidRouterParam(event, 'userId', {
        required: 'Brak identyfikatora kursanta.',
        invalid: 'Nieprawidłowy identyfikator kursanta.',
    });
    const body = readPaymentBody(await readBody(event));

    return executeBffAdapter(event, {
        upstream: ({ upstreamBase }) =>
            bffUpstreamCreateStudentPayment(
                event,
                upstreamBase,
                studentUserId,
                body,
            ),
        mock: async () => {
            await requireManagerFromCookie(event);

            return bffMockCreateStudentPayment(body);
        },
    });
});
