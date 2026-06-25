import { bffUpstreamStudentPaymentsList } from '~~/server/utils/paymentsBff';
import {
    parseRequiredUuidQuery,
    parseRequiredUuidRouterParam,
} from '~~/server/utils/requestValidation';

function mockStudentPaymentsPayload() {
    return {
        payments: [
            {
                id: '11111111-1111-4111-8111-111111111111',
                courseId: '22222222-2222-4222-8222-222222222222',
                courseName: 'Kurs podstawowy kategorii B',
                paymentPlanId: '33333333-3333-4333-8333-333333333333',
                amount: '1200.00',
                currency: 'PLN',
                status: 'PAID',
                date: '2026-06-20T12:00:00.000Z',
                dueDate: '2026-06-10T00:00:00.000Z',
                paidAt: '2026-06-20T12:00:00.000Z',
            },
            {
                id: '44444444-4444-4444-8444-444444444444',
                courseId: '22222222-2222-4222-8222-222222222222',
                courseName: 'Kurs podstawowy kategorii B',
                paymentPlanId: '33333333-3333-4333-8333-333333333333',
                amount: '500.00',
                currency: 'PLN',
                status: 'UNPAID',
                date: '2026-07-10T00:00:00.000Z',
                dueDate: '2026-07-10T00:00:00.000Z',
                paidAt: null,
            },
        ],
    };
}

export default defineEventHandler(async (event) => {
    const studentUserId = parseRequiredUuidRouterParam(event, 'userId', {
        required: 'Brak identyfikatora kursanta.',
        invalid: 'Nieprawidłowy identyfikator kursanta.',
    });

    const rawQuery = getQuery(event);
    const schoolId = parseRequiredUuidQuery(rawQuery, 'schoolId', {
        required: 'Parametr schoolId jest wymagany.',
        invalid: 'Parametr schoolId musi być poprawnym identyfikatorem UUID.',
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

    return {
        success: true,
        data: mockStudentPaymentsPayload(),
    };
});
