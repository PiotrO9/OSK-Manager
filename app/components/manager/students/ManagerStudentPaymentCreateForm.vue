<script setup lang="ts">
import { Plus } from 'lucide-vue-next';
import type { StudentPaymentPlanOption } from '~/utils/students/managerStudentPaymentsSection';

defineProps<{
    canCreatePayment: boolean;
    isSaving: boolean;
    paymentPlanOptions: readonly StudentPaymentPlanOption[];
}>();

const emit = defineEmits<{
    create: [];
}>();

const amount = defineModel<string>('amount', { required: true });
const dueDate = defineModel<string>('dueDate', { required: true });
const method = defineModel<string>('method', { required: true });
const paymentPlanId = defineModel<string>('paymentPlanId', { required: true });
</script>

<template>
    <form
        class="border-border bg-background/70 mb-4 grid gap-3 rounded-xl border p-3 lg:grid-cols-[minmax(0,1.5fr)_120px_150px_150px_auto]"
        @submit.prevent="emit('create')"
    >
        <select
            v-model="paymentPlanId"
            class="border-input bg-background text-foreground h-10 min-w-0 rounded-lg border px-3 text-sm"
            :disabled="paymentPlanOptions.length === 0 || isSaving"
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
            v-model="amount"
            class="border-input bg-background text-foreground h-10 min-w-0 rounded-lg border px-3 text-sm"
            inputmode="decimal"
            placeholder="Kwota"
            :disabled="isSaving"
        />
        <input
            v-model="dueDate"
            class="border-input bg-background text-foreground h-10 min-w-0 rounded-lg border px-3 text-sm"
            type="date"
            :disabled="isSaving"
            aria-label="Termin płatności"
        />
        <input
            v-model="method"
            class="border-input bg-background text-foreground h-10 min-w-0 rounded-lg border px-3 text-sm"
            placeholder="Metoda"
            :disabled="isSaving"
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
</template>
