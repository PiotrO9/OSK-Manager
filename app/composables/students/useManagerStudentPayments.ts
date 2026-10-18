import type {
    CreateStudentPaymentPayload,
    StudentPaymentItem,
    StudentPaymentPlan,
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

export function useManagerStudentPayments(input: { getUserId: () => unknown }) {
    const {
        createStudentPayment,
        fetchStudentPayments,
        markStudentPaymentPaid,
        markStudentPaymentUnpaid,
        updateStudentPayment,
    } = usePaymentsApi();
    const payments = ref<StudentPaymentItem[]>([]);
    const paymentPlans = ref<StudentPaymentPlan[]>([]);
    const paymentsSummary = ref<StudentPaymentsSummary>(
        createDefaultStudentPaymentsSummary(),
    );
    const paymentsLoading = ref(false);
    const paymentsError = ref<string | null>(null);
    const paymentsSaving = ref(false);
    const paymentsActionError = ref<string | null>(null);
    const paymentCreateSuccessVersion = ref(0);
    let paymentsFetchSequence = 0;

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
        paymentPlans.value = [];
        paymentsError.value = null;

        const requestSequence = ++paymentsFetchSequence;

        paymentsSaving.value = false;
        paymentsActionError.value = null;
        paymentsSummary.value = createDefaultStudentPaymentsSummary();

        if (!userId) {
            paymentsLoading.value = false;

            return;
        }

        paymentsLoading.value = true;

        try {
            const data = await fetchStudentPayments(userId);

            if (requestSequence !== paymentsFetchSequence) {
                return;
            }

            payments.value = data.payments;
            paymentPlans.value = data.paymentPlans;
            paymentsSummary.value = data.summary;
        } catch (err: unknown) {
            if (requestSequence !== paymentsFetchSequence) {
                return;
            }

            payments.value = [];
            paymentPlans.value = [];
            paymentsSummary.value = createDefaultStudentPaymentsSummary();
            paymentsError.value = getApiFetchErrorMessage(
                err,
                'Nie udało się wczytać opłat kursanta.',
            );
        } finally {
            if (requestSequence === paymentsFetchSequence) {
                paymentsLoading.value = false;
            }
        }
    }

    async function handleCreateStudentPayment(
        payload: CreateStudentPaymentPayload,
    ): Promise<void> {
        const succeeded = await handleStudentPaymentAction((userId) =>
            createStudentPayment(userId, payload),
        );

        if (succeeded) {
            paymentCreateSuccessVersion.value += 1;
        }
    }

    async function handleUpdateStudentPayment(
        paymentId: string,
        payload: UpdateStudentPaymentPayload,
    ): Promise<void> {
        await handleStudentPaymentAction((userId) =>
            updateStudentPayment(userId, paymentId, payload),
        );
    }

    async function handleMarkStudentPaymentPaid(
        paymentId: string,
    ): Promise<void> {
        await handleStudentPaymentAction((userId) =>
            markStudentPaymentPaid(userId, paymentId),
        );
    }

    async function handleMarkStudentPaymentUnpaid(
        paymentId: string,
    ): Promise<void> {
        await handleStudentPaymentAction((userId) =>
            markStudentPaymentUnpaid(userId, paymentId),
        );
    }

    async function handleStudentPaymentAction(
        action: (userId: string) => Promise<StudentPaymentsPayload>,
    ): Promise<boolean> {
        paymentsActionError.value = null;

        const userId = getStudentDetailsRouteUserIdString(input.getUserId());

        if (!userId) {
            paymentsActionError.value = 'Brak identyfikatora kursanta.';

            return false;
        }

        const requestSequence = ++paymentsFetchSequence;

        paymentsLoading.value = false;
        paymentsSaving.value = true;

        try {
            const data = await action(userId);

            if (
                requestSequence !== paymentsFetchSequence ||
                userId !== getStudentDetailsRouteUserIdString(input.getUserId())
            )
                return false;

            payments.value = data.payments;
            paymentPlans.value = data.paymentPlans;
            paymentsSummary.value = data.summary;

            return true;
        } catch (err: unknown) {
            if (requestSequence !== paymentsFetchSequence) return false;

            paymentsActionError.value = getApiFetchErrorMessage(
                err,
                'Nie udało się zapisać płatności kursanta.',
            );

            return false;
        } finally {
            if (requestSequence === paymentsFetchSequence)
                paymentsSaving.value = false;
        }
    }

    return {
        payments,
        paymentPlans,
        paymentsSummary,
        paymentsLoading,
        paymentsError,
        paymentsSaving,
        paymentsActionError,
        paymentCreateSuccessVersion,
        paymentsOverviewLabel,
        loadStudentPayments,
        handleCreateStudentPayment,
        handleUpdateStudentPayment,
        handleMarkStudentPaymentPaid,
        handleMarkStudentPaymentUnpaid,
    };
}
