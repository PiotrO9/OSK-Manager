<template>
    <Card aria-label="Card: Skeleton">
        <template #header>
            <p class="text-sm font-semibold text-slate-900 dark:text-slate-50">
                Skeleton
            </p>
        </template>

        <div class="space-y-6">
            <div class="space-y-3">
                <p
                    class="text-sm font-semibold text-slate-900 dark:text-slate-50"
                >
                    Variants
                </p>
                <div class="space-y-2">
                    <Skeleton variant="pulse" />
                    <Skeleton variant="wave" />
                    <Skeleton variant="default" />
                </div>
            </div>

            <div class="space-y-3">
                <p
                    class="text-sm font-semibold text-slate-900 dark:text-slate-50"
                >
                    Different shapes
                </p>
                <div class="space-y-2">
                    <Skeleton rounded="none" width="100%" height="1rem" />
                    <Skeleton rounded="sm" width="80%" height="1rem" />
                    <Skeleton rounded="md" width="60%" height="1rem" />
                    <Skeleton rounded="lg" width="40%" height="1rem" />
                    <Skeleton rounded="full" width="2rem" height="2rem" />
                </div>
            </div>

            <div class="space-y-3">
                <p
                    class="text-sm font-semibold text-slate-900 dark:text-slate-50"
                >
                    Card example
                </p>
                <div
                    class="space-y-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
                >
                    <div class="flex items-center gap-3">
                        <Skeleton rounded="full" width="3rem" height="3rem" />
                        <div class="flex-1 space-y-2">
                            <Skeleton width="60%" height="1rem" />
                            <Skeleton width="40%" height="0.875rem" />
                        </div>
                    </div>
                    <Skeleton width="100%" height="1rem" />
                    <Skeleton width="90%" height="1rem" />
                </div>
            </div>
        </div>
    </Card>
</template>
