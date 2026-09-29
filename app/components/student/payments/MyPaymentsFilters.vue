<script setup lang="ts">
import type { MyPaymentsToolbarSummary } from '~/composables/payments/useMyPaymentsPage';
import type { MyPaymentsFilter } from '~/utils/payments/myPaymentsPage';

interface FilterOption {
    value: MyPaymentsFilter;
    label: string;
    count: number;
}

const props = defineProps<{
    options: readonly FilterOption[];
    resultLabel: string;
    summary: MyPaymentsToolbarSummary;
    isLoading: boolean;
}>();

const model = defineModel<MyPaymentsFilter>({ required: true });
</script>

<template>
    <section
        class="border-border bg-card flex min-w-0 flex-col gap-3 rounded-lg border px-4 py-3 shadow-xs md:flex-row md:items-center md:justify-between md:gap-6"
        :aria-busy="props.isLoading"
        aria-label="Filtrowanie opłat"
    >
        <div class="flex min-w-0 flex-col gap-2">
            <div
                class="flex min-w-0 flex-wrap items-center gap-2"
                role="group"
                aria-label="Pokaż opłaty"
            >
                <span class="text-foreground mr-1 text-sm font-semibold">
                    Płatności
                </span>
                <button
                    v-for="option in props.options"
                    :key="option.value"
                    type="button"
                    class="focus-visible:ring-ring min-h-9 cursor-pointer rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:ring-2 focus-visible:outline-none"
                    :class="
                        model === option.value
                            ? 'border-primary-300 bg-primary-50 text-primary-800 dark:border-primary-500/50 dark:bg-primary-500/15 dark:text-primary-200'
                            : 'border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground'
                    "
                    :aria-pressed="model === option.value"
                    :disabled="props.isLoading"
                    @click="model = option.value"
                >
                    {{ option.label }}
                    <span class="ml-1 tabular-nums">{{ option.count }}</span>
                </button>
            </div>

            <p
                class="text-muted-foreground text-xs font-medium"
                aria-live="polite"
            >
                {{ props.isLoading ? 'Wczytywanie…' : props.resultLabel }}
            </p>
        </div>

        <div
            class="border-border min-w-0 border-t pt-3 md:max-w-[30rem] md:border-t-0 md:pt-0 md:text-right"
            aria-live="polite"
        >
            <template v-if="props.isLoading">
                <div
                    class="bg-muted ml-0 h-5 w-36 animate-pulse rounded motion-reduce:animate-none md:ml-auto"
                    aria-hidden="true"
                />
                <span class="sr-only">Wczytywanie podsumowania opłat…</span>
            </template>
            <template v-else>
                <p
                    class="text-foreground text-base leading-tight font-bold tabular-nums"
                >
                    {{ props.summary.primary }}
                </p>
                <p
                    class="mt-1 text-xs leading-snug font-medium"
                    :class="{
                        'text-danger-700 dark:text-danger-300':
                            props.summary.tone === 'danger',
                        'text-success-700 dark:text-success-300':
                            props.summary.tone === 'success',
                        'text-muted-foreground':
                            props.summary.tone === 'neutral',
                    }"
                >
                    {{ props.summary.secondary }}
                </p>
            </template>
        </div>
    </section>
</template>
