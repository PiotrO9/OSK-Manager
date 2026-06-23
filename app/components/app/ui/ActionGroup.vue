<script setup lang="ts">
const props = withDefaults(
    defineProps<{
        label: string;
        align?: 'start' | 'end';
        density?: 'compact' | 'normal';
    }>(),
    {
        align: 'start',
        density: 'normal',
    },
);
</script>

<template>
    <div
        class="flex flex-wrap items-center"
        :class="[
            props.align === 'end' ? 'justify-end' : 'justify-start',
            props.density === 'compact' ? 'gap-1.5' : 'gap-2',
        ]"
        role="group"
        :aria-label="props.label"
    >
        <slot />
    </div>
</template>
