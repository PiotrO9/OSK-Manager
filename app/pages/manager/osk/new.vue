<script setup lang="ts">
definePageMeta({
    layout: 'app-shell',
    middleware: ['manager'],
});

/**
 * Dodawanie OSK odbywa się w modalu na liście (/manager/osk).
 * Stary URL zostaje dla zakładek i linków zewnętrznych.
 */
await navigateTo('/manager/osk', { replace: true });
</script>

<template>
    <p class="text-muted-foreground p-6 text-sm" role="status">
        Przekierowanie do listy szkół…
    </p>
</template>
