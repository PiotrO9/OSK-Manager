import type { H3Event } from 'h3';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { bffUpstreamMyPaymentsList } from './paymentsBff';

const requestMocks = vi.hoisted(() => ({
    upstreamRequest: vi.fn(),
}));

vi.mock('~~/server/utils/upstream/upstreamRequest', () => ({
    upstreamRequest: requestMocks.upstreamRequest,
}));

describe('bffUpstreamMyPaymentsList', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('preserves payment items and the backend summary', async () => {
        const event = {} as H3Event;
        const data = {
            payments: [
                {
                    id: 'payment-1',
                    courseId: 'course-1',
                    courseName: 'Kategoria B',
                    paymentPlanId: 'plan-1',
                    amount: '900.00',
                    currency: 'PLN',
                    status: 'UNPAID',
                    date: '2026-08-26T00:00:00.000Z',
                    dueDate: '2026-08-26T00:00:00.000Z',
                    paidAt: null,
                    method: null,
                },
            ],
            summary: {
                paidAmount: '0.00',
                unpaidAmount: '900.00',
                overdueAmount: '900.00',
                overdueCount: 1,
                nextDueDate: null,
                currency: 'PLN',
            },
        };

        requestMocks.upstreamRequest.mockResolvedValue({ data });

        await expect(
            bffUpstreamMyPaymentsList(event, 'http://localhost:4000'),
        ).resolves.toEqual({ success: true, data });
    });
});
