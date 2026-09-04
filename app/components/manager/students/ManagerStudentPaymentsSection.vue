<script setup lang="ts">
import { Check, CreditCard, Plus, Save, X } from 'lucide-vue-next';
import type {
    CreateStudentPaymentPayload,
    StudentPaymentItem,
    StudentPaymentsSummary,
    UpdateStudentPaymentPayload,
} from '~/types/payments/payment';
import {
    buildCreateStudentPaymentPayload,
    buildStudentPaymentEditState,
    buildStudentPaymentPlanOptions,
    buildUpdateStudentPaymentPayload,
    canCreateStudentPayment,
    formatStudentPaymentAmount,
    formatStudentPaymentDate,
    type StudentPaymentEditState,
} from '~/utils/students/managerStudentPaymentsSection';

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

const editState = reactive<Record<string, StudentPaymentEditState>>({});

const paymentPlanOptions = computed(() =>
    buildStudentPaymentPlanOptions(props.payments),
);

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
            editState[payment.id] = buildStudentPaymentEditState(payment);
        }
    },
    { immediate: true },
);

const canCreatePayment = computed(() =>
    canCreateStudentPayment(
        createPaymentPlanId.value,
        createAmount.value,
        props.isSaving,
    ),
);

const paymentEditRows = computed(() =>
    props.payments.map((payment) => ({
        payment,
        state: editState[payment.id] ?? buildStudentPaymentEditState(payment),
    })),
);

function handleCreate(): void {
    if (!canCreatePayment.value) {
        return;
    }

    emit(
        'create',
        buildCreateStudentPaymentPayload({
            paymentPlanId: createPaymentPlanId.value,
            amount: createAmount.value,
            dueDate: createDueDate.value,
            method: createMethod.value,
        }),
    );

    createAmount.value = '';
    createDueDate.value = '';
    createMethod.value = '';
}

function handleUpdate(paymentId: string): void {
    const state = editState[paymentId];

    if (!state || props.isSaving) {
        return;
    }

    emit('update', paymentId, buildUpdateStudentPaymentPayload(state));
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
                        formatStudentPaymentAmount(
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
                        formatStudentPaymentAmount(
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
                        formatStudentPaymentAmount(
                            props.summary.overdueAmount,
                            props.summary.currency,
                        )
                    }}
                </p>
            </div>
            <div class="bg-muted/30 rounded-lg px-3 py-2">
                <p class="text-muted-foreground text-xs">Następny termin</p>
                <p class="text-foreground mt-1 font-semibold">
                    {{ formatStudentPaymentDate(props.summary.nextDueDate) }}
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
                v-for="{ payment, state } in paymentEditRows"
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
                            {{
                                formatStudentPaymentAmount(
                                    payment.amount,
                                    payment.currency,
                                )
                            }}
                        </p>
                    </div>
                    <input
                        v-model="state.dueDate"
                        class="border-input bg-background text-foreground h-10 min-w-0 rounded-lg border px-3 text-sm"
                        type="date"
                        :disabled="props.isSaving"
                        aria-label="Termin płatności"
                    />
                    <input
                        v-model="state.method"
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
