<script setup lang="ts">
import { CreditCard } from 'lucide-vue-next';
import type { StudentPaymentItem } from '~/types/payments/payment';

defineProps<{
    payments: readonly StudentPaymentItem[];
    isLoading: boolean;
    error: string | null;
}>();
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
        <StudentPaymentsList
            :payments="payments"
            :is-loading="isLoading"
            :error="error"
        />
    </section>
</template>
