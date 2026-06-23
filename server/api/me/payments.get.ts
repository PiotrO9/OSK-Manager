import { jwtVerify } from 'jose';
import { bffUpstreamMyPaymentsList } from '~~/server/utils/paymentsBff';

const SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'your-secret-key-change-in-production',
);

function mockMyPaymentsPayload(role: string) {
    if (role.trim().toUpperCase() !== 'STUDENT') {
        return { payments: [] };
    }

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
    const upstream = resolveUpstreamBase(event);

    if (upstream) {
        return bffUpstreamMyPaymentsList(event, upstream);
    }

    const accessToken = getCookie(event, 'access_token');

    if (!accessToken) {
        throw createError({
            statusCode: 401,
            message: 'Brak tokena dost?pu',
        });
    }

    try {
        const { payload } = await jwtVerify(accessToken, SECRET);
        const role = String(payload.role ?? '');

        return {
            success: true,
            data: mockMyPaymentsPayload(role),
        };
    } catch {
        throw createError({
            statusCode: 401,
            message: 'Nieprawid?owy lub wygas?y token',
        });
    }
});
