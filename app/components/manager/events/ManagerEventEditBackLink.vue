<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router';

defineProps<{
    to: RouteLocationRaw;
    label?: string;
}>();
</script>

<template>
    <UiButton as-child variant="link" class="h-auto justify-start px-0">
        <NuxtLink
            :to="to"
            :aria-label="label ?? 'Wróć do terminarza instruktora'"
        >
            {{ label ?? 'Wróć do terminarza instruktora' }}
        </NuxtLink>
    </UiButton>
</template>
