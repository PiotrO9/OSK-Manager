<script setup lang="ts">
import UiDatePicker from '~/components/shadcn/date-picker/DatePicker.vue';
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

const paymentMethods = [
    { value: 'transfer', label: 'Przelew' },
    { value: 'card', label: 'Karta' },
    { value: 'cash', label: 'Gotówka' },
] as const;
</script>

<template>
    <form
        class="border-border bg-background/70 mb-4 grid gap-3 rounded-xl border p-3 lg:grid-cols-[minmax(0,1.5fr)_120px_150px_150px_auto]"
        @submit.prevent="emit('create')"
    >
        <UiSelect
            v-model="paymentPlanId"
            :disabled="paymentPlanOptions.length === 0 || isSaving"
        >
            <UiSelectTrigger
                class="bg-background h-10 w-full min-w-0 rounded-lg"
                aria-label="Plan płatności"
            >
                <UiSelectValue placeholder="Plan płatności" />
            </UiSelectTrigger>
            <UiSelectContent>
                <UiSelectItem
                    v-for="option in paymentPlanOptions"
                    :key="option.id"
                    :value="option.id"
                >
                    {{ option.label }}
                </UiSelectItem>
            </UiSelectContent>
        </UiSelect>
        <label for="student-payment-amount" class="sr-only"
            >Kwota płatności</label
        >
        <input
            id="student-payment-amount"
            v-model="amount"
            class="border-input bg-background text-foreground h-10 min-w-0 rounded-lg border px-3 text-sm"
            inputmode="decimal"
            placeholder="Kwota"
            :disabled="isSaving"
        />
        <label for="student-payment-due-date" class="sr-only"
            >Termin płatności</label
        >
        <UiDatePicker
            id="student-payment-due-date"
            v-model="dueDate"
            :disabled="isSaving"
            placeholder="Termin płatności"
            trigger-class="h-10 min-w-0 max-w-none rounded-lg"
        />
        <UiSelect v-model="method" :disabled="isSaving">
            <UiSelectTrigger
                class="bg-background h-10 w-full min-w-0 rounded-lg"
                aria-label="Metoda płatności"
            >
                <UiSelectValue placeholder="Metoda" />
            </UiSelectTrigger>
            <UiSelectContent>
                <UiSelectItem
                    v-for="paymentMethod in paymentMethods"
                    :key="paymentMethod.value"
                    :value="paymentMethod.value"
                >
                    {{ paymentMethod.label }}
                </UiSelectItem>
            </UiSelectContent>
        </UiSelect>
        <UiButton
            type="submit"
            class="h-10 rounded-lg px-3"
            :disabled="!canCreatePayment"
        >
            Dodaj
        </UiButton>
    </form>
</template>
