<script setup lang="ts">
definePageMeta({
    layout: 'app-shell',
    middleware: ['student'],
});

usePageMeta({
    title: () => 'Moje opłaty',
    description: () => 'Lista opłat przypisanych do Twoich kursów.',
});

const page = useMyPaymentsPage();
</script>

<template>
    <div class="space-y-5">
        <PageHeader
            title="Moje opłaty"
            description="Sprawdź zaległości, nadchodzące terminy i historię rozliczeń za kursy."
        />

        <MyPaymentsFilters
            v-if="!page.errorMessage.value"
            v-model="page.activeFilter.value"
            :options="page.filterOptions.value"
            :result-label="page.resultLabel.value"
            :summary="page.activeSummary.value"
            :is-loading="page.isLoading.value"
        />

        <StudentPaymentsList
            :payments="page.visiblePayments.value"
            :is-loading="page.isLoading.value"
            :error="page.errorMessage.value"
            :show-overview="false"
            empty-label="Brak opłat w tym widoku"
            @retry="page.loadPayments"
        />
    </div>
</template>
