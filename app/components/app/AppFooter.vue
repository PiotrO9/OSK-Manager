<script setup lang="ts">
const now = new Date();
const formattedNow = computed(() => formatDate(now, 'long'));
</script>

<template>
    <footer class="border-secondary-200 dark:border-secondary-800 border-t">
        <div
            class="text-secondary-600 dark:text-secondary-400 mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-6 text-sm md:flex-row md:items-center md:justify-between"
        >
            <p class="text-secondary-700 dark:text-secondary-300 font-medium">
                Footer
            </p>
            <p class="text-secondary-500 dark:text-secondary-400">
                Ostatnia aktualizacja:
                <span class="text-secondary-700 dark:text-secondary-300">{{
                    formattedNow
                }}</span>
            </p>
        </div>
    </footer>
</template>
