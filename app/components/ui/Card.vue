<script setup lang="ts">
interface Props {
    ariaLabel?: string;
}

withDefaults(defineProps<Props>(), {
    ariaLabel: 'Karta',
});
</script>

<template>
    <section
        :aria-label="ariaLabel"
        class="border-secondary-200 dark:border-secondary-800 dark:bg-secondary-900 min-w-0 rounded-2xl border bg-white p-5"
    >
        <div v-if="$slots.header" class="mb-3">
            <slot name="header" />
        </div>
        <div class="text-secondary-700 dark:text-secondary-300">
            <slot />
        </div>
        <div
            v-if="$slots.footer"
            class="border-secondary-200 dark:border-secondary-800 mt-4 border-t pt-4"
        >
            <slot name="footer" />
        </div>
    </section>
</template>
