import type {
    StudentPaymentItem,
    StudentPaymentsSummary,
} from '~/types/payments/payment';
import { getApiFetchErrorMessage } from '~/utils/api/apiFetchErrorMessage';
import {
    filterMyPayments,
    getMyPaymentsToolbarSummary,
    type MyPaymentsToolbarSummary,
    getMyPaymentDisplayStatus,
    sortMyPayments,
    type MyPaymentsFilter,
} from '~/utils/payments/myPaymentsPage';
import { formatPolishCount } from '~/utils/text/polishPlural';

function createEmptySummary(): StudentPaymentsSummary {
    return {
        paidAmount: '0.00',
        unpaidAmount: '0.00',
        overdueAmount: '0.00',
        overdueCount: 0,
        nextDueDate: null,
        currency: 'PLN',
    };
}

export function useMyPaymentsPage() {
    const { fetchMyPayments } = usePaymentsApi();
    const payments = ref<StudentPaymentItem[]>([]);
    const summary = ref<StudentPaymentsSummary>(createEmptySummary());
    const isLoading = shallowRef(true);
    const errorMessage = shallowRef<string | null>(null);
    const activeFilter = shallowRef<MyPaymentsFilter>('UNPAID');

    const sortedPayments = computed(() => sortMyPayments(payments.value));
    const visiblePayments = computed(() =>
        filterMyPayments(sortedPayments.value, activeFilter.value),
    );
    const paidCount = computed(
        () =>
            payments.value.filter(
                (payment) => getMyPaymentDisplayStatus(payment) === 'PAID',
            ).length,
    );
    const unpaidCount = computed(() => payments.value.length - paidCount.value);
    const filterOptions = computed(() => [
        {
            value: 'UNPAID' as const,
            label: 'Do opłacenia',
            count: unpaidCount.value,
        },
        {
            value: 'ALL' as const,
            label: 'Wszystkie',
            count: payments.value.length,
        },
        {
            value: 'PAID' as const,
            label: 'Opłacone',
            count: paidCount.value,
        },
    ]);
    const resultLabel = computed(() =>
        formatPolishCount(visiblePayments.value.length, [
            'wynik',
            'wyniki',
            'wyników',
        ]),
    );
    const activeSummary = computed<MyPaymentsToolbarSummary>(() => {
        return getMyPaymentsToolbarSummary(
            payments.value,
            summary.value,
            activeFilter.value,
        );
    });

    async function loadPayments(): Promise<void> {
        errorMessage.value = null;
        isLoading.value = true;

        try {
            const data = await fetchMyPayments();

            payments.value = data.payments;
            summary.value = data.summary;
        } catch (err: unknown) {
            payments.value = [];
            summary.value = createEmptySummary();
            errorMessage.value = getApiFetchErrorMessage(
                err,
                'Nie udało się pobrać listy opłat.',
            );
        } finally {
            isLoading.value = false;
        }
    }

    onMounted(() => {
        void loadPayments();
    });

    return {
        activeFilter,
        activeSummary,
        errorMessage,
        filterOptions,
        isLoading,
        loadPayments,
        payments,
        resultLabel,
        visiblePayments,
    };
}
