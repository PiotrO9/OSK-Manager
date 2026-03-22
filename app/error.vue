<script setup lang="ts">
import type { NuxtError } from '#app';

const error = useError() as Ref<NuxtError | null>;

const title = computed(() => {
    const statusCode = error.value?.statusCode;

    if (statusCode === 404) return 'Page not found (404)';

    if (statusCode) return `Error (${statusCode})`;

    return 'Something went wrong';
});

const description = computed(() => {
    const message = error.value?.message;

    if (typeof message === 'string' && message.trim()) return message;

    return 'Try going back to the home page or retry the action.';
});

function handleGoHome() {
    clearError({ redirect: '/' });
}

function handleTryAgain() {
    clearError();
}
</script>

<template>
    <div
        class="min-h-dvh bg-white text-slate-950 dark:bg-slate-950 dark:text-slate-50"
    >
        <div class="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-12">
            <div class="space-y-2">
                <p class="text-sm font-semibold text-rose-300">
                    An error occurred
                </p>
                <h1 class="text-3xl font-extrabold tracking-tight text-balance">
                    {{ title }}
                </h1>
                <p
                    v-if="description"
                    class="text-pretty text-slate-700 dark:text-slate-300"
                >
                    {{ description }}
                </p>
            </div>

            <Card aria-label="Card: Error actions">
                <template #header>
                    <p
                        class="text-sm font-semibold text-slate-900 dark:text-slate-50"
                    >
                        What would you like to do?
                    </p>
                </template>

                <div class="flex flex-wrap gap-2">
                    <Action
                        aria-label="Go back to home page"
                        @click="handleGoHome"
                        >Home</Action
                    >
                    <Action
                        variant="secondary"
                        aria-label="Try again"
                        @click="handleTryAgain"
                        >Try again</Action
                    >
                </div>
            </Card>
        </div>
    </div>
</template>
