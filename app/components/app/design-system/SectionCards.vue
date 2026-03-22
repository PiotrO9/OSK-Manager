<script setup lang="ts">
const { addToast } = useToast();

function handleToast(variant: ToastVariant) {
    addToast({
        title: variant === 'success' ? 'Success' : 'Info',
        description: 'Sample message.',
        variant,
    });
}
</script>

<template>
    <Card aria-label="Card: Cards">
        <template #header>
            <p class="text-sm font-semibold text-slate-900 dark:text-slate-50">
                Cards
            </p>
        </template>

        <Card aria-label="Nested card preview">
            <template #header>
                <p
                    class="text-sm font-semibold text-slate-900 dark:text-slate-50"
                >
                    Nested example
                </p>
            </template>
            <p class="text-sm text-slate-600 dark:text-slate-400">
                Cards are great for grouping content and actions.
            </p>
            <template #footer>
                <div class="flex flex-wrap gap-2">
                    <Action
                        aria-label="Card primary action"
                        @click="handleToast('info')"
                    >
                        Action
                    </Action>
                    <Action
                        aria-label="Card secondary action"
                        variant="secondary"
                        @click="handleToast('success')"
                    >
                        Secondary
                    </Action>
                </div>
            </template>
        </Card>
    </Card>
</template>
