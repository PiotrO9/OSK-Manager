import { beforeEach, describe, expect, it, vi } from 'vitest';
import { computed, ref } from 'vue';

const fetchStudentPayments = vi.fn();
const createStudentPayment = vi.fn();
const updateStudentPayment = vi.fn();
const markStudentPaymentPaid = vi.fn();
const markStudentPaymentUnpaid = vi.fn();

function installNuxtStudentPaymentsGlobals(): void {
    vi.stubGlobal('ref', ref);
    vi.stubGlobal('computed', computed);
    vi.stubGlobal('usePaymentsApi', () => ({
        createStudentPayment,
        fetchStudentPayments,
        markStudentPaymentPaid,
        markStudentPaymentUnpaid,
        updateStudentPayment,
    }));
}

describe('useManagerStudentPayments', () => {
    beforeEach(() => {
        vi.unstubAllGlobals();
        vi.clearAllMocks();
        installNuxtStudentPaymentsGlobals();
    });

    it('skips loading payments without user id or school id', async () => {
        const { useManagerStudentPayments } =
            await import('./useManagerStudentPayments');
        const payments = useManagerStudentPayments({
            schoolId: ref(''),
            getUserId: () => 'student-user-1',
        });

        await payments.loadStudentPayments('student-user-1');

        expect(payments.payments.value).toEqual([]);
        expect(payments.paymentsLoading.value).toBe(false);
        expect(fetchStudentPayments).not.toHaveBeenCalled();
    });

    it('loads payments and exposes overview label', async () => {
        fetchStudentPayments.mockResolvedValue({
            payments: [
                {
                    id: 'payment-1',
                    courseId: 'course-1',
                    courseName: 'Kurs B',
                    paymentPlanId: 'plan-1',
                    amount: '100.00',
                    currency: 'PLN',
                    status: 'UNPAID',
                    date: null,
                    dueDate: null,
                    paidAt: null,
                    method: null,
                },
            ],
            summary: {
                paidAmount: '0.00',
                unpaidAmount: '100.00',
                overdueAmount: '0.00',
                overdueCount: 0,
                nextDueDate: null,
                currency: 'PLN',
            },
        });
        const { useManagerStudentPayments } =
            await import('./useManagerStudentPayments');
        const payments = useManagerStudentPayments({
            schoolId: ref('school-1'),
            getUserId: () => 'student-user-1',
        });

        await payments.loadStudentPayments('student-user-1');

        expect(fetchStudentPayments).toHaveBeenCalledWith(
            'student-user-1',
            'school-1',
        );
        expect(payments.payments.value).toHaveLength(1);
        expect(payments.paymentsOverviewLabel.value).toBe('1');
    });
});
