<script setup lang="ts">
const props = withDefaults(
    defineProps<{
        title?: string;
        description?: string;
    }>(),
    {
        title: '',
        description: '',
    },
);
</script>

<template>
    <section class="border-border bg-card rounded-lg border shadow-xs">
        <div
            v-if="props.title || props.description"
            class="border-border border-b px-4 py-4 md:px-5"
        >
            <h2
                v-if="props.title"
                class="text-foreground text-base font-semibold"
            >
                {{ props.title }}
            </h2>
            <p
                v-if="props.description"
                class="text-muted-foreground mt-1 text-sm leading-relaxed"
            >
                {{ props.description }}
            </p>
        </div>
        <div class="px-4 py-4 md:px-5">
            <slot />
        </div>
        <div
            v-if="$slots.footer"
            class="border-border bg-muted/20 border-t px-4 py-3 md:px-5"
        >
            <slot name="footer" />
        </div>
    </section>
</template>
