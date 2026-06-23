<script setup lang="ts">
const props = withDefaults(
    defineProps<{
        title?: string;
        resultLabel?: string;
        isLoading?: boolean;
    }>(),
    {
        title: 'Filtry',
        resultLabel: '',
        isLoading: false,
    },
);
</script>

<template>
    <section
        class="border-border bg-card flex min-w-0 flex-col gap-3 rounded-xl border px-4 py-3 shadow-xs md:flex-row md:items-center md:justify-between"
        :aria-busy="props.isLoading"
    >
        <div class="flex min-w-0 flex-1 flex-wrap items-center gap-2">
            <p class="text-foreground text-sm font-semibold">
                {{ props.title }}
            </p>
            <slot />
        </div>

        <div class="flex shrink-0 flex-wrap items-center gap-2 md:justify-end">
            <p
                v-if="props.resultLabel"
                class="text-muted-foreground text-xs font-semibold whitespace-nowrap"
            >
                {{ props.resultLabel }}
            </p>
            <slot name="actions" />
        </div>
    </section>
</template>
