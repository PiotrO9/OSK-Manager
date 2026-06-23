<script setup lang="ts">
const props = withDefaults(
    defineProps<{
        title?: string;
        description?: string;
        isLoading?: boolean;
        errorMessage?: string | null;
        emptyTitle?: string;
        emptyDescription?: string;
    }>(),
    {
        title: '',
        description: '',
        isLoading: false,
        errorMessage: null,
        emptyTitle: 'Brak danych',
        emptyDescription: '',
    },
);

const emit = defineEmits<{
    retry: [];
}>();
</script>

<template>
    <section
        class="border-border bg-card min-w-0 overflow-hidden rounded-xl border shadow-xs"
        :aria-busy="props.isLoading"
    >
        <div
            v-if="props.title || props.description || $slots.toolbar"
            class="border-border flex flex-col gap-3 border-b px-4 py-4 md:flex-row md:items-center md:justify-between md:px-5"
        >
            <div
                v-if="props.title || props.description"
                class="min-w-0 space-y-1"
            >
                <h2
                    v-if="props.title"
                    class="text-foreground text-base font-semibold"
                >
                    {{ props.title }}
                </h2>
                <p
                    v-if="props.description"
                    class="text-muted-foreground text-sm"
                >
                    {{ props.description }}
                </p>
            </div>
            <div
                v-if="$slots.toolbar"
                class="flex shrink-0 flex-wrap gap-2 md:justify-end"
            >
                <slot name="toolbar" />
            </div>
        </div>

        <div class="min-w-0">
            <LoadingState
                v-if="props.isLoading"
                title="Wczytywanie listy"
                class="m-4"
            />
            <ErrorState
                v-else-if="props.errorMessage"
                title="Błąd danych"
                :description="props.errorMessage"
                class="m-4"
                @retry="emit('retry')"
            />
            <EmptyState
                v-else-if="!$slots.default && !$slots.mobile"
                :title="props.emptyTitle"
                :description="props.emptyDescription"
                class="m-4"
            >
                <template v-if="$slots['empty-action']" #action>
                    <slot name="empty-action" />
                </template>
            </EmptyState>
            <template v-else>
                <div
                    v-if="$slots.default"
                    class="overflow-x-auto"
                    :class="$slots.mobile ? 'hidden md:block' : ''"
                >
                    <slot />
                </div>
                <div v-if="$slots.mobile" class="md:hidden">
                    <slot name="mobile" />
                </div>
            </template>
        </div>

        <div
            v-if="$slots.pagination && !props.isLoading && !props.errorMessage"
            class="border-border bg-muted/20 border-t px-4 py-3 md:px-5"
        >
            <slot name="pagination" />
        </div>
    </section>
</template>
