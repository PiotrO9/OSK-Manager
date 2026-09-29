import type {
    StudentPaymentItem,
    StudentPaymentsSummary,
} from '~/types/payments/payment';
import { getApiFetchErrorMessage } from '~/utils/api/apiFetchErrorMessage';
import {
    filterMyPayments,
    formatPolishCount,
    getMyPaymentDisplayStatus,
    sortMyPayments,
    type MyPaymentsFilter,
} from '~/utils/payments/myPaymentsPage';

export interface MyPaymentsToolbarSummary {
    primary: string;
    secondary: string;
    tone: 'danger' | 'neutral' | 'success';
}

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

function parseAmount(value: string): number {
    const amount = Number.parseFloat(value.replace(',', '.'));

    return Number.isFinite(amount) ? amount : 0;
}

function formatCurrency(value: string, currency: string): string {
    const amount = parseAmount(value);

    return new Intl.NumberFormat('pl-PL', {
        style: 'currency',
        currency: currency || 'PLN',
        maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
    }).format(amount);
}

function formatDate(value: string | null): string {
    if (!value) {
        return 'Brak';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return 'Brak';
    }

    return new Intl.DateTimeFormat('pl-PL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    }).format(date);
}

function formatOverdueCount(count: number): string {
    const absoluteCount = Math.abs(count);
    const lastTwoDigits = absoluteCount % 100;
    const lastDigit = absoluteCount % 10;

    if (count === 1) {
        return '1 zaległa';
    }

    if (lastTwoDigits < 12 || lastTwoDigits > 14) {
        if (lastDigit >= 2 && lastDigit <= 4) {
            return `${count} zaległe`;
        }
    }

    return `${count} zaległych`;
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
        const currency = summary.value.currency;

        if (activeFilter.value === 'PAID') {
            return {
                primary: `${formatCurrency(summary.value.paidAmount, currency)} opłacono`,
                secondary: formatPolishCount(paidCount.value, [
                    'pozycja',
                    'pozycje',
                    'pozycji',
                ]),
                tone: 'success',
            };
        }

        if (activeFilter.value === 'ALL') {
            return {
                primary: formatPolishCount(payments.value.length, [
                    'płatność',
                    'płatności',
                    'płatności',
                ]),
                secondary: `${formatCurrency(summary.value.unpaidAmount, currency)} do opłacenia · ${formatCurrency(summary.value.paidAmount, currency)} opłacono`,
                tone: 'neutral',
            };
        }

        const details: string[] = [];

        if (summary.value.overdueCount > 0) {
            details.push(
                `${formatOverdueCount(summary.value.overdueCount)} · ${formatCurrency(summary.value.overdueAmount, currency)}`,
            );
        }

        if (summary.value.nextDueDate) {
            details.push(
                `najbliższy termin ${formatDate(summary.value.nextDueDate)}`,
            );
        }

        return {
            primary: `${formatCurrency(summary.value.unpaidAmount, currency)} do opłacenia`,
            secondary:
                details.join(' · ') ||
                formatPolishCount(unpaidCount.value, [
                    'pozycja',
                    'pozycje',
                    'pozycji',
                ]),
            tone: summary.value.overdueCount > 0 ? 'danger' : 'neutral',
        };
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
