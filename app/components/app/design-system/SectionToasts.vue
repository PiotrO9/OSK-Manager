<script setup lang="ts">
const { addToast } = useAppToast();

function handleToast(variant: ToastVariant) {
    const title =
        variant === 'success'
            ? 'Sukces'
            : variant === 'warning'
              ? 'Ostrzeżenie'
              : variant === 'error'
                ? 'Błąd'
                : 'Informacja';

    addToast({
        title,
        description: 'To przykładowy komunikat.',
        variant,
    });
}
</script>

<template>
    <UiCard aria-label="Card: Toasts" class="min-w-0">
        <UiCardHeader>
            <UiCardTitle class="text-base">Toasts</UiCardTitle>
            <UiCardDescription>
                Komunikaty w prawym górnym rogu przez
                <code class="font-mono text-xs">ToastStack</code>
                (własny komponent startera).
            </UiCardDescription>
        </UiCardHeader>
        <UiCardContent>
            <div class="flex flex-wrap gap-2">
                <UiButton
                    aria-label="Show success toast"
                    @click="handleToast('success')"
                >
                    Success
                </UiButton>
                <UiButton
                    variant="secondary"
                    aria-label="Show info toast"
                    @click="handleToast('info')"
                >
                    Info
                </UiButton>
                <UiButton
                    variant="outline"
                    aria-label="Show warning toast"
                    @click="handleToast('warning')"
                >
                    Warning
                </UiButton>
                <UiButton
                    variant="destructive"
                    aria-label="Show error toast"
                    @click="handleToast('error')"
                >
                    Error
                </UiButton>
            </div>
        </UiCardContent>
    </UiCard>
</template>
