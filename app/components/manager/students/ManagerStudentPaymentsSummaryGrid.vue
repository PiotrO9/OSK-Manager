<script setup lang="ts">
import type { StudentPaymentsSummary } from '~/types/payments/payment';
import {
    formatStudentPaymentAmount,
    formatStudentPaymentDate,
} from '~/utils/students/managerStudentPaymentsSection';

defineProps<{
    summary: StudentPaymentsSummary;
}>();
</script>

<template>
    <div class="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div class="bg-muted/30 rounded-lg px-3 py-2">
            <p class="text-muted-foreground text-xs">Opłacone</p>
            <p class="text-foreground mt-1 font-semibold tabular-nums">
                {{
                    formatStudentPaymentAmount(
                        summary.paidAmount,
                        summary.currency,
                    )
                }}
            </p>
        </div>
        <div class="bg-muted/30 rounded-lg px-3 py-2">
            <p class="text-muted-foreground text-xs">Do zapłaty</p>
            <p class="text-foreground mt-1 font-semibold tabular-nums">
                {{
                    formatStudentPaymentAmount(
                        summary.unpaidAmount,
                        summary.currency,
                    )
                }}
            </p>
        </div>
        <div class="bg-muted/30 rounded-lg px-3 py-2">
            <p class="text-muted-foreground text-xs">Po terminie</p>
            <p class="text-foreground mt-1 font-semibold tabular-nums">
                {{
                    formatStudentPaymentAmount(
                        summary.overdueAmount,
                        summary.currency,
                    )
                }}
            </p>
        </div>
        <div class="bg-muted/30 rounded-lg px-3 py-2">
            <p class="text-muted-foreground text-xs">Następny termin</p>
            <p class="text-foreground mt-1 font-semibold">
                {{ formatStudentPaymentDate(summary.nextDueDate) }}
            </p>
        </div>
    </div>
</template>
