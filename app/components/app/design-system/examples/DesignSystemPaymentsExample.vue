<script setup lang="ts">
import {
    designSystemPayments,
    designSystemPaymentsSummary,
} from '~/data/design-system/fixtures';

const state = shallowRef<'data' | 'loading' | 'error'>('data');
</script>

<template>
    <div class="space-y-4">
        <ManagerStudentPaymentsSummaryGrid
            :summary="designSystemPaymentsSummary"
        />
        <div
            class="flex flex-wrap gap-2"
            role="group"
            aria-label="Stan płatności"
        >
            <UiButton
                v-for="option in ['data', 'loading', 'error'] as const"
                :key="option"
                size="sm"
                :variant="state === option ? 'default' : 'outline'"
                @click="state = option"
                >{{
                    option === 'data'
                        ? 'Dane'
                        : option === 'loading'
                          ? 'Ładowanie'
                          : 'Błąd'
                }}</UiButton
            >
        </div>
        <StudentPaymentsList
            :payments="state === 'data' ? designSystemPayments : []"
            :is-loading="state === 'loading'"
            :error="
                state === 'error' ? 'Nie udało się pobrać płatności.' : null
            "
            @retry="state = 'data'"
        />
    </div>
</template>
