import type { Ref } from 'vue';
import type {
    CreateStudentPaymentPayload,
    StudentPaymentItem,
    StudentPaymentsPayload,
    StudentPaymentsSummary,
    UpdateStudentPaymentPayload,
} from '~/types/payments/payment';
import { getApiFetchErrorMessage } from '~/utils/api/apiFetchErrorMessage';
import {
    getStudentCountOverviewLabel,
    getStudentDetailsRouteUserIdString,
} from '~/utils/students/studentDetailsPage';

function createDefaultStudentPaymentsSummary(): StudentPaymentsSummary {
    return {
        paidAmount: '0.00',
        unpaidAmount: '0.00',
        overdueAmount: '0.00',
        overdueCount: 0,
        nextDueDate: null,
        currency: 'PLN',
    };
}

function getMissingSchoolIdMessage(): string {
    return 'Brak identyfikatora szkoły w adresie strony. Wróć do listy kursantów i otwórz szczegóły ponownie.';
}

export function useManagerStudentPayments(input: {
    schoolId: Ref<string>;
    getUserId: () => unknown;
}) {
    const {
        createStudentPayment,
        fetchStudentPayments,
        markStudentPaymentPaid,
        markStudentPaymentUnpaid,
        updateStudentPayment,
    } = usePaymentsApi();
    const payments = ref<StudentPaymentItem[]>([]);
    const paymentsSummary = ref<StudentPaymentsSummary>(
        createDefaultStudentPaymentsSummary(),
    );
    const paymentsLoading = ref(false);
    const paymentsError = ref<string | null>(null);
    const paymentsSaving = ref(false);
    const paymentsActionError = ref<string | null>(null);
    let paymentsFetchSeq = 0;

    const paymentsOverviewLabel = computed(() => {
        return getStudentCountOverviewLabel({
            isLoading: paymentsLoading.value,
            hasError: Boolean(paymentsError.value),
            count: payments.value.length,
        });
    });

    async function loadStudentPayments(rawUserId: unknown): Promise<void> {
        const userId = getStudentDetailsRouteUserIdString(rawUserId);

        payments.value = [];
        paymentsError.value = null;

        if (!userId || !input.schoolId.value) {
            paymentsLoading.value = false;

            return;
        }

        const seq = ++paymentsFetchSeq;

        paymentsLoading.value = true;

        try {
            const data = await fetchStudentPayments(
                userId,
                input.schoolId.value,
            );

            if (seq !== paymentsFetchSeq) {
                return;
            }

            payments.value = data.payments;
            paymentsSummary.value = data.summary;
        } catch (err: unknown) {
            if (seq !== paymentsFetchSeq) {
                return;
            }

            payments.value = [];
            paymentsSummary.value = createDefaultStudentPaymentsSummary();
            paymentsError.value = getApiFetchErrorMessage(
                err,
                'Nie udało się wczytać opłat kursanta.',
            );
        } finally {
            if (seq === paymentsFetchSeq) {
                paymentsLoading.value = false;
            }
        }
    }

    async function handleCreateStudentPayment(
        payload: CreateStudentPaymentPayload,
    ): Promise<void> {
        await handleStudentPaymentAction((userId, schoolId) =>
            createStudentPayment(userId, schoolId, payload),
        );
    }

    async function handleUpdateStudentPayment(
        paymentId: string,
        payload: UpdateStudentPaymentPayload,
    ): Promise<void> {
        await handleStudentPaymentAction((userId, schoolId) =>
            updateStudentPayment(userId, schoolId, paymentId, payload),
        );
    }

    async function handleMarkStudentPaymentPaid(
        paymentId: string,
    ): Promise<void> {
        await handleStudentPaymentAction((userId, schoolId) =>
            markStudentPaymentPaid(userId, schoolId, paymentId),
        );
    }

    async function handleMarkStudentPaymentUnpaid(
        paymentId: string,
    ): Promise<void> {
        await handleStudentPaymentAction((userId, schoolId) =>
            markStudentPaymentUnpaid(userId, schoolId, paymentId),
        );
    }

    async function handleStudentPaymentAction(
        action: (
            userId: string,
            schoolId: string,
        ) => Promise<StudentPaymentsPayload>,
    ): Promise<void> {
        paymentsActionError.value = null;

        const userId = getStudentDetailsRouteUserIdString(input.getUserId());

        if (!input.schoolId.value || !userId) {
            paymentsActionError.value = getMissingSchoolIdMessage();

            return;
        }

        paymentsSaving.value = true;

        try {
            const data = await action(userId, input.schoolId.value);

            payments.value = data.payments;
            paymentsSummary.value = data.summary;
        } catch (err: unknown) {
            paymentsActionError.value = getApiFetchErrorMessage(
                err,
                'Nie udało się zapisać płatności kursanta.',
            );
        } finally {
            paymentsSaving.value = false;
        }
    }

    return {
        payments,
        paymentsSummary,
        paymentsLoading,
        paymentsError,
        paymentsSaving,
        paymentsActionError,
        paymentsOverviewLabel,
        loadStudentPayments,
        handleCreateStudentPayment,
        handleUpdateStudentPayment,
        handleMarkStudentPaymentPaid,
        handleMarkStudentPaymentUnpaid,
    };
}
