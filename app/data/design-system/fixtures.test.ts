import { describe, expect, it } from 'vitest';
import {
    buildDesignSystemBookingSlots,
    buildDesignSystemPaymentsSummary,
    designSystemPayments,
    designSystemReferenceDate,
} from './fixtures';
import {
    getMyPaymentDisplayStatus,
    getMyPaymentsToolbarSummary,
} from '~/utils/payments/myPaymentsPage';

describe('design system fixtures', () => {
    it('uses the same reference day for statuses, balances and toolbar', () => {
        const summary = buildDesignSystemPaymentsSummary(designSystemPayments);

        expect(summary).toEqual({
            paidAmount: '1250.00',
            unpaidAmount: '1200.00',
            overdueAmount: '350.00',
            overdueCount: 1,
            nextDueDate: '2026-09-15',
            currency: 'PLN',
        });
        expect(
            designSystemPayments.map((payment) =>
                getMyPaymentDisplayStatus(payment, designSystemReferenceDate),
            ),
        ).toEqual(['PAID', 'UNPAID', 'OVERDUE']);
        const toolbar = getMyPaymentsToolbarSummary(
            designSystemPayments,
            summary,
            'UNPAID',
        );

        expect(toolbar.tone).toBe('danger');
        expect(toolbar.secondary).toContain('1 zaległa');
        expect(toolbar.secondary).toContain('15.09.2026');
    });

    it('clears balances and next due date with an empty dataset', () => {
        expect(buildDesignSystemPaymentsSummary([])).toEqual({
            paidAmount: '0.00',
            unpaidAmount: '0.00',
            overdueAmount: '0.00',
            overdueCount: 0,
            nextDueDate: null,
            currency: 'PLN',
        });
    });

    it('moves overlapping booking slots to the chosen week across month and DST boundaries', () => {
        const slots = buildDesignSystemBookingSlots(new Date(2026, 9, 26));

        expect(slots).toHaveLength(3);
        expect(slots.every((slot) => slot.date === '2026-10-29')).toBe(true);
        expect(slots[0]?.startTime).toBe('08:00');
        expect(slots[1]?.startTime).toBe('08:30');
    });
});
