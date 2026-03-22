<script setup lang="ts">
import { z } from 'zod';

const { t } = useI18n();
const localePath = useLocalePath();

usePageMeta({
    title: () => t('loginTitle'),
    description: () => t('loginMetaDescription'),
});

const route = useRoute();
const { addToast } = useToast();
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

    if (!redirectQuery) return localePath('/protected');

    if (Array.isArray(redirectQuery)) {
        const firstQuery = redirectQuery[0];
        const result = redirectQuerySchema.safeParse(firstQuery);

        if (result.success && result.data) {
            return result.data;
        }

        return localePath('/protected');
    }

    const result = redirectQuerySchema.safeParse(redirectQuery);

    if (result.success && result.data) {
        return result.data;
    }

    return localePath('/protected');
}

async function handleLogin() {
    if (isAuthenticated.value) {
        addToast({
            title: t('loginAlreadyLoggedIn'),
            description: t('loginYouCanContinue'),
            variant: 'info',
        });
        navigateTo(resolveRedirectTarget());

        return;
    }

    if (!isFormValid.value) return;

    isLoading.value = true;

    try {
        await login(emailTrimmed.value, passwordTrimmed.value);
        addToast({
            title: t('loginLoggedIn'),
            description: t('loginWelcome', {
                name: session.value?.userName || emailTrimmed.value,
            }),
            variant: 'success',
        });
        navigateTo(resolveRedirectTarget());
    } catch (err) {
        const errorMessage =
            err instanceof Error ? err.message : t('loginLoginError');

        addToast({
            title: t('loginLoginError'),
            description: errorMessage,
            variant: 'error',
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
    navigateTo(localePath('/'));
}

function handleLogoutClick() {
    handleLogout();
}
</script>

<template>
    <div class="mx-auto w-full max-w-xl space-y-6">
        <div class="space-y-2">
            <h1 class="text-2xl font-extrabold tracking-tight">
                {{ t('loginHeading') }}
            </h1>
            <p class="text-slate-700 dark:text-slate-300">
                {{ t('loginDescription') }}
            </p>
        </div>

        <Card :aria-label="`Card: ${t('commonSession')}`">
            <template #header>
                <p
                    class="text-sm font-semibold text-slate-900 dark:text-slate-50"
                >
                    {{ t('commonSession') }}
                </p>
            </template>

            <div class="space-y-4">
                <p class="text-sm text-slate-600 dark:text-slate-400">
                    {{ t('commonStatus') }}:
                    <span
                        class="font-semibold text-slate-900 dark:text-slate-50"
                    >
                        {{
                            isAuthenticated
                                ? t('commonLoggedInAs', {
                                      name: session?.userName,
                                  })
                                : t('commonLoggedOut')
                        }}
                    </span>
                </p>

                <div v-if="!isAuthenticated" class="space-y-4">
                    <div class="space-y-2">
                        <label
                            class="block text-sm font-medium text-slate-700 dark:text-slate-300"
                            for="emailInput"
                            >{{ t('loginEmail') }}</label
                        >
                        <Input
                            id="emailInput"
                            v-model="email"
                            type="email"
                            :placeholder="t('loginEmailPlaceholder')"
                            :aria-label="t('loginEmail')"
                            :is-disabled="isLoading"
                            @keydown="handleKeyDown"
                        />
                    </div>

                    <div class="space-y-2">
                        <label
                            class="block text-sm font-medium text-slate-700 dark:text-slate-300"
                            for="passwordInput"
                            >{{ t('loginPassword') }}</label
                        >
                        <Input
                            id="passwordInput"
                            v-model="password"
                            type="password"
                            :placeholder="t('loginPasswordPlaceholder')"
                            :aria-label="t('loginPassword')"
                            :is-disabled="isLoading"
                            @keydown="handleKeyDown"
                        />
                    </div>
                </div>

                <div class="flex flex-wrap gap-2">
                    <Action
                        v-if="!isAuthenticated"
                        :aria-label="t('navLogIn')"
                        :is-loading="isLoading"
                        :is-disabled="!isFormValid || isLoading"
                        @click="handleLogin"
                    >
                        {{ isLoading ? t('loginLoggingIn') : t('navLogIn') }}
                    </Action>
                    <Action
                        v-else
                        variant="secondary"
                        :aria-label="t('navLogOut')"
                        @click="handleLogoutClick"
                    >
                        {{ t('navLogOut') }}
                    </Action>

                    <Action
                        variant="ghost"
                        :aria-label="t('navGoToHome')"
                        @click="handleGoHome"
                    >
                        {{ t('commonHome') }}
                    </Action>
                </div>
            </div>
        </Card>
    </div>
</template>
