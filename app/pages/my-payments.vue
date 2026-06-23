<script setup lang="ts">
import type { SummaryStripItem } from '~/components/app/ui/types';
import type { StudentPaymentItem } from '~/types/payment';
import { getApiFetchErrorMessage } from '~/utils/apiFetchErrorMessage';

definePageMeta({
    layout: 'app-shell',
    middleware: ['student'],
});

usePageMeta({
    title: () => 'Moje opłaty',
    description: () => 'Lista opłat przypisanych do Twoich kursów.',
});

const { fetchMyPayments } = usePaymentsApi();

const payments = ref<StudentPaymentItem[]>([]);
const isLoading = shallowRef(false);
const errorMessage = shallowRef<string | null>(null);

function parseAmount(payment: StudentPaymentItem): number {
    const value = Number.parseFloat(payment.amount.replace(',', '.'));

    return Number.isFinite(value) ? value : 0;
}

function formatCurrency(value: number, currency = 'PLN'): string {
    return new Intl.NumberFormat('pl-PL', {
        style: 'currency',
        currency,
        maximumFractionDigits: value % 1 === 0 ? 0 : 2,
    }).format(value);
}

function formatNextDueDate(value: string | null): string {
    if (!value) {
        return 'Brak';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat('pl-PL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    }).format(date);
}

const unpaidPayments = computed(() =>
    payments.value.filter((payment) => payment.status === 'UNPAID'),
);
const paidPayments = computed(() =>
    payments.value.filter((payment) => payment.status === 'PAID'),
);

const unpaidTotal = computed(() =>
    unpaidPayments.value.reduce(
        (sum, payment) => sum + parseAmount(payment),
        0,
    ),
);
const paidTotal = computed(() =>
    paidPayments.value.reduce((sum, payment) => sum + parseAmount(payment), 0),
);
const nextDueDate = computed(() => {
    const dates = unpaidPayments.value
        .map((payment) => payment.dueDate)
        .filter((value): value is string => Boolean(value))
        .map((value) => new Date(value))
        .filter((date) => !Number.isNaN(date.getTime()))
        .sort((a, b) => a.getTime() - b.getTime());

    return formatNextDueDate(dates[0]?.toISOString() ?? null);
});

const summaryItems = computed<SummaryStripItem[]>(() => {
    const currency = payments.value[0]?.currency || 'PLN';

    return [
        {
            label: 'Do opłacenia',
            value: formatCurrency(unpaidTotal.value, currency),
            description: `${unpaidPayments.value.length} pozycji`,
            tone: unpaidPayments.value.length > 0 ? 'warning' : 'success',
        },
        {
            label: 'Opłacono',
            value: formatCurrency(paidTotal.value, currency),
            description: `${paidPayments.value.length} pozycji`,
            tone: 'success',
        },
        {
            label: 'Najbliższy termin',
            value: nextDueDate.value,
            description: 'Dla nieopłaconych pozycji',
            tone: unpaidPayments.value.length > 0 ? 'info' : 'neutral',
        },
        {
            label: 'Wszystkie opłaty',
            value: payments.value.length,
            description: 'Przypisane do kursów',
            tone: 'neutral',
        },
    ];
});

async function loadPayments(): Promise<void> {
    errorMessage.value = null;
    isLoading.value = true;

    try {
        payments.value = await fetchMyPayments();
    } catch (err: unknown) {
        payments.value = [];
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
</script>

<template>
    <div class="space-y-5">
        <PageHeader
            title="Moje opłaty"
            description="Saldo, historia płatności i najbliższe należności dla Twoich kursów."
            :meta="[
                {
                    label: 'Pozycje',
                    value: String(payments.length),
                    tone: 'neutral',
                },
            ]"
        />

        <SummaryStrip :items="summaryItems" />

        <StudentPaymentsList
            :payments="payments"
            :is-loading="isLoading"
            :error="errorMessage"
            @retry="loadPayments"
        />
    </div>
</template>
