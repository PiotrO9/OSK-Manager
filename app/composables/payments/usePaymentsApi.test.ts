import { beforeEach, describe, expect, it, vi } from 'vitest';

const requestBffData = vi.fn();

describe('usePaymentsApi', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.stubGlobal('requestBffData', requestBffData);
    });

    it('adds school id to create payment body', async () => {
        requestBffData.mockResolvedValue({ payments: [], summary: {} });
        const { usePaymentsApi } = await import('./usePaymentsApi');
        const api = usePaymentsApi();

        await api.createStudentPayment(' student-1 ', ' school-1 ', {
            paymentPlanId: 'plan-1',
            amount: '1200.00',
            dueDate: '2026-09-01',
            method: null,
        });

        expect(requestBffData).toHaveBeenCalledWith(
            'POST',
            '/api/students/student-1/payments',
            {
                body: {
                    paymentPlanId: 'plan-1',
                    amount: '1200.00',
                    dueDate: '2026-09-01',
                    method: null,
                    schoolId: 'school-1',
                },
                fallbackMessage: 'Nie udało się dodać płatności.',
                normalize: expect.any(Function),
            },
        );
    });

    it('uses only school id for mark paid action body', async () => {
        requestBffData.mockResolvedValue({ payments: [], summary: {} });
        const { usePaymentsApi } = await import('./usePaymentsApi');
        const api = usePaymentsApi();

        await api.markStudentPaymentPaid(
            ' student-1 ',
            ' school-1 ',
            ' payment-1 ',
        );

        expect(requestBffData).toHaveBeenCalledWith(
            'PATCH',
            '/api/students/student-1/payments/payment-1/mark-paid',
            {
                body: { schoolId: 'school-1' },
                fallbackMessage:
                    'Nie udało się oznaczyć płatności jako opłaconej.',
                normalize: expect.any(Function),
            },
        );
    });
});
