import { executeBffAdapter } from '~~/server/utils/bff/bffAdapterExecutor';
import {
    parseRequiredUuidRouterParam,
    parseSchoolIdFromBody,
    readOptionalDateString,
    readTrimmedBodyString,
} from '~~/server/utils/validation/requestValidation';
import { bffUpstreamUpdateStudentPayment } from '~~/server/utils/payments/paymentsBff';

function readUpdateBody(raw: unknown): {
    schoolId: string;
    dueDate?: string | null;
    method?: string | null;
} {
    if (!raw || typeof raw !== 'object') {
        throw createError({
            statusCode: 400,
            message: 'Oczekiwano treści JSON.',
        });
    }

    const body = raw as Record<string, unknown>;
    const schoolId = parseSchoolIdFromBody(body);

    if (!schoolId) {
        throw createError({
            statusCode: 400,
            message: 'Pole schoolId jest wymagane.',
        });
    }

    const update: {
        schoolId: string;
        dueDate?: string | null;
        method?: string | null;
    } = { schoolId };

    if ('dueDate' in body) {
        update.dueDate = readOptionalDateString(body, 'dueDate') ?? null;
    }

    if ('method' in body) {
        update.method = readTrimmedBodyString(body, 'method') || null;
    }

    return update;
}

export default defineEventHandler(async (event) => {
    const studentUserId = parseRequiredUuidRouterParam(event, 'userId', {
        required: 'Brak identyfikatora kursanta.',
        invalid: 'Nieprawidłowy identyfikator kursanta.',
    });
    const paymentId = parseRequiredUuidRouterParam(event, 'paymentId', {
        required: 'Brak identyfikatora płatności.',
        invalid: 'Nieprawidłowy identyfikator płatności.',
    });
    const body = readUpdateBody(await readBody(event));

    return executeBffAdapter(event, {
        upstream: ({ upstreamBase }) =>
            bffUpstreamUpdateStudentPayment(
                event,
                upstreamBase,
                studentUserId,
                paymentId,
                body,
            ),
        mock: async () => {
            await requireManagerFromCookie(event);

            return bffMockUpdateStudentPayment(paymentId, body);
        },
    });
});
