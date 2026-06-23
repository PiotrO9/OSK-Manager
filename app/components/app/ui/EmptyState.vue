<script setup lang="ts">
import { Inbox } from 'lucide-vue-next';

const props = withDefaults(
    defineProps<{
        title?: string;
        description?: string;
    }>(),
    {
        title: 'Brak danych',
        description: '',
    },
);
</script>

<template>
    <div
        class="border-border bg-muted/20 flex min-h-40 flex-col items-center justify-center rounded-xl border border-dashed px-6 py-10 text-center"
        role="status"
    >
        <div
            class="bg-background text-muted-foreground border-border flex size-10 items-center justify-center rounded-xl border"
            aria-hidden="true"
        >
            <Inbox class="size-5" />
        </div>
        <p class="text-foreground mt-4 font-semibold">
            {{ props.title }}
        </p>
        <p
            v-if="props.description"
            class="text-muted-foreground mt-1 max-w-md text-sm leading-relaxed"
        >
            {{ props.description }}
        </p>
        <div
            v-if="$slots.action"
            class="mt-4 flex flex-wrap justify-center gap-2"
        >
            <slot name="action" />
        </div>
    </div>
</template>
