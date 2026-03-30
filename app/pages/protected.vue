<script setup lang="ts">
definePageMeta({
    layout: 'app-shell',
});

usePageMeta({
    title: () => 'Chronione',
    description: () => 'Strona chroniona wymagająca uwierzytelnienia.',
});

const { session } = useAuthSession();
const { handleLogout } = useLogout();

function handleGoHome() {
    navigateTo('/');
}
</script>

<template>
    <div class="mx-auto w-full max-w-3xl space-y-6">
        <div class="space-y-2">
            <h1 class="text-2xl font-extrabold tracking-tight">Chronione</h1>
            <p class="text-slate-700 dark:text-slate-300">
                Ta strona jest chroniona globalnym middleware. Bez ważnej sesji
                nastąpi przekierowanie do logowania.
            </p>
        </div>

        <Card :aria-label="`Card: Sesja`">
            <template #header>
                <p
                    class="text-sm font-semibold text-slate-900 dark:text-slate-50"
                >
                    Sesja
                </p>
            </template>

            <div class="space-y-2 text-sm">
                <p class="text-slate-600 dark:text-slate-400">
                    Zalogowany jako:
                    <span
                        class="font-semibold text-slate-900 dark:text-slate-50"
                        >{{ session?.userName }}</span
                    >
                </p>
                <p
                    v-if="session?.role"
                    class="text-slate-600 dark:text-slate-400"
                >
                    Rola:
                    <span
                        class="font-semibold text-slate-900 dark:text-slate-50"
                        >{{ session.role }}</span
                    >
                </p>
                <p class="text-slate-500 dark:text-slate-500">
                    Access token jest w ciasteczku
                    <span class="font-mono">httpOnly</span> — nie jest dostępny
                    dla JavaScriptu w przeglądarce.
                </p>
            </div>

            <template #footer>
                <div class="flex flex-wrap gap-2">
                    <Action
                        variant="secondary"
                        :aria-label="'Wyloguj się'"
                        @click="handleLogout"
                    >
                        Wyloguj się
                    </Action>
                    <Action
                        variant="ghost"
                        :aria-label="'Przejdź do strony głównej'"
                        @click="handleGoHome"
                    >
                        Strona główna
                    </Action>
                </div>
            </template>
        </Card>
    </div>
</template>
