<template>
    <UiCard aria-label="Card: Badge (shadcn)" class="min-w-0">
        <UiCardHeader>
            <UiCardTitle class="text-base">Badge (shadcn)</UiCardTitle>
        </UiCardHeader>
        <UiCardContent class="space-y-6">
            <div class="space-y-3">
                <p class="text-foreground text-sm font-semibold">Variants</p>
                <div class="flex flex-wrap items-center gap-3">
                    <UiBadge>Default</UiBadge>
                    <UiBadge variant="secondary">Secondary</UiBadge>
                    <UiBadge variant="destructive">Destructive</UiBadge>
                    <UiBadge variant="outline">Outline</UiBadge>
                </div>
            </div>

            <div class="space-y-3">
                <p class="text-foreground text-sm font-semibold">
                    Semantyka (outline)
                </p>
                <div class="flex flex-wrap items-center gap-3">
                    <UiBadge
                        variant="outline"
                        class="border-success-500/50 text-success-700 dark:text-success-400"
                    >
                        Success
                    </UiBadge>
                    <UiBadge
                        variant="outline"
                        class="border-warning-500/50 text-warning-700 dark:text-warning-400"
                    >
                        Warning
                    </UiBadge>
                    <UiBadge variant="destructive">Danger</UiBadge>
                    <UiBadge
                        variant="outline"
                        class="border-info-500/50 text-info-700 dark:text-info-300"
                    >
                        Info
                    </UiBadge>
                </div>
            </div>
        </UiCardContent>
    </UiCard>
</template>
