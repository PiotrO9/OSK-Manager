import { bffUpstreamStudentPaymentsList } from '~~/server/utils/paymentsBff';
import { isUuid } from '~~/server/utils/parseVehicleRequestBody';

function readQueryString(raw: unknown): string {
    if (typeof raw === 'string') {
        return raw.trim();
    }

    if (Array.isArray(raw)) {
        return String(raw[0] ?? '').trim();
    }

    return '';
}

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
    const userIdRaw = getRouterParam(event, 'userId');
    const studentUserId = userIdRaw?.trim() ?? '';

    if (!studentUserId) {
        throw createError({
            statusCode: 400,
            message: 'Brak identyfikatora kursanta.',
        });
    }

    if (!isUuid(studentUserId)) {
        throw createError({
            statusCode: 400,
            message: 'Nieprawidłowy identyfikator kursanta.',
        });
    }

    const rawQuery = getQuery(event);
    const schoolId = readQueryString(rawQuery.schoolId);

    if (!schoolId) {
        throw createError({
            statusCode: 400,
            message: 'Parametr schoolId jest wymagany.',
        });
    }

    if (!isUuid(schoolId)) {
        throw createError({
            statusCode: 400,
            message:
                'Parametr schoolId musi być poprawnym identyfikatorem UUID.',
        });
    }

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
