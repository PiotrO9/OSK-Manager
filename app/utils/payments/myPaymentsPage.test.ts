import { describe, expect, it } from 'vitest';
import type { StudentPaymentItem } from '~/types/payments/payment';
import {
    filterMyPayments,
    formatPaymentMethod,
    getMyPaymentDisplayStatus,
    getMyPaymentPaidDate,
    sortMyPayments,
} from './myPaymentsPage';
import { formatPolishCount } from '~/utils/text/polishPlural';

function payment(
    overrides: Partial<StudentPaymentItem> = {},
): StudentPaymentItem {
    return {
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
        ...overrides,
    };
}

describe('my payments presentation', () => {
    const today = new Date('2026-09-29T12:00:00.000Z');

    it('marks an unpaid payment before today as overdue', () => {
        expect(getMyPaymentDisplayStatus(payment(), today)).toBe('OVERDUE');
    });

    it('does not expose a fallback date as the payment date', () => {
        expect(getMyPaymentPaidDate(payment())).toBeNull();
        expect(
            getMyPaymentPaidDate(
                payment({
                    status: 'PAID',
                    paidAt: '2026-08-24T00:00:00.000Z',
                }),
            ),
        ).toBe('2026-08-24T00:00:00.000Z');
    });

    it('orders overdue, upcoming and paid payments for quick scanning', () => {
        const items = [
            payment({
                id: 'paid',
                status: 'PAID',
                paidAt: '2026-09-20T00:00:00.000Z',
            }),
            payment({
                id: 'upcoming-later',
                dueDate: '2026-11-10T00:00:00.000Z',
            }),
            payment({
                id: 'overdue-newer',
                dueDate: '2026-09-20T00:00:00.000Z',
            }),
            payment({
                id: 'upcoming-sooner',
                dueDate: '2026-10-10T00:00:00.000Z',
            }),
            payment({
                id: 'overdue-older',
                dueDate: '2026-08-20T00:00:00.000Z',
            }),
        ];

        expect(sortMyPayments(items, today).map((item) => item.id)).toEqual([
            'overdue-older',
            'overdue-newer',
            'upcoming-sooner',
            'upcoming-later',
            'paid',
        ]);
    });

    it('includes overdue payments in the unpaid filter', () => {
        const items = [
            payment({ id: 'overdue' }),
            payment({ id: 'upcoming', dueDate: '2026-10-10T00:00:00.000Z' }),
            payment({ id: 'paid', status: 'PAID' }),
        ];

        expect(
            filterMyPayments(items, 'UNPAID', today).map((item) => item.id),
        ).toEqual(['overdue', 'upcoming']);
        expect(
            filterMyPayments(items, 'PAID', today).map((item) => item.id),
        ).toEqual(['paid']);
    });

    it('formats Polish count labels', () => {
        expect(formatPolishCount(1, ['pozycja', 'pozycje', 'pozycji'])).toBe(
            '1 pozycja',
        );
        expect(formatPolishCount(2, ['pozycja', 'pozycje', 'pozycji'])).toBe(
            '2 pozycje',
        );
        expect(formatPolishCount(12, ['pozycja', 'pozycje', 'pozycji'])).toBe(
            '12 pozycji',
        );
    });

    it('formats known payment method codes for the interface', () => {
        expect(formatPaymentMethod('transfer')).toBe('Przelew');
        expect(formatPaymentMethod('CARD')).toBe('Karta');
        expect(formatPaymentMethod('cash')).toBe('Gotówka');
        expect(formatPaymentMethod('Bon szkoleniowy')).toBe('Bon szkoleniowy');
        expect(formatPaymentMethod(null)).toBeNull();
    });
});
