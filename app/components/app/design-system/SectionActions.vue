<script setup lang="ts">
const { addToast } = useAppToast();

function handleToast(variant: ToastVariant) {
    addToast({
        title:
            variant === 'success'
                ? 'Success'
                : variant === 'warning'
                  ? 'Warning'
                  : variant === 'error'
                    ? 'Error'
                    : 'Info',
        description: 'Sample toast message.',
        variant,
    });
}
</script>

<template>
    <UiCard aria-label="Card: Actions (shadcn)" class="min-w-0">
        <UiCardHeader>
            <UiCardTitle class="text-base">Actions (shadcn Button)</UiCardTitle>
        </UiCardHeader>
        <UiCardContent class="space-y-6">
            <div class="space-y-3">
                <p class="text-foreground text-sm font-semibold">Primary</p>
                <div class="flex flex-wrap gap-3">
                    <UiButton aria-label="Primary normal">Normal</UiButton>
                    <UiButton aria-label="Primary loading" disabled>
                        <span class="opacity-70">Submit</span>
                    </UiButton>
                    <UiButton aria-label="Primary disabled" disabled>
                        Disabled
                    </UiButton>
                </div>
            </div>

            <div class="space-y-3">
                <p class="text-foreground text-sm font-semibold">
                    Secondary / outline
                </p>
                <div class="flex flex-wrap gap-3">
                    <UiButton variant="secondary" aria-label="Secondary normal">
                        Normal
                    </UiButton>
                    <UiButton variant="outline" aria-label="Outline">
                        Outline
                    </UiButton>
                    <UiButton variant="ghost" aria-label="Ghost">
                        Ghost
                    </UiButton>
                    <UiButton variant="destructive" aria-label="Destructive">
                        Destructive
                    </UiButton>
                </div>
            </div>

            <div class="space-y-3">
                <p class="text-foreground text-sm font-semibold">Icon</p>
                <div class="flex flex-wrap items-center gap-3">
                    <UiButton size="icon" aria-label="Dodaj">
                        <Icon
                            name="heroicons:plus"
                            class="size-5"
                            aria-hidden="true"
                        />
                    </UiButton>
                    <UiButton
                        size="icon"
                        variant="secondary"
                        aria-label="Dodaj secondary"
                    >
                        <Icon
                            name="heroicons:plus"
                            class="size-5"
                            aria-hidden="true"
                        />
                    </UiButton>
                    <UiButton
                        size="icon"
                        variant="outline"
                        disabled
                        aria-label="Disabled icon"
                    >
                        <Icon
                            name="heroicons:plus"
                            class="size-5"
                            aria-hidden="true"
                        />
                    </UiButton>
                    <UiButton size="icon" aria-label="Litera A"> A </UiButton>
                    <UiButton
                        size="icon"
                        variant="secondary"
                        aria-label="Emoji"
                    >
                        ❤️
                    </UiButton>
                </div>
            </div>

            <div class="space-y-3">
                <p class="text-foreground text-sm font-semibold">
                    Link & sizes
                </p>
                <div class="flex flex-wrap items-center gap-3">
                    <UiButton variant="link" :as-child="true">
                        <a href="#" aria-label="Link style">Link</a>
                    </UiButton>
                    <UiButton size="sm" @click="handleToast('info')">
                        Small
                    </UiButton>
                    <UiButton size="lg" @click="handleToast('success')">
                        Large
                    </UiButton>
                </div>
            </div>
        </UiCardContent>
    </UiCard>
</template>
