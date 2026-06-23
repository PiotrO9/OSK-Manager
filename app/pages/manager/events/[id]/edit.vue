<script setup lang="ts">
definePageMeta({
    layout: 'app-shell',
    middleware: ['manager'],
});
</script>

<template>
    <ManagerEventEditContainer />
</template>
