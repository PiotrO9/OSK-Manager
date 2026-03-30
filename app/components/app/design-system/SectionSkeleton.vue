<template>
    <UiCard aria-label="Card: Skeleton (shadcn)" class="min-w-0">
        <UiCardHeader>
            <UiCardTitle class="text-base">Skeleton (shadcn)</UiCardTitle>
        </UiCardHeader>
        <UiCardContent class="space-y-6">
            <div class="space-y-3">
                <p class="text-foreground text-sm font-semibold">Linie</p>
                <div class="space-y-2">
                    <UiSkeleton class="h-4 w-full" />
                    <UiSkeleton class="h-4 w-[80%]" />
                    <UiSkeleton class="h-4 w-[60%]" />
                </div>
            </div>

            <div class="space-y-3">
                <p class="text-foreground text-sm font-semibold">
                    Karta (layout)
                </p>
                <div
                    class="border-border bg-card space-y-3 rounded-xl border p-4"
                >
                    <div class="flex items-center gap-3">
                        <UiSkeleton class="size-12 rounded-full" />
                        <div class="flex flex-1 flex-col gap-2">
                            <UiSkeleton class="h-4 w-[60%]" />
                            <UiSkeleton class="h-3 w-[40%]" />
                        </div>
                    </div>
                    <UiSkeleton class="h-4 w-full" />
                    <UiSkeleton class="h-4 w-[90%]" />
                </div>
            </div>
        </UiCardContent>
    </UiCard>
</template>
