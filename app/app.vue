<script setup lang="ts">
import { showAuthPrivacyCurtain } from '~/utils/auth/authPrivacyCurtain';
import { AUTH_LOGOUT_STORAGE_KEY } from '~/utils/auth/authLogoutSignal';
import { isPublicAuthPath } from '~~/shared/utils/publicAuthPath';

function coverBeforeLeaving(): void {
    if (!isPublicAuthPath(window.location.pathname)) {
        showAuthPrivacyCurtain();
    }
}

function verifyRestoredPage(event: PageTransitionEvent): void {
    if (!event.persisted || isPublicAuthPath(window.location.pathname)) return;

    showAuthPrivacyCurtain();
    window.location.reload();
}

function redirectAfterLogoutInOtherTab(event: StorageEvent): void {
    if (
        event.key !== AUTH_LOGOUT_STORAGE_KEY ||
        isPublicAuthPath(window.location.pathname)
    ) {
        return;
    }

    showAuthPrivacyCurtain();
    window.location.replace('/login');
}

onMounted(() => {
    window.addEventListener('pagehide', coverBeforeLeaving);
    window.addEventListener('pageshow', verifyRestoredPage);
    window.addEventListener('storage', redirectAfterLogoutInOtherTab);
});

onUnmounted(() => {
    window.removeEventListener('pagehide', coverBeforeLeaving);
    window.removeEventListener('pageshow', verifyRestoredPage);
    window.removeEventListener('storage', redirectAfterLogoutInOtherTab);
});

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
