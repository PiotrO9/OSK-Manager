<script setup lang="ts">
import LoginLayout from '~/components/auth/LoginLayout.vue';

definePageMeta({ layout: false });
usePageMeta({
    title: () => 'Logowanie',
    description: () =>
        'Zaloguj się do panelu szkoły, instruktora lub kursanta w OSK Manager.',
});
</script>

<template>
    <main class="login-page" aria-label="Logowanie do OSK Manager">
        <LoginLayout />
    </main>
</template>

<style scoped>
.login-page {
    font-family: 'Satoshi', sans-serif;
    -webkit-font-smoothing: antialiased;
}
</style>
