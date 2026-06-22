<script setup lang="ts">
import { CreditCard } from 'lucide-vue-next';
import {
    formatPaymentStatusLabel,
    getPaymentStatusVariant,
    type StudentPaymentItem,
} from '~/types/payment';

interface Props {
    payments: readonly StudentPaymentItem[];
    isLoading: boolean;
    error: string | null;
    emptyLabel?: string;
}

const props = withDefaults(defineProps<Props>(), {
    emptyLabel: 'Brak opłat',
});

const hasPayments = computed(() => props.payments.length > 0);

function formatAmount(payment: StudentPaymentItem): string {
    const numeric = Number.parseFloat(payment.amount.replace(',', '.'));

    if (!Number.isFinite(numeric)) {
        return `${payment.amount} ${payment.currency}`.trim();
    }

    return new Intl.NumberFormat('pl-PL', {
        style: 'currency',
        currency: payment.currency || 'PLN',
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
</script>

<template>
    <div :aria-busy="isLoading">
        <p
            v-if="isLoading"
            class="text-muted-foreground text-sm"
            role="status"
            aria-live="polite"
        >
            Wczytywanie opłat...
        </p>

        <p
            v-else-if="error"
            class="text-destructive text-sm"
            role="alert"
            aria-live="polite"
        >
            {{ error }}
        </p>

        <p
            v-else-if="!hasPayments"
            class="text-muted-foreground text-sm"
            role="status"
        >
            {{ emptyLabel }}
        </p>

        <ul v-else class="divide-border divide-y rounded-lg border" role="list">
            <li
                v-for="payment in payments"
                :key="payment.id"
                class="grid gap-4 px-4 py-3 md:grid-cols-[minmax(0,1fr)_auto_auto_auto]"
            >
                <div class="flex min-w-0 items-start gap-3">
                    <span
                        class="bg-muted text-muted-foreground flex size-9 shrink-0 items-center justify-center rounded-md"
                        aria-hidden="true"
                    >
                        <CreditCard class="size-4" />
                    </span>
                    <div class="min-w-0">
                        <p class="text-foreground text-sm font-medium">
                            {{ payment.courseName }}
                        </p>
                        <p class="text-muted-foreground text-xs">
                            Termin: {{ formatDate(payment.dueDate) }}
                        </p>
                    </div>
                </div>

                <div class="min-w-28">
                    <p class="text-muted-foreground text-xs font-medium">
                        Kwota
                    </p>
                    <p class="text-foreground text-sm font-semibold">
                        {{ formatAmount(payment) }}
                    </p>
                </div>

                <div class="min-w-28">
                    <p class="text-muted-foreground text-xs font-medium">
                        Data
                    </p>
                    <p class="text-foreground text-sm">
                        {{ formatDate(payment.date) }}
                    </p>
                </div>

                <div class="flex items-start md:justify-end">
                    <UiBadge :variant="getPaymentStatusVariant(payment.status)">
                        {{ formatPaymentStatusLabel(payment.status) }}
                    </UiBadge>
                </div>
            </li>
        </ul>
    </div>
</template>
