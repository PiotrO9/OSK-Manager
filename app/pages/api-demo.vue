<script setup lang="ts">
const { t } = useI18n();

usePageMeta({
    title: () => t('apiDemoTitle'),
    description: () => t('apiDemoMetaDescription'),
});

const apiGet = useApi<{
    id: number;
    title: string;
    body: string;
    userId: number;
}>('GET', '/posts/1');

const postBody = ref({
    title: 'Test Post',
    body: 'This is an example post',
    userId: 1,
});

const apiPost = useApi<{ id: number; title: string; body: string }>(
    'POST',
    '/posts',
    {
        body: postBody,
    },
);

function handleApiGet() {
    apiGet.execute();
}

function handleApiPost() {
    apiPost.execute();
}
</script>

<template>
    <div class="space-y-6">
        <div class="flex flex-col gap-2">
            <h1 class="text-2xl font-extrabold tracking-tight">
                {{ t('apiDemoHeading') }}
            </h1>
            <p class="text-slate-700 dark:text-slate-300">
                {{ t('apiDemoDescription') }}
            </p>
        </div>

        <Card :aria-label="`Card: ${t('apiDemoApiExamples')}`">
            <template #header>
                <p
                    class="text-sm font-semibold text-slate-900 dark:text-slate-50"
                >
                    {{ t('apiDemoApiExamples') }}
                </p>
            </template>

            <div class="space-y-4">
                <div class="space-y-2">
                    <p class="text-sm text-slate-600 dark:text-slate-400">
                        {{ t('apiDemoUseApiDesc') }}
                    </p>
                    <div class="flex flex-wrap gap-3">
                        <Action
                            :is-loading="apiGet.isLoading.value"
                            :is-disabled="apiGet.isLoading.value"
                            :aria-label="t('apiDemoGetRequest')"
                            @click="handleApiGet"
                        >
                            {{
                                apiGet.isLoading.value
                                    ? t('apiDemoLoading')
                                    : t('apiDemoGetRequest')
                            }}
                        </Action>
                        <Action
                            variant="secondary"
                            :is-loading="apiPost.isLoading.value"
                            :is-disabled="apiPost.isLoading.value"
                            :aria-label="t('apiDemoPostRequest')"
                            @click="handleApiPost"
                        >
                            {{
                                apiPost.isLoading.value
                                    ? t('apiDemoLoading')
                                    : t('apiDemoPostRequest')
                            }}
                        </Action>
                    </div>
                </div>

                <div
                    v-if="apiGet.data.value || apiGet.error.value"
                    class="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900"
                >
                    <p
                        class="mb-2 text-xs font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400"
                    >
                        {{ t('apiDemoGetResponse') }}
                    </p>
                    <pre
                        class="overflow-auto text-xs text-slate-700 dark:text-slate-300"
                        >{{
                            JSON.stringify(
                                apiGet.data.value || apiGet.error.value,
                                null,
                                2,
                            )
                        }}</pre
                    >
                </div>

                <div
                    v-if="apiPost.data.value || apiPost.error.value"
                    class="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900"
                >
                    <p
                        class="mb-2 text-xs font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400"
                    >
                        {{ t('apiDemoPostResponse') }}
                    </p>
                    <pre
                        class="overflow-auto text-xs text-slate-700 dark:text-slate-300"
                        >{{
                            JSON.stringify(
                                apiPost.data.value || apiPost.error.value,
                                null,
                                2,
                            )
                        }}</pre
                    >
                </div>
            </div>
        </Card>
    </div>
</template>
