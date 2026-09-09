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
        description:
            variant === 'success'
                ? 'Zmiany zostały zapisane.'
                : variant === 'warning'
                  ? 'Termin koliduje z dostępnością instruktora.'
                  : variant === 'error'
                    ? 'Nie udało się zapisać zmian.'
                    : 'Kursant otrzyma przypomnienie przed jazdą.',
        variant,
    });
}
</script>

<template>
    <UiCard aria-label="Przykłady powiadomień" class="min-w-0">
        <UiCardHeader>
            <UiCardTitle class="text-base">Powiadomienia</UiCardTitle>
            <UiCardDescription>
                Krótkie potwierdzenia i komunikaty wymagające uwagi.
            </UiCardDescription>
        </UiCardHeader>
        <UiCardContent>
            <div class="flex flex-wrap gap-2">
                <UiButton
                    aria-label="Pokaż potwierdzenie"
                    @click="handleToast('success')"
                >
                    Sukces
                </UiButton>
                <UiButton
                    variant="secondary"
                    aria-label="Pokaż informację"
                    @click="handleToast('info')"
                >
                    Informacja
                </UiButton>
                <UiButton
                    variant="outline"
                    aria-label="Pokaż ostrzeżenie"
                    @click="handleToast('warning')"
                >
                    Ostrzeżenie
                </UiButton>
                <UiButton
                    variant="destructive"
                    aria-label="Pokaż błąd"
                    @click="handleToast('error')"
                >
                    Błąd
                </UiButton>
            </div>
        </UiCardContent>
    </UiCard>
</template>
