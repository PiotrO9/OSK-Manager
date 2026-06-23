<script setup lang="ts">
import { Loader2 } from 'lucide-vue-next';

type SpinnerSize = 'sm' | 'md' | 'lg' | 'xl';
type SpinnerVariant = 'primary' | 'secondary' | 'white';

function sizeClass(size: SpinnerSize): string {
    if (size === 'sm') return 'size-4';

    if (size === 'md') return 'size-6';

    if (size === 'lg') return 'size-8';

    return 'size-12';
}

function variantClass(variant: SpinnerVariant): string {
    if (variant === 'primary') return 'text-primary';

    if (variant === 'secondary') return 'text-muted-foreground';

    return 'text-white';
}
</script>

<template>
    <UiCard aria-label="Card: Spinner" class="min-w-0">
        <UiCardHeader>
            <UiCardTitle class="text-base">Spinner (Lucide)</UiCardTitle>
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
                        <Loader2
                            class="animate-spin"
                            :class="[sizeClass('sm'), variantClass('primary')]"
                            aria-hidden="true"
                        />
                        <span class="text-xs text-slate-600 dark:text-slate-400"
                            >Small</span
                        >
                    </div>
                    <div class="flex flex-col items-center gap-2">
                        <Loader2
                            class="animate-spin"
                            :class="[sizeClass('md'), variantClass('primary')]"
                            aria-hidden="true"
                        />
                        <span class="text-xs text-slate-600 dark:text-slate-400"
                            >Medium</span
                        >
                    </div>
                    <div class="flex flex-col items-center gap-2">
                        <Loader2
                            class="animate-spin"
                            :class="[sizeClass('lg'), variantClass('primary')]"
                            aria-hidden="true"
                        />
                        <span class="text-xs text-slate-600 dark:text-slate-400"
                            >Large</span
                        >
                    </div>
                    <div class="flex flex-col items-center gap-2">
                        <Loader2
                            class="animate-spin"
                            :class="[sizeClass('xl'), variantClass('primary')]"
                            aria-hidden="true"
                        />
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
                        <Loader2
                            class="animate-spin"
                            :class="[sizeClass('md'), variantClass('primary')]"
                            aria-hidden="true"
                        />
                        <span class="text-xs text-slate-600 dark:text-slate-400"
                            >Primary</span
                        >
                    </div>
                    <div class="flex flex-col items-center gap-2">
                        <Loader2
                            class="animate-spin"
                            :class="[
                                sizeClass('md'),
                                variantClass('secondary'),
                            ]"
                            aria-hidden="true"
                        />
                        <span class="text-xs text-slate-600 dark:text-slate-400"
                            >Secondary</span
                        >
                    </div>
                    <div class="flex flex-col items-center gap-2">
                        <div
                            class="rounded-lg bg-slate-900 p-3 dark:bg-slate-50"
                        >
                            <Loader2
                                class="animate-spin"
                                :class="[
                                    sizeClass('md'),
                                    variantClass('white'),
                                ]"
                                aria-hidden="true"
                            />
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
