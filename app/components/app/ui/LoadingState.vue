<script setup lang="ts">
const props = withDefaults(
    defineProps<{
        title?: string;
        description?: string;
    }>(),
    {
        title: 'Wczytywanie danych',
        description: '',
    },
);
</script>

<template>
    <div
        class="border-border bg-card min-h-40 rounded-xl border p-4"
        role="status"
        aria-live="polite"
    >
        <div class="flex items-center justify-between gap-4">
            <div class="min-w-0 space-y-1">
                <p class="text-foreground text-sm font-semibold">
                    {{ props.title }}
                </p>
                <p
                    v-if="props.description"
                    class="text-muted-foreground text-sm"
                >
                    {{ props.description }}
                </p>
            </div>
            <UiBadge variant="secondary">Ładowanie</UiBadge>
        </div>

        <div class="mt-5 space-y-3">
            <UiSkeleton class="h-4 w-full" />
            <UiSkeleton class="h-4 w-[86%]" />
            <UiSkeleton class="h-4 w-[64%]" />
            <div class="grid gap-3 pt-2 sm:grid-cols-3">
                <UiSkeleton class="h-16 rounded-xl" />
                <UiSkeleton class="h-16 rounded-xl" />
                <UiSkeleton class="h-16 rounded-xl" />
            </div>
        </div>
    </div>
</template>
