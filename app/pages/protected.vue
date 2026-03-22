<script setup lang="ts">
definePageMeta({
    middleware: ['auth'],
});

const { t } = useI18n();
const localePath = useLocalePath();

usePageMeta({
    title: () => t('protectedTitle'),
    description: () => t('protectedMetaDescription'),
});

const { session } = useAuthSession();
const { handleLogout } = useLogout();

function handleGoHome() {
    navigateTo(localePath('/'));
}
</script>

<template>
    <div class="mx-auto w-full max-w-3xl space-y-6">
        <div class="space-y-2">
            <h1 class="text-2xl font-extrabold tracking-tight">
                {{ t('protectedHeading') }}
            </h1>
            <p class="text-slate-700 dark:text-slate-300">
                {{ t('protectedDescription') }}
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

            <div class="space-y-2 text-sm">
                <p class="text-slate-600 dark:text-slate-400">
                    {{ t('protectedLoggedInAs') }}
                    <span
                        class="font-semibold text-slate-900 dark:text-slate-50"
                        >{{ session?.userName }}</span
                    >
                </p>
                <p class="break-all text-slate-500 dark:text-slate-500">
                    {{ t('protectedToken') }}
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
                        :aria-label="t('navLogOut')"
                        @click="handleLogout"
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
            </template>
        </Card>
    </div>
</template>
