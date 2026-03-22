<script setup lang="ts">
const { t } = useI18n();
const localePath = useLocalePath();

usePageMeta({
    title: () => t('homeTitle'),
    description: () => t('homeMetaDescription'),
});

const { addToast } = useToast();

function handleGoToProtected() {
    addToast({
        title: t('homeNavigationToast'),
        description: t('homeGoingToProtected'),
        variant: 'info',
    });
    navigateTo(localePath('/protected'));
}
</script>

<template>
    <div class="space-y-8">
        <section
            class="rounded-3xl border border-slate-200 bg-linear-to-br from-white to-slate-50 p-8 dark:border-slate-800 dark:from-slate-900 dark:to-slate-950"
        >
            <h1
                class="text-3xl font-extrabold tracking-tight text-balance md:text-4xl"
            >
                {{ t('homeHeading') }}
            </h1>
            <p
                class="mt-3 max-w-2xl text-pretty text-slate-700 dark:text-slate-300"
            >
                {{ t('homeIntro') }}
            </p>
            <div class="mt-6 flex flex-wrap gap-3">
                <Action
                    variant="secondary"
                    :aria-label="t('homeGoToProtected')"
                    @click="handleGoToProtected"
                >
                    {{ t('homeGoToProtected') }}
                </Action>
            </div>
        </section>

        <section class="grid gap-4 md:grid-cols-3">
            <Card :aria-label="`Card: ${t('homeAuthMiddleware')}`">
                <template #header>
                    <p
                        class="text-sm font-semibold text-slate-900 dark:text-slate-50"
                    >
                        {{ t('homeAuthMiddleware') }}
                    </p>
                </template>
                <p class="text-sm text-slate-600 dark:text-slate-400">
                    {{ t('homeAuthMiddlewareDesc') }}
                </p>
                <template #footer>
                    <NuxtLink
                        :to="localePath('/protected')"
                        class="inline-flex rounded-xl px-3 py-2 text-sm font-semibold text-sky-700 transition hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:text-sky-400 dark:hover:bg-slate-800 dark:focus-visible:ring-offset-slate-950"
                        :aria-label="t('navGoToProtected')"
                    >
                        {{ t('homeCheckProtected') }}
                    </NuxtLink>
                </template>
            </Card>

            <Card :aria-label="`Card: ${t('homeComposables')}`">
                <template #header>
                    <p
                        class="text-sm font-semibold text-slate-900 dark:text-slate-50"
                    >
                        {{ t('homeComposables') }}
                    </p>
                </template>
                <p class="text-sm text-slate-600 dark:text-slate-400">
                    {{ t('homeComposablesDesc') }}
                </p>
                <template #footer>
                    <NuxtLink
                        :to="localePath('/login')"
                        class="inline-flex rounded-xl px-3 py-2 text-sm font-semibold text-sky-700 transition hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:text-sky-400 dark:hover:bg-slate-800 dark:focus-visible:ring-offset-slate-950"
                        :aria-label="t('navGoToLogin')"
                    >
                        {{ t('homeOpenLogin') }}
                    </NuxtLink>
                </template>
            </Card>
        </section>
    </div>
</template>
