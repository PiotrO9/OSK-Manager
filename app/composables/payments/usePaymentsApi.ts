import {
    normalizeStudentPaymentsPayload,
    normalizeStudentPayments,
    type CreateStudentPaymentPayload,
    type StudentPaymentItem,
    type StudentPaymentsPayload,
    type UpdateStudentPaymentPayload,
} from '~/types/payments/payment';

export function usePaymentsApi() {
    async function fetchMyPayments(): Promise<StudentPaymentItem[]> {
        return await requestBffData<StudentPaymentItem[]>(
            'GET',
            '/api/me/payments',
            {
                fallbackMessage: 'Nie udało się pobrać listy opłat.',
                normalize: (data) => normalizeStudentPayments(data),
            },
        );
    }

    async function fetchStudentPayments(
        userId: string,
        schoolId: string,
    ): Promise<StudentPaymentsPayload> {
        const uid = userId.trim();
        const sid = schoolId.trim();

        if (!uid || !sid) {
            throw new Error('Brak identyfikatora kursanta lub szkoły.');
        }

        const qs = new URLSearchParams({ schoolId: sid });

        return await requestBffData<StudentPaymentsPayload>(
            'GET',
            `/api/students/${encodeURIComponent(uid)}/payments?${qs.toString()}`,
            {
                fallbackMessage: 'Nie udało się pobrać listy opłat kursanta.',
                normalize: (data) => normalizeStudentPaymentsPayload(data),
            },
        );
    }

    async function createStudentPayment(
        userId: string,
        schoolId: string,
        payload: CreateStudentPaymentPayload,
    ): Promise<StudentPaymentsPayload> {
        return await requestStudentPaymentAction(
            'POST',
            userId,
            schoolId,
            '/payments',
            payload,
            'Nie udało się dodać płatności.',
        );
    }

    async function updateStudentPayment(
        userId: string,
        schoolId: string,
        paymentId: string,
        payload: UpdateStudentPaymentPayload,
    ): Promise<StudentPaymentsPayload> {
        return await requestStudentPaymentAction(
            'PATCH',
            userId,
            schoolId,
            `/payments/${encodeURIComponent(paymentId.trim())}`,
            payload,
            'Nie udało się zapisać płatności.',
        );
    }

    async function markStudentPaymentPaid(
        userId: string,
        schoolId: string,
        paymentId: string,
    ): Promise<StudentPaymentsPayload> {
        return await requestStudentPaymentAction(
            'PATCH',
            userId,
            schoolId,
            `/payments/${encodeURIComponent(paymentId.trim())}/mark-paid`,
            {},
            'Nie udało się oznaczyć płatności jako opłaconej.',
        );
    }

    async function markStudentPaymentUnpaid(
        userId: string,
        schoolId: string,
        paymentId: string,
    ): Promise<StudentPaymentsPayload> {
        return await requestStudentPaymentAction(
            'PATCH',
            userId,
            schoolId,
            `/payments/${encodeURIComponent(paymentId.trim())}/mark-unpaid`,
            {},
            'Nie udało się oznaczyć płatności jako nieopłaconej.',
        );
    }

    async function requestStudentPaymentAction(
        method: 'POST' | 'PATCH',
        userId: string,
        schoolId: string,
        pathSuffix: string,
        payload: Record<string, unknown>,
        fallbackMessage: string,
    ): Promise<StudentPaymentsPayload> {
        const uid = userId.trim();
        const sid = schoolId.trim();

        if (!uid || !sid) {
            throw new Error('Brak identyfikatora kursanta lub szkoły.');
        }

        return await requestBffData<StudentPaymentsPayload>(
            method,
            `/api/students/${encodeURIComponent(uid)}${pathSuffix}`,
            {
                body: { ...payload, schoolId: sid },
                fallbackMessage,
                normalize: (data) => normalizeStudentPaymentsPayload(data),
            },
        );
    }

    return {
        createStudentPayment,
        fetchMyPayments,
        fetchStudentPayments,
        markStudentPaymentPaid,
        markStudentPaymentUnpaid,
        updateStudentPayment,
    };
}
