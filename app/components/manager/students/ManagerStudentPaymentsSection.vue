<script setup lang="ts">
import { Check, CreditCard, Plus, Save, X } from 'lucide-vue-next';
import type {
    CreateStudentPaymentPayload,
    StudentPaymentItem,
    StudentPaymentsSummary,
    UpdateStudentPaymentPayload,
} from '~/types/payments/payment';

const props = defineProps<{
    payments: readonly StudentPaymentItem[];
    summary: StudentPaymentsSummary;
    isLoading: boolean;
    error: string | null;
    isSaving: boolean;
    actionError: string | null;
}>();

const emit = defineEmits<{
    create: [payload: CreateStudentPaymentPayload];
    update: [paymentId: string, payload: UpdateStudentPaymentPayload];
    markPaid: [paymentId: string];
    markUnpaid: [paymentId: string];
}>();

const createPaymentPlanId = ref('');
const createAmount = ref('');
const createDueDate = ref('');
const createMethod = ref('');
const editState = reactive<Record<string, { dueDate: string; method: string }>>(
    {},
);

const paymentPlanOptions = computed(() => {
    const seen = new Set<string>();
    const options: Array<{ id: string; label: string }> = [];

    for (const payment of props.payments) {
        if (seen.has(payment.paymentPlanId)) {
            continue;
        }

        seen.add(payment.paymentPlanId);
        options.push({
            id: payment.paymentPlanId,
            label: payment.courseName,
        });
    }

    return options;
});

watch(
    paymentPlanOptions,
    (options) => {
        if (!createPaymentPlanId.value && options[0]) {
            createPaymentPlanId.value = options[0].id;
        }
    },
    { immediate: true },
);

watch(
    () => props.payments,
    (payments) => {
        for (const payment of payments) {
            editState[payment.id] = {
                dueDate: toDateInput(payment.dueDate),
                method: payment.method ?? '',
            };
        }
    },
    { immediate: true },
);

const canCreatePayment = computed(
    () =>
        createPaymentPlanId.value.length > 0 &&
        createAmount.value.trim().length > 0 &&
        !props.isSaving,
);

function toDateInput(value: string | null): string {
    if (!value) {
        return '';
    }

    return value.slice(0, 10);
}

function formatAmount(amount: string, currency: string): string {
    const numeric = Number.parseFloat(amount.replace(',', '.'));

    if (!Number.isFinite(numeric)) {
        return `${amount} ${currency}`.trim();
    }

    return new Intl.NumberFormat('pl-PL', {
        style: 'currency',
        currency: currency || 'PLN',
        maximumFractionDigits: numeric % 1 === 0 ? 0 : 2,
    }).format(numeric);
}

function formatDate(value: string | null): string {
    if (!value) {
        return '-';
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

function handleCreate(): void {
    if (!canCreatePayment.value) {
        return;
    }

    emit('create', {
        paymentPlanId: createPaymentPlanId.value,
        amount: createAmount.value.trim().replace(',', '.'),
        dueDate: createDueDate.value || null,
        method: createMethod.value.trim() || null,
    });

    createAmount.value = '';
    createDueDate.value = '';
    createMethod.value = '';
}

function handleUpdate(paymentId: string): void {
    const state = editState[paymentId];

    if (!state || props.isSaving) {
        return;
    }

    emit('update', paymentId, {
        dueDate: state.dueDate || null,
        method: state.method.trim() || null,
    });
}
</script>

<template>
    <section
        aria-labelledby="student-payments-heading"
        class="border-border bg-card min-w-0 rounded-2xl border p-5 shadow-sm"
    >
        <div class="mb-4 flex items-start justify-between gap-3">
            <div class="space-y-1">
                <h2
                    id="student-payments-heading"
                    class="text-foreground text-xl font-extrabold"
                >
                    Płatności
                </h2>
                <p class="text-muted-foreground text-sm">
                    Historia opłat kursanta w wybranej szkole.
                </p>
            </div>
            <CreditCard
                class="text-muted-foreground size-5 shrink-0"
                aria-hidden="true"
            />
        </div>

        <div class="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div class="bg-muted/30 rounded-lg px-3 py-2">
                <p class="text-muted-foreground text-xs">Opłacone</p>
                <p class="text-foreground mt-1 font-semibold tabular-nums">
                    {{
                        formatAmount(
                            props.summary.paidAmount,
                            props.summary.currency,
                        )
                    }}
                </p>
            </div>
            <div class="bg-muted/30 rounded-lg px-3 py-2">
                <p class="text-muted-foreground text-xs">Do zapłaty</p>
                <p class="text-foreground mt-1 font-semibold tabular-nums">
                    {{
                        formatAmount(
                            props.summary.unpaidAmount,
                            props.summary.currency,
                        )
                    }}
                </p>
            </div>
            <div class="bg-muted/30 rounded-lg px-3 py-2">
                <p class="text-muted-foreground text-xs">Po terminie</p>
                <p class="text-foreground mt-1 font-semibold tabular-nums">
                    {{
                        formatAmount(
                            props.summary.overdueAmount,
                            props.summary.currency,
                        )
                    }}
                </p>
            </div>
            <div class="bg-muted/30 rounded-lg px-3 py-2">
                <p class="text-muted-foreground text-xs">Następny termin</p>
                <p class="text-foreground mt-1 font-semibold">
                    {{ formatDate(props.summary.nextDueDate) }}
                </p>
            </div>
        </div>

        <form
            class="border-border bg-background/70 mb-4 grid gap-3 rounded-xl border p-3 lg:grid-cols-[minmax(0,1.5fr)_120px_150px_150px_auto]"
            @submit.prevent="handleCreate"
        >
            <select
                v-model="createPaymentPlanId"
                class="border-input bg-background text-foreground h-10 min-w-0 rounded-lg border px-3 text-sm"
                :disabled="paymentPlanOptions.length === 0 || props.isSaving"
                aria-label="Plan płatności"
            >
                <option value="" disabled>Plan płatności</option>
                <option
                    v-for="option in paymentPlanOptions"
                    :key="option.id"
                    :value="option.id"
                >
                    {{ option.label }}
                </option>
            </select>
            <input
                v-model="createAmount"
                class="border-input bg-background text-foreground h-10 min-w-0 rounded-lg border px-3 text-sm"
                inputmode="decimal"
                placeholder="Kwota"
                :disabled="props.isSaving"
            />
            <input
                v-model="createDueDate"
                class="border-input bg-background text-foreground h-10 min-w-0 rounded-lg border px-3 text-sm"
                type="date"
                :disabled="props.isSaving"
                aria-label="Termin płatności"
            />
            <input
                v-model="createMethod"
                class="border-input bg-background text-foreground h-10 min-w-0 rounded-lg border px-3 text-sm"
                placeholder="Metoda"
                :disabled="props.isSaving"
            />
            <UiButton
                type="submit"
                class="h-10 rounded-lg px-3"
                :disabled="!canCreatePayment"
            >
                <Plus class="mr-2 size-4" aria-hidden="true" />
                Dodaj
            </UiButton>
        </form>

        <p
            v-if="props.actionError"
            class="bg-destructive/10 text-destructive mb-4 rounded-lg px-3 py-2 text-sm"
        >
            {{ props.actionError }}
        </p>

        <div
            v-if="paymentPlanOptions.length === 0 && !props.isLoading"
            class="border-border bg-muted/20 mb-4 rounded-lg border px-3 py-2 text-sm"
        >
            Brak istniejącego planu płatności do dodania kolejnej raty.
        </div>

        <div v-if="props.payments.length > 0" class="mb-4 space-y-3">
            <article
                v-for="payment in props.payments"
                :key="payment.id"
                class="border-border rounded-xl border p-3"
            >
                <div
                    class="grid gap-3 lg:grid-cols-[minmax(0,1fr)_150px_150px_auto_auto]"
                >
                    <div class="min-w-0">
                        <p class="text-foreground font-semibold">
                            {{ payment.courseName }}
                        </p>
                        <p class="text-muted-foreground text-xs">
                            {{ formatAmount(payment.amount, payment.currency) }}
                        </p>
                    </div>
                    <input
                        v-model="editState[payment.id].dueDate"
                        class="border-input bg-background text-foreground h-10 min-w-0 rounded-lg border px-3 text-sm"
                        type="date"
                        :disabled="props.isSaving"
                        aria-label="Termin płatności"
                    />
                    <input
                        v-model="editState[payment.id].method"
                        class="border-input bg-background text-foreground h-10 min-w-0 rounded-lg border px-3 text-sm"
                        placeholder="Metoda"
                        :disabled="props.isSaving"
                    />
                    <UiButton
                        type="button"
                        variant="outline"
                        class="h-10 rounded-lg px-3"
                        :disabled="props.isSaving"
                        @click="handleUpdate(payment.id)"
                    >
                        <Save class="mr-2 size-4" aria-hidden="true" />
                        Zapisz
                    </UiButton>
                    <UiButton
                        v-if="payment.status === 'UNPAID'"
                        type="button"
                        class="h-10 rounded-lg px-3"
                        :disabled="props.isSaving"
                        @click="emit('markPaid', payment.id)"
                    >
                        <Check class="mr-2 size-4" aria-hidden="true" />
                        Opłacona
                    </UiButton>
                    <UiButton
                        v-else
                        type="button"
                        variant="outline"
                        class="h-10 rounded-lg px-3"
                        :disabled="props.isSaving"
                        @click="emit('markUnpaid', payment.id)"
                    >
                        <X class="mr-2 size-4" aria-hidden="true" />
                        Cofnij
                    </UiButton>
                </div>
            </article>
        </div>

        <StudentPaymentsList
            :payments="props.payments"
            :is-loading="props.isLoading"
            :error="props.error"
        />
    </section>
</template>
