import {
    normalizeStudentPaymentsPayload,
    type CreateStudentPaymentPayload,
    type StudentPaymentsPayload,
    type UpdateStudentPaymentPayload,
} from '~/types/payments/payment';

type StudentPaymentActionPayload =
    | CreateStudentPaymentPayload
    | UpdateStudentPaymentPayload;

export function usePaymentsApi() {
    async function fetchMyPayments(): Promise<StudentPaymentsPayload> {
        return await requestBffData<StudentPaymentsPayload>(
            'GET',
            '/api/me/payments',
            {
                fallbackMessage: 'Nie udało się pobrać listy opłat.',
                retry: 0,
                normalize: (data) => normalizeStudentPaymentsPayload(data),
            },
        );
    }

    async function fetchStudentPayments(
        userId: string,
        schoolId?: string,
    ): Promise<StudentPaymentsPayload> {
        const trimmedUserId = userId.trim();
        const trimmedSchoolId = schoolId?.trim();

        if (!trimmedUserId) {
            throw new Error('Brak identyfikatora kursanta.');
        }

        const qs = trimmedSchoolId
            ? `?${new URLSearchParams({
                  schoolId: trimmedSchoolId,
              }).toString()}`
            : '';

        return await requestBffData<StudentPaymentsPayload>(
            'GET',
            `/api/students/${encodeURIComponent(trimmedUserId)}/payments${qs}`,
            {
                fallbackMessage: 'Nie udało się pobrać listy opłat kursanta.',
                normalize: (data) => normalizeStudentPaymentsPayload(data),
            },
        );
    }

    async function createStudentPayment(
        userId: string,
        payload: CreateStudentPaymentPayload,
    ): Promise<StudentPaymentsPayload> {
        return await requestStudentPaymentAction(
            'POST',
            userId,
            '/payments',
            payload,
            'Nie udało się dodać płatności.',
        );
    }

    async function updateStudentPayment(
        userId: string,
        paymentId: string,
        payload: UpdateStudentPaymentPayload,
    ): Promise<StudentPaymentsPayload> {
        return await requestStudentPaymentAction(
            'PATCH',
            userId,
            `/payments/${encodeURIComponent(paymentId.trim())}`,
            payload,
            'Nie udało się zapisać płatności.',
        );
    }

    async function markStudentPaymentPaid(
        userId: string,
        paymentId: string,
    ): Promise<StudentPaymentsPayload> {
        return await requestStudentPaymentAction(
            'PATCH',
            userId,
            `/payments/${encodeURIComponent(paymentId.trim())}/mark-paid`,
            undefined,
            'Nie udało się oznaczyć płatności jako opłaconej.',
        );
    }

    async function markStudentPaymentUnpaid(
        userId: string,
        paymentId: string,
    ): Promise<StudentPaymentsPayload> {
        return await requestStudentPaymentAction(
            'PATCH',
            userId,
            `/payments/${encodeURIComponent(paymentId.trim())}/mark-unpaid`,
            undefined,
            'Nie udało się oznaczyć płatności jako nieopłaconej.',
        );
    }

    async function requestStudentPaymentAction(
        method: 'POST' | 'PATCH',
        userId: string,
        pathSuffix: string,
        payload: StudentPaymentActionPayload | undefined,
        fallbackMessage: string,
    ): Promise<StudentPaymentsPayload> {
        const trimmedUserId = userId.trim();

        if (!trimmedUserId) {
            throw new Error('Brak identyfikatora kursanta.');
        }

        return await requestBffData<StudentPaymentsPayload>(
            method,
            `/api/students/${encodeURIComponent(trimmedUserId)}${pathSuffix}`,
            {
                body: payload ?? {},
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
