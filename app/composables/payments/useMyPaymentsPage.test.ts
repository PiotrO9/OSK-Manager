import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { computed, ref, shallowRef } from 'vue';
import { useMyPaymentsPage } from './useMyPaymentsPage';

const fetchMyPayments = vi.fn();

beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('computed', computed);
    vi.stubGlobal('onMounted', vi.fn());
    vi.stubGlobal('ref', ref);
    vi.stubGlobal('shallowRef', shallowRef);
    vi.stubGlobal('usePaymentsApi', () => ({ fetchMyPayments }));
});

afterEach(() => {
    vi.unstubAllGlobals();
});

describe('useMyPaymentsPage', () => {
    it('uses backend summary and defaults to outstanding payments', async () => {
        fetchMyPayments.mockResolvedValue({
            payments: [
                {
                    id: 'overdue',
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
                {
                    id: 'paid',
                    courseId: 'course-1',
                    courseName: 'Kategoria B',
                    paymentPlanId: 'plan-1',
                    amount: '100.00',
                    currency: 'PLN',
                    status: 'PAID',
                    date: '2026-08-20T00:00:00.000Z',
                    dueDate: '2026-08-20T00:00:00.000Z',
                    paidAt: '2026-08-20T00:00:00.000Z',
                    method: 'Przelew',
                },
            ],
            summary: {
                paidAmount: '100.00',
                unpaidAmount: '900.00',
                overdueAmount: '900.00',
                overdueCount: 1,
                nextDueDate: null,
                currency: 'PLN',
            },
        });
        const page = useMyPaymentsPage();

        await page.loadPayments();

        expect(page.visiblePayments.value.map((item) => item.id)).toEqual([
            'overdue',
        ]);
        expect(page.activeSummary.value).toEqual({
            primary: '900 zł do opłacenia',
            secondary: '1 zaległa · 900 zł',
            tone: 'danger',
        });

        page.activeFilter.value = 'PAID';
        expect(page.activeSummary.value).toEqual({
            primary: '100 zł opłacono',
            secondary: '1 pozycja',
            tone: 'success',
        });

        page.activeFilter.value = 'ALL';
        expect(page.activeSummary.value).toEqual({
            primary: '2 płatności',
            secondary: '900 zł do opłacenia · 100 zł opłacono',
            tone: 'neutral',
        });
        expect(page.isLoading.value).toBe(false);
    });

    it('clears financial totals when loading fails', async () => {
        fetchMyPayments.mockRejectedValue(new Error('Offline'));
        const page = useMyPaymentsPage();

        await page.loadPayments();

        expect(page.payments.value).toEqual([]);
        expect(page.errorMessage.value).toBe('Offline');
        expect(page.activeSummary.value.primary).toBe('0 zł do opłacenia');
    });
});
