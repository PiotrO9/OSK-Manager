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
@font-face {
    font-family: 'Manrope';
    src: url('/fonts/manrope/Manrope-Variable.ttf') format('truetype');
    font-style: normal;
    font-weight: 200 800;
    font-display: swap;
}
.login-page {
    font-family: 'Manrope', sans-serif;
    -webkit-font-smoothing: antialiased;
}
</style>
