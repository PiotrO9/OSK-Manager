import {
    normalizeStudentPayments,
    type StudentPaymentItem,
} from '~/types/payment';
import { getApiFetchErrorMessage } from '~/utils/apiFetchErrorMessage';
import { unwrapApiSuccessData } from '~/utils/apiEnvelope';
import { resolveBffEndpoint } from '~/utils/bffEndpoint';

export function usePaymentsApi() {
    async function fetchMyPayments(): Promise<StudentPaymentItem[]> {
        try {
            const raw = await $fetch<unknown>(
                resolveBffEndpoint('/api/me/payments'),
                { method: 'GET', credentials: 'include' },
            );
            const data = unwrapApiSuccessData<unknown>(raw);

            return normalizeStudentPayments(data);
        } catch (err) {
            throw new Error(
                getApiFetchErrorMessage(
                    err,
                    'Nie udało się pobrać listy opłat.',
                ),
            );
        }
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

        try {
            const qs = new URLSearchParams({ schoolId: sid });
            const raw = await $fetch<unknown>(
                resolveBffEndpoint(
                    `/api/students/${encodeURIComponent(uid)}/payments?${qs.toString()}`,
                ),
                { method: 'GET', credentials: 'include' },
            );
            const data = unwrapApiSuccessData<unknown>(raw);

            return normalizeStudentPayments(data);
        } catch (err) {
            throw new Error(
                getApiFetchErrorMessage(
                    err,
                    'Nie udało się pobrać listy opłat kursanta.',
                ),
            );
        }
    }

    return {
        fetchMyPayments,
        fetchStudentPayments,
    };
}
