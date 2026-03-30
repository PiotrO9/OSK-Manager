<template>
    <UiCard aria-label="Card: Spinner" class="min-w-0">
        <UiCardHeader>
            <UiCardTitle class="text-base">Spinner</UiCardTitle>
        </UiCardHeader>
        <UiCardContent class="space-y-6">
            <div class="space-y-3">
                <p
                    class="text-sm font-semibold text-slate-900 dark:text-slate-50"
                >
                    Sizes
                </p>
                <div class="flex flex-wrap items-center gap-6">
                    <div class="flex flex-col items-center gap-2">
                        <Spinner size="sm" />
                        <span class="text-xs text-slate-600 dark:text-slate-400"
                            >Small</span
                        >
                    </div>
                    <div class="flex flex-col items-center gap-2">
                        <Spinner size="md" />
                        <span class="text-xs text-slate-600 dark:text-slate-400"
                            >Medium</span
                        >
                    </div>
                    <div class="flex flex-col items-center gap-2">
                        <Spinner size="lg" />
                        <span class="text-xs text-slate-600 dark:text-slate-400"
                            >Large</span
                        >
                    </div>
                    <div class="flex flex-col items-center gap-2">
                        <Spinner size="xl" />
                        <span class="text-xs text-slate-600 dark:text-slate-400"
                            >Extra large</span
                        >
                    </div>
                </div>
            </div>

            <div class="space-y-3">
                <p
                    class="text-sm font-semibold text-slate-900 dark:text-slate-50"
                >
                    Variants
                </p>
                <div class="flex flex-wrap items-center gap-6">
                    <div class="flex flex-col items-center gap-2">
                        <Spinner variant="primary" />
                        <span class="text-xs text-slate-600 dark:text-slate-400"
                            >Primary</span
                        >
                    </div>
                    <div class="flex flex-col items-center gap-2">
                        <Spinner variant="secondary" />
                        <span class="text-xs text-slate-600 dark:text-slate-400"
                            >Secondary</span
                        >
                    </div>
                    <div class="flex flex-col items-center gap-2">
                        <div
                            class="rounded-lg bg-slate-900 p-3 dark:bg-slate-50"
                        >
                            <Spinner variant="white" />
                        </div>
                        <span class="text-xs text-slate-600 dark:text-slate-400"
                            >White</span
                        >
                    </div>
                </div>
            </div>
        </UiCardContent>
    </UiCard>
</template>
