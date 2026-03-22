<script setup lang="ts">
import type { BreadcrumbItem } from '~/components/ui/Breadcrumbs.vue';

const { t } = useI18n();
const localePath = useLocalePath();

const breadcrumbItems = computed<BreadcrumbItem[]>(() => [
    { label: t('navHome'), to: localePath('/') },
    { label: t('designSystemTitle'), to: localePath('/design-system') },
    { label: t('designSystemBreadcrumbComponents') },
]);
</script>

<template>
    <Card aria-label="Card: Breadcrumbs">
        <template #header>
            <p class="text-sm font-semibold text-slate-900 dark:text-slate-50">
                Breadcrumbs
            </p>
        </template>

        <div class="space-y-6">
            <div class="space-y-3">
                <p
                    class="text-sm font-semibold text-slate-900 dark:text-slate-50"
                >
                    Example
                </p>
                <Breadcrumbs :items="breadcrumbItems" aria-label="Breadcrumb" />
            </div>
        </div>
    </Card>
</template>
