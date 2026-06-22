<script setup lang="ts">
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
const isLoading = ref(false);
const errorMessage = ref<string | null>(null);

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
    <div class="space-y-6">
        <div class="space-y-1">
            <h1 class="text-foreground text-2xl font-semibold tracking-tight">
                Moje opłaty
            </h1>
            <p class="text-muted-foreground text-sm">
                Historia opłat i statusy płatności dla Twoich kursów.
            </p>
        </div>

        <section class="border-border rounded-lg border p-4 md:p-6">
            <StudentPaymentsList
                :payments="payments"
                :is-loading="isLoading"
                :error="errorMessage"
            />
        </section>
    </div>
</template>
