import {
    normalizeStudentPayments,
    type StudentPaymentItem,
} from '~/types/payment';

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
    ): Promise<StudentPaymentItem[]> {
        const uid = userId.trim();
        const sid = schoolId.trim();

        if (!uid || !sid) {
            throw new Error('Brak identyfikatora kursanta lub szkoły.');
        }

        const qs = new URLSearchParams({ schoolId: sid });

        return await requestBffData<StudentPaymentItem[]>(
            'GET',
            `/api/students/${encodeURIComponent(uid)}/payments?${qs.toString()}`,
            {
                fallbackMessage: 'Nie udało się pobrać listy opłat kursanta.',
                normalize: (data) => normalizeStudentPayments(data),
            },
        );
    }

    return {
        fetchMyPayments,
        fetchStudentPayments,
    };
}
