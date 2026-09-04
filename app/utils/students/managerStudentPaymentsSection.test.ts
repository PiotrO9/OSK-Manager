import { describe, expect, it } from 'vitest';
import type { StudentPaymentItem } from '~/types/payments/payment';
import {
    buildCreateStudentPaymentPayload,
    buildStudentPaymentEditState,
    buildStudentPaymentPlanOptions,
    buildUpdateStudentPaymentPayload,
    canCreateStudentPayment,
    formatStudentPaymentAmount,
    formatStudentPaymentDate,
    toStudentPaymentDateInput,
} from './managerStudentPaymentsSection';

const payment = (
    overrides: Partial<StudentPaymentItem> = {},
): StudentPaymentItem => ({
    id: 'payment-1',
    courseId: 'course-1',
    courseName: 'Kurs B',
    paymentPlanId: 'plan-1',
    amount: '1000.00',
    currency: 'PLN',
    status: 'UNPAID',
    date: null,
    dueDate: '2026-09-12T00:00:00.000Z',
    paidAt: null,
    method: 'przelew',
    ...overrides,
});

describe('manager student payments section utilities', () => {
    it('formats amounts and preserves non-numeric values', () => {
        expect(formatStudentPaymentAmount('1000.00', 'PLN')).toMatch(
            /^1000\s*zł$/,
        );
        expect(formatStudentPaymentAmount('1000,50', 'PLN')).toMatch(
            /^1000,50\s*zł$/,
        );
        expect(formatStudentPaymentAmount('brak', 'PLN')).toBe('brak PLN');
    });

    it('formats payment dates and date inputs', () => {
        expect(toStudentPaymentDateInput(null)).toBe('');
        expect(toStudentPaymentDateInput('2026-09-12T00:00:00.000Z')).toBe(
            '2026-09-12',
        );
        expect(formatStudentPaymentDate(null)).toBe('-');
        expect(formatStudentPaymentDate('invalid')).toBe('invalid');
        expect(formatStudentPaymentDate('2026-09-12T00:00:00.000Z')).toBe(
            '12.09.2026',
        );
    });

    it('deduplicates payment plan options in payment order', () => {
        expect(
            buildStudentPaymentPlanOptions([
                payment(),
                payment({ id: 'payment-2' }),
                payment({
                    id: 'payment-3',
                    courseName: 'Kurs A',
                    paymentPlanId: 'plan-2',
                }),
            ]),
        ).toEqual([
            { id: 'plan-1', label: 'Kurs B' },
            { id: 'plan-2', label: 'Kurs A' },
        ]);
    });

    it('builds edit state from a payment item', () => {
        expect(buildStudentPaymentEditState(payment())).toEqual({
            dueDate: '2026-09-12',
            method: 'przelew',
        });
        expect(
            buildStudentPaymentEditState(
                payment({ dueDate: null, method: null }),
            ),
        ).toEqual({
            dueDate: '',
            method: '',
        });
    });

    it('guards payment creation and builds create/update payloads', () => {
        expect(canCreateStudentPayment('plan-1', '10', false)).toBe(true);
        expect(canCreateStudentPayment('', '10', false)).toBe(false);
        expect(canCreateStudentPayment('plan-1', ' ', false)).toBe(false);
        expect(canCreateStudentPayment('plan-1', '10', true)).toBe(false);

        expect(
            buildCreateStudentPaymentPayload({
                paymentPlanId: 'plan-1',
                amount: ' 10,50 ',
                dueDate: '',
                method: ' przelew ',
            }),
        ).toEqual({
            paymentPlanId: 'plan-1',
            amount: '10.50',
            dueDate: null,
            method: 'przelew',
        });

        expect(
            buildUpdateStudentPaymentPayload({
                dueDate: '',
                method: ' gotówka ',
            }),
        ).toEqual({
            dueDate: null,
            method: 'gotówka',
        });
    });
});
