<script setup lang="ts">
useSeoMeta({
    description:
        'Frontend starter template z Nuxt 4, Vue 3, TypeScript i TailwindCSS',
    ogType: 'website',
});

useHead(() => ({
    bodyAttrs: {
        class: 'relative',
    },
    link: [
        {
            rel: 'icon',
            type: 'image/svg+xml',
            href: '/favicon.svg',
        },
    ],
}));
</script>

<template>
    <div
        class="min-h-dvh bg-white text-slate-950 dark:bg-slate-950 dark:text-slate-50"
    >
        <NuxtRouteAnnouncer />
        <NuxtLayout>
            <NuxtPage />
        </NuxtLayout>
        <ToastStack />
    </div>
</template>
