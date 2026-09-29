<script setup lang="ts">
import { CreditCard } from 'lucide-vue-next';
import type { StudentPaymentItem } from '~/types/payments/payment';
import type { StatusTone } from '~/types/ui';
import {
    formatPaymentMethod,
    formatPolishCount,
    getMyPaymentDisplayStatus,
    getMyPaymentPaidDate,
    type MyPaymentDisplayStatus,
} from '~/utils/payments/myPaymentsPage';

interface Props {
    payments: readonly StudentPaymentItem[];
    isLoading: boolean;
    error: string | null;
    emptyLabel?: string;
    showOverview?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    emptyLabel: 'Brak opłat',
    showOverview: true,
});

const emit = defineEmits<{
    retry: [];
}>();

const hasPayments = computed(() => props.payments.length > 0);
const paidCount = computed(
    () => props.payments.filter((payment) => payment.status === 'PAID').length,
);
const unpaidCount = computed(
    () =>
        props.payments.filter((payment) => payment.status === 'UNPAID').length,
);

const resultLabel = computed(() => {
    if (props.isLoading) {
        return 'Wczytywanie…';
    }

    return formatPolishCount(props.payments.length, [
        'wynik',
        'wyniki',
        'wyników',
    ]);
});

function formatAmount(payment: StudentPaymentItem): string {
    const numeric = Number.parseFloat(payment.amount.replace(',', '.'));

    if (!Number.isFinite(numeric)) {
        return `${payment.amount} ${payment.currency}`.trim();
    }

    return new Intl.NumberFormat('pl-PL', {
        style: 'currency',
        currency: payment.currency || 'PLN',
        maximumFractionDigits: numeric % 1 === 0 ? 0 : 2,
    }).format(numeric);
}

function formatDate(value: string | null): string {
    if (!value) {
        return '—';
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

const statusMeta: Record<
    MyPaymentDisplayStatus,
    { label: string; tone: StatusTone }
> = {
    OVERDUE: { label: 'Zaległa', tone: 'danger' },
    UNPAID: { label: 'Do opłacenia', tone: 'warning' },
    PAID: { label: 'Opłacona', tone: 'success' },
};

function getStatusMeta(payment: StudentPaymentItem) {
    return statusMeta[getMyPaymentDisplayStatus(payment)];
}

function isOverdue(payment: StudentPaymentItem): boolean {
    return getMyPaymentDisplayStatus(payment) === 'OVERDUE';
}
</script>

<template>
    <div class="space-y-3">
        <FilterBar
            v-if="props.showOverview"
            title="Podsumowanie listy"
            :result-label="resultLabel"
        >
            <StatusBadge
                :label="`Wszystkie ${props.payments.length}`"
                tone="neutral"
                subtle
            />
            <StatusBadge
                :label="`Opłacone ${paidCount}`"
                tone="success"
                subtle
            />
            <StatusBadge
                :label="`Do opłacenia ${unpaidCount}`"
                :tone="unpaidCount > 0 ? 'warning' : 'neutral'"
                subtle
            />
        </FilterBar>

        <DataTableShell
            :is-loading="props.isLoading"
            :error-message="props.error"
            :empty-title="props.emptyLabel"
            empty-description="Nie znaleziono płatności przypisanych do Twoich kursów."
            @retry="emit('retry')"
        >
            <EmptyState
                v-if="!hasPayments"
                :title="props.emptyLabel"
                description="Nie znaleziono płatności przypisanych do Twoich kursów."
                class="m-4"
            />

            <table v-if="hasPayments" class="min-w-full text-sm">
                <caption class="sr-only">
                    Lista opłat przypisanych do kursów
                </caption>
                <thead class="bg-muted/30 text-muted-foreground">
                    <tr class="border-border border-b">
                        <th
                            scope="col"
                            class="px-4 py-3 text-left text-xs font-semibold tracking-wide"
                        >
                            Nazwa
                        </th>
                        <th
                            scope="col"
                            class="px-4 py-3 text-left text-xs font-semibold tracking-wide"
                        >
                            Kwota
                        </th>
                        <th
                            scope="col"
                            class="px-4 py-3 text-left text-xs font-semibold tracking-wide"
                        >
                            Status
                        </th>
                        <th
                            scope="col"
                            class="px-4 py-3 text-left text-xs font-semibold tracking-wide"
                        >
                            Termin
                        </th>
                        <th
                            scope="col"
                            class="px-4 py-3 text-left text-xs font-semibold tracking-wide"
                        >
                            Zapłacono
                        </th>
                    </tr>
                </thead>
                <tbody class="divide-border divide-y">
                    <tr
                        v-for="payment in props.payments"
                        :key="payment.id"
                        class="bg-card hover:bg-muted/20 transition-colors"
                    >
                        <td class="px-4 py-4 align-top">
                            <div class="flex min-w-0 items-start gap-3">
                                <span
                                    class="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-lg"
                                    aria-hidden="true"
                                >
                                    <CreditCard class="size-4" />
                                </span>
                                <div class="min-w-0">
                                    <p
                                        class="text-foreground font-semibold break-words"
                                    >
                                        {{ payment.courseName }}
                                    </p>
                                    <p
                                        v-if="
                                            formatPaymentMethod(
                                                payment.method,
                                            ) && payment.status === 'PAID'
                                        "
                                        class="text-muted-foreground text-xs"
                                    >
                                        {{
                                            formatPaymentMethod(payment.method)
                                        }}
                                    </p>
                                </div>
                            </div>
                        </td>
                        <td
                            class="text-foreground px-4 py-4 align-top font-semibold tabular-nums"
                        >
                            {{ formatAmount(payment) }}
                        </td>
                        <td class="px-4 py-4 align-top">
                            <StatusBadge
                                :label="getStatusMeta(payment).label"
                                :tone="getStatusMeta(payment).tone"
                            />
                        </td>
                        <td
                            class="px-4 py-4 align-top tabular-nums"
                            :class="
                                isOverdue(payment)
                                    ? 'text-danger-600 dark:text-danger-300 font-semibold'
                                    : 'text-muted-foreground'
                            "
                        >
                            <time
                                v-if="payment.dueDate"
                                :datetime="payment.dueDate"
                            >
                                {{ formatDate(payment.dueDate) }}
                            </time>
                            <span v-else>—</span>
                        </td>
                        <td
                            class="text-muted-foreground px-4 py-4 align-top tabular-nums"
                        >
                            <time
                                v-if="getMyPaymentPaidDate(payment)"
                                :datetime="
                                    getMyPaymentPaidDate(payment) ?? undefined
                                "
                            >
                                {{ formatDate(getMyPaymentPaidDate(payment)) }}
                            </time>
                            <span v-else>—</span>
                        </td>
                    </tr>
                </tbody>
            </table>

            <template v-if="hasPayments" #mobile>
                <div class="space-y-3 p-3">
                    <article
                        v-for="payment in props.payments"
                        :key="payment.id"
                        class="border-border bg-card rounded-xl border p-4 shadow-xs"
                    >
                        <div
                            class="flex min-w-0 items-start justify-between gap-3"
                        >
                            <div class="min-w-0">
                                <h2
                                    class="text-foreground text-sm font-semibold break-words"
                                >
                                    {{ payment.courseName }}
                                </h2>
                                <p
                                    class="mt-1 text-xs"
                                    :class="
                                        isOverdue(payment)
                                            ? 'text-danger-600 dark:text-danger-300 font-semibold'
                                            : 'text-muted-foreground'
                                    "
                                >
                                    Termin:
                                    <time
                                        v-if="payment.dueDate"
                                        :datetime="payment.dueDate"
                                    >
                                        {{ formatDate(payment.dueDate) }}
                                    </time>
                                    <span v-else>—</span>
                                </p>
                            </div>
                            <StatusBadge
                                :label="getStatusMeta(payment).label"
                                :tone="getStatusMeta(payment).tone"
                            />
                        </div>

                        <div class="mt-4 grid grid-cols-2 gap-3">
                            <div class="bg-muted/30 rounded-lg px-3 py-2">
                                <p class="text-muted-foreground text-xs">
                                    Kwota
                                </p>
                                <p
                                    class="text-foreground mt-1 text-sm font-semibold tabular-nums"
                                >
                                    {{ formatAmount(payment) }}
                                </p>
                            </div>
                            <div class="bg-muted/30 rounded-lg px-3 py-2">
                                <p class="text-muted-foreground text-xs">
                                    Zapłacono
                                </p>
                                <p
                                    class="text-foreground mt-1 text-sm tabular-nums"
                                >
                                    <time
                                        v-if="getMyPaymentPaidDate(payment)"
                                        :datetime="
                                            getMyPaymentPaidDate(payment) ??
                                            undefined
                                        "
                                    >
                                        {{
                                            formatDate(
                                                getMyPaymentPaidDate(payment),
                                            )
                                        }}
                                    </time>
                                    <span v-else>—</span>
                                </p>
                            </div>
                        </div>
                    </article>
                </div>
            </template>
        </DataTableShell>
    </div>
</template>
