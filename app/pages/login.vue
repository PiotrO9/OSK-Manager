<script setup lang="ts">
import LoginPanel from '~/components/auth/LoginPanel.vue';
import LoginStory from '~/components/auth/LoginStory.vue';

definePageMeta({ layout: false });
usePageMeta({
    title: () => 'Logowanie',
    description: () =>
        'Zaloguj się do panelu szkoły, instruktora lub kursanta w OSK Manager.',
});
</script>

<template>
    <main class="login-page" aria-label="Logowanie do OSK Manager">
        <div class="login-layout">
            <LoginStory />
            <LoginPanel />
        </div>
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
    --login-ink: #172b3a;
    --login-muted: #64727e;
    --login-surface: #ffffff;
    --login-soft: #f5f7f9;
    --login-border: #dce3e9;
    --login-accent: #036d9f;
    --login-accent-soft: #edf7fc;
    display: grid;
    align-items: center;
    min-height: 100dvh;
    padding: 24px;
    background: #f0f3f5;
    color: var(--login-ink);
    font-family: 'Manrope', sans-serif;
    -webkit-font-smoothing: antialiased;
}
.login-layout {
    display: grid;
    grid-template-columns: 1fr 1fr;
    width: 100%;
    max-width: 1512px;
    margin-inline: auto;
    overflow: hidden;
    border: 1px solid #e4e9ed;
    border-radius: 24px;
    background: var(--login-surface);
    box-shadow: 0 16px 64px #19384f08;
}
:global(.dark .login-page) {
    --login-ink: #e7eff5;
    --login-muted: #a5b6c5;
    --login-surface: #142330;
    --login-soft: #1b2e3d;
    --login-border: #354958;
    --login-accent: #7dd3fc;
    --login-accent-soft: #1b3445;
    background: #0b1721;
}
:global(.dark .login-layout) {
    border-color: #243746;
}
@media (max-width: 959px) {
    .login-page {
        padding: 16px;
    }
    .login-layout {
        grid-template-columns: 1fr;
        min-height: calc(100dvh - 32px);
        max-width: 640px;
        border-radius: 20px;
    }
}
@media (max-width: 479px) {
    .login-page {
        padding: 0;
    }
    .login-layout {
        min-height: 100dvh;
        border: 0;
        border-radius: 0;
    }
}
</style>
