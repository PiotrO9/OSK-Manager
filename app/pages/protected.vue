<script setup lang="ts">
definePageMeta({
    middleware: ['auth'],
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
                Ta strona używa `middleware/auth`. Jeśli brakuje pliku cookie
                sesji, zostaniesz przekierowany do `/login`.
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
                <p class="break-all text-slate-500 dark:text-slate-500">
                    Token:
                    <span
                        class="font-mono text-slate-700 dark:text-slate-300"
                        >{{ session?.token }}</span
                    >
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
