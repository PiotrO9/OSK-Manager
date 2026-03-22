<script setup lang="ts">
import { z } from 'zod';

usePageMeta({
    title: () => 'Logowanie',
    description: () => 'Zaloguj się do aplikacji.',
});

const route = useRoute();
const { isAuthenticated, session, login } = useAuthSession();
const { handleLogout } = useLogout();

const redirectQuerySchema = z.string().min(1).optional();

const email = ref('');
const password = ref('');
const isLoading = ref(false);

const emailTrimmed = computed(() => email.value.trim());
const passwordTrimmed = computed(() => password.value.trim());
const isFormValid = computed(
    () => emailTrimmed.value.length > 0 && passwordTrimmed.value.length > 0,
);

function resolveRedirectTarget(): string {
    const redirectQuery = route.query.redirect;

    if (!redirectQuery) return '/protected';

    if (Array.isArray(redirectQuery)) {
        const firstQuery = redirectQuery[0];
        const result = redirectQuerySchema.safeParse(firstQuery);

        if (result.success && result.data) {
            return result.data;
        }

        return '/protected';
    }

    const result = redirectQuerySchema.safeParse(redirectQuery);

    if (result.success && result.data) {
        return result.data;
    }

    return '/protected';
}

async function handleLogin() {
    if (isAuthenticated.value) {
        useToast().add({
            title: 'Już zalogowany',
            description: 'Możesz kontynuować.',
            variant: 'info',
        });
        navigateTo(resolveRedirectTarget());

        return;
    }

    if (!isFormValid.value) return;

    isLoading.value = true;

    try {
        await login(emailTrimmed.value, passwordTrimmed.value);
        useToast().add({
            title: 'Zalogowano',
            description: `Witaj, ${session.value?.userName || emailTrimmed.value}!`,
            variant: 'success' as ToastVariant,
        });
        navigateTo(resolveRedirectTarget());
    } catch (err) {
        const errorMessage =
            err instanceof Error ? err.message : 'Błąd logowania';

        useToast().add({
            title: 'Błąd logowania',
            description: errorMessage,
            variant: 'danger' as ToastVariant,
        });
    } finally {
        isLoading.value = false;
    }
}

function handleKeyDown(event: KeyboardEvent) {
    if (isEnterOrSpaceKey(event)) {
        handleLogin();
    }
}

function handleGoHome() {
    navigateTo('/');
}

function handleLogoutClick() {
    handleLogout();
}
</script>

<template>
    <div class="mx-auto w-full max-w-xl space-y-6">
        <div class="space-y-2">
            <h1 class="text-2xl font-extrabold tracking-tight">Logowanie</h1>
            <p class="text-slate-700 dark:text-slate-300">
                Zaloguj się używając adresu e-mail i hasła. Tokeny JWT są
                przechowywane w bezpiecznych plikach cookie HTTP-only.
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

            <div class="space-y-4">
                <p class="text-sm text-slate-600 dark:text-slate-400">
                    Status:
                    <span
                        class="font-semibold text-slate-900 dark:text-slate-50"
                    >
                        {{
                            isAuthenticated
                                ? `Zalogowany jako: ${session?.userName}`
                                : 'Wylogowany'
                        }}
                    </span>
                </p>

                <div v-if="!isAuthenticated" class="space-y-4">
                    <div class="space-y-2">
                        <label
                            class="block text-sm font-medium text-slate-700 dark:text-slate-300"
                            for="emailInput"
                            >Email</label
                        >
                        <Input
                            id="emailInput"
                            v-model="email"
                            type="email"
                            :placeholder="'np. jan@example.com'"
                            :aria-label="'Email'"
                            :is-disabled="isLoading"
                            @keydown="handleKeyDown"
                        />
                    </div>

                    <div class="space-y-2">
                        <label
                            class="block text-sm font-medium text-slate-700 dark:text-slate-300"
                            for="passwordInput"
                            >Hasło</label
                        >
                        <Input
                            id="passwordInput"
                            v-model="password"
                            type="password"
                            :placeholder="'Wprowadź hasło'"
                            :aria-label="'Hasło'"
                            :is-disabled="isLoading"
                            @keydown="handleKeyDown"
                        />
                    </div>
                </div>

                <div class="flex flex-wrap gap-2">
                    <Action
                        v-if="!isAuthenticated"
                        :aria-label="'Zaloguj się'"
                        :is-loading="isLoading"
                        :is-disabled="!isFormValid || isLoading"
                        @click="handleLogin"
                    >
                        {{ isLoading ? 'Ładowanie...' : 'Zaloguj się' }}
                    </Action>
                    <Action
                        v-else
                        variant="secondary"
                        :aria-label="'Wyloguj się'"
                        @click="handleLogoutClick"
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
            </div>
        </Card>
    </div>
</template>
