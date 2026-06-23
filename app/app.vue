<script setup lang="ts">
useSeoMeta({
    description:
        'Panel OSK Manager do obsługi kursantów, instruktorów, pojazdów, płatności i harmonogramu szkoły jazdy.',
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
    <div class="bg-background text-foreground min-h-dvh">
        <NuxtRouteAnnouncer />
        <NuxtLayout>
            <NuxtPage />
        </NuxtLayout>
        <ToastStack />
    </div>
</template>
