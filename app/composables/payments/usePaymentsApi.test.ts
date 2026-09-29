import { beforeEach, describe, expect, it, vi } from 'vitest';

const requestBffData = vi.fn();

describe('usePaymentsApi', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.stubGlobal('requestBffData', requestBffData);
    });

    it('keeps the payments summary returned for the current student', async () => {
        requestBffData.mockImplementation(
            async (
                _method: string,
                _path: string,
                options: { normalize: (data: unknown) => unknown },
            ) =>
                options.normalize({
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
                }),
        );
        const { usePaymentsApi } = await import('./usePaymentsApi');
        const api = usePaymentsApi();

        const result = await api.fetchMyPayments();

        expect(result.summary).toEqual({
            paidAmount: '0.00',
            unpaidAmount: '900.00',
            overdueAmount: '900.00',
            overdueCount: 1,
            nextDueDate: null,
            currency: 'PLN',
        });
        expect(result.payments).toHaveLength(1);
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
