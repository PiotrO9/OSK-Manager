<script setup lang="ts">
const { addToast } = useToast();

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
    <Card aria-label="Card: Toasts">
        <template #header>
            <p class="text-sm font-semibold text-slate-900 dark:text-slate-50">
                Toasts
            </p>
        </template>

        <p class="text-sm text-slate-600 dark:text-slate-400">
            Toasts render in the top-right via
            <code class="font-mono text-slate-900 dark:text-slate-50"
                >ToastStack</code
            >.
        </p>

        <div class="mt-4 flex flex-wrap gap-2">
            <Action
                aria-label="Show success toast"
                @click="handleToast('success')"
            >
                Success
            </Action>
            <Action
                aria-label="Show info toast"
                variant="secondary"
                @click="handleToast('info')"
            >
                Info
            </Action>
            <Action
                aria-label="Show warning toast"
                variant="secondary"
                @click="handleToast('warning')"
            >
                Warning
            </Action>
            <Action
                aria-label="Show error toast"
                variant="secondary"
                @click="handleToast('error')"
            >
                Error
            </Action>
        </div>
    </Card>
</template>
