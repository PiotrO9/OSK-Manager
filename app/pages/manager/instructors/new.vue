<script setup lang="ts">
definePageMeta({
    layout: 'app-shell',
    middleware: ['manager'],
});

const route = useRoute();

/**
 * Dodawanie instruktora odbywa się w modalu na liście (/manager/instructors).
 * Stary URL zostaje dla zakładek i linków zewnętrznych.
 */
await navigateTo(
    {
        path: '/manager/instructors',
        query: route.query,
    },
    { replace: true },
);
</script>

<template>
    <p class="text-muted-foreground p-6 text-sm" role="status">
        Przekierowanie do listy instruktorów…
    </p>
</template>
