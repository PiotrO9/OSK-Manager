<script setup lang="ts">
const emit = defineEmits<{
    open: [];
}>();

function handleOpenDialog() {
    emit('open');
}
</script>

<template>
    <UiCard aria-label="Card: Dialog (shadcn)" class="min-w-0">
        <UiCardHeader>
            <UiCardTitle class="text-base">Dialog (shadcn)</UiCardTitle>
        </UiCardHeader>
        <UiCardContent class="space-y-3">
            <p class="text-muted-foreground text-sm">
                Pełny dialog (Reka UI) jest pokazany na dole strony —
                <code class="font-mono text-xs">UiDialog</code>
                w
                <code class="font-mono text-xs">design-system.vue</code>.
            </p>
            <div class="flex flex-wrap gap-2">
                <UiButton aria-label="Open dialog" @click="handleOpenDialog">
                    Otwórz dialog
                </UiButton>
            </div>
        </UiCardContent>
    </UiCard>
</template>
