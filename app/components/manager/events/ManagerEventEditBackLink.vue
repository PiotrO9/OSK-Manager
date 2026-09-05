<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router';

defineProps<{
    to: RouteLocationRaw;
}>();
</script>

<template>
    <NuxtLink
        :to="to"
        class="text-primary focus-visible:ring-ring inline-flex rounded-sm text-sm font-medium underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:outline-none"
        aria-label="Wróć do terminarza instruktora"
    >
        Wróć do terminarza instruktora
    </NuxtLink>
</template>
