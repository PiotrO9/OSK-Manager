<script setup lang="ts">
import type { HeaderMetaItem } from './types';

const props = withDefaults(
    defineProps<{
        title: string;
        description?: string;
        eyebrow?: string;
        meta?: HeaderMetaItem[];
    }>(),
    {
        description: '',
        eyebrow: '',
        meta: () => [],
    },
);
</script>

<template>
    <header class="min-w-0 space-y-4">
        <div
            class="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"
        >
            <div class="min-w-0 space-y-2">
                <p
                    v-if="props.eyebrow"
                    class="text-primary text-xs font-semibold tracking-wide uppercase"
                >
                    {{ props.eyebrow }}
                </p>
                <div class="min-w-0 space-y-1.5">
                    <h1
                        class="text-foreground text-2xl leading-tight font-bold tracking-tight md:text-3xl"
                    >
                        {{ props.title }}
                    </h1>
                    <p
                        v-if="props.description"
                        class="text-muted-foreground max-w-3xl text-sm leading-relaxed"
                    >
                        {{ props.description }}
                    </p>
                </div>
            </div>

            <div
                v-if="$slots.actions"
                class="flex w-full flex-wrap gap-2 sm:w-auto lg:justify-end"
            >
                <slot name="actions" />
            </div>
        </div>

        <div v-if="props.meta.length > 0" class="flex flex-wrap gap-2">
            <StatusBadge
                v-for="item in props.meta"
                :key="`${item.label}:${item.value}`"
                :label="`${item.label}: ${item.value}`"
                :tone="item.tone ?? 'neutral'"
                subtle
            />
        </div>

        <slot name="after" />
    </header>
</template>
