<script setup lang="ts">
const { addToast } = useAppToast();

function handleToast(variant: ToastVariant) {
    addToast({
        title: variant === 'success' ? 'Success' : 'Info',
        description: 'Sample message.',
        variant,
    });
}
</script>

<template>
    <UiCard aria-label="Card: Cards (shadcn)" class="min-w-0">
        <UiCardHeader>
            <UiCardTitle class="text-base">Cards (shadcn)</UiCardTitle>
            <UiCardDescription>
                Zagnieżdżony przykład z
                <code class="font-mono text-xs">UiCard*</code>.
            </UiCardDescription>
        </UiCardHeader>
        <UiCardContent>
            <UiCard class="border-dashed">
                <UiCardHeader>
                    <UiCardTitle class="text-sm">Nested example</UiCardTitle>
                    <UiCardDescription>
                        Karty grupują treść i akcje.
                    </UiCardDescription>
                </UiCardHeader>
                <UiCardContent>
                    <p class="text-muted-foreground text-sm">
                        Cards are great for grouping content and actions.
                    </p>
                </UiCardContent>
                <UiCardFooter class="flex flex-wrap gap-2">
                    <UiButton
                        aria-label="Card primary action"
                        @click="handleToast('info')"
                    >
                        Action
                    </UiButton>
                    <UiButton
                        variant="secondary"
                        aria-label="Card secondary action"
                        @click="handleToast('success')"
                    >
                        Secondary
                    </UiButton>
                </UiCardFooter>
            </UiCard>
        </UiCardContent>
    </UiCard>
</template>
