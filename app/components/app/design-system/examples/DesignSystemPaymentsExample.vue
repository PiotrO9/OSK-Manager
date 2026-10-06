<script setup lang="ts">
import {
    designSystemPayments,
    buildDesignSystemPaymentsSummary,
    designSystemReferenceDate,
} from '~/data/design-system/fixtures';
import {
    filterMyPayments,
    sortMyPayments,
    getMyPaymentsToolbarSummary,
    type MyPaymentsFilter,
} from '~/utils/payments/myPaymentsPage';
import { formatPolishCount } from '~/utils/text/polishPlural';
const scenario = shallowRef('data');
const activeFilter = shallowRef<MyPaymentsFilter>('UNPAID');
const payments = computed(() =>
    scenario.value === 'empty' ? [] : designSystemPayments,
);
const summary = computed(() =>
    buildDesignSystemPaymentsSummary(payments.value),
);
const visiblePayments = computed(() =>
    scenario.value === 'no-results'
        ? []
        : filterMyPayments(
              sortMyPayments(payments.value, designSystemReferenceDate),
              activeFilter.value,
              designSystemReferenceDate,
          ),
);
const filterOptions = computed(() => [
    {
        value: 'UNPAID' as const,
        label: 'Do opłacenia',
        count: payments.value.filter((item) => item.status === 'UNPAID').length,
    },
    { value: 'ALL' as const, label: 'Wszystkie', count: payments.value.length },
    {
        value: 'PAID' as const,
        label: 'Opłacone',
        count: payments.value.filter((item) => item.status === 'PAID').length,
    },
]);
const activeSummary = computed(() =>
    getMyPaymentsToolbarSummary(
        payments.value,
        summary.value,
        activeFilter.value,
    ),
);
</script>
<template>
    <div class="space-y-5">
        <DesignSystemScenarioControls
            v-model="scenario"
            label="Scenariusz opłat"
            :scenarios="['data', 'empty', 'loading', 'error']"
        />
        <PageHeader
            title="Moje opłaty"
            description="Sprawdź zaległości, nadchodzące terminy i historię rozliczeń za kursy."
        />
        <MyPaymentsFilters
            v-if="scenario !== 'error'"
            v-model="activeFilter"
            :options="filterOptions"
            :result-label="
                formatPolishCount(visiblePayments.length, [
                    'wynik',
                    'wyniki',
                    'wyników',
                ])
            "
            :summary="activeSummary"
            :is-loading="scenario === 'loading'"
        />
        <StudentPaymentsList
            :payments="visiblePayments"
            :reference-date="designSystemReferenceDate"
            :show-overview="false"
            :is-loading="scenario === 'loading'"
            :error="scenario === 'error' ? 'Nie udało się pobrać opłat.' : null"
            empty-label="Brak opłat w tym widoku"
            @retry="scenario = 'data'"
        />
    </div>
</template>
