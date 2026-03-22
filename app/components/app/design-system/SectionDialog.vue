<script setup lang="ts">
const emit = defineEmits<{
    open: [];
}>();

function handleOpenDialog() {
    emit('open');
}
</script>

<template>
    <Card aria-label="Card: Dialog">
        <template #header>
            <p class="text-sm font-semibold text-slate-900 dark:text-slate-50">
                Dialog
            </p>
        </template>

        <p class="text-sm text-slate-600 dark:text-slate-400">
            Demo of
            <code class="font-mono text-slate-900 dark:text-slate-50"
                >Dialog</code
            >
            (native
            <code class="font-mono text-slate-900 dark:text-slate-50"
                >&lt;dialog&gt;</code
            >
            + Teleport).
        </p>

        <div class="mt-4 flex flex-wrap gap-2">
            <Action aria-label="Open dialog" @click="handleOpenDialog">
                Open dialog
            </Action>
        </div>
    </Card>
</template>
