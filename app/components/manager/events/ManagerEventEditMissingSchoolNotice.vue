<script setup lang="ts">
defineProps<{
    isLoading: boolean;
    error: string | null;
}>();

defineEmits<{ retry: [] }>();
</script>

<template>
    <p
        class="border-border rounded-xl border border-dashed bg-amber-50/60 px-4 py-3 text-sm text-amber-800 dark:bg-amber-950/20 dark:text-amber-300"
        role="status"
    >
        <template v-if="isLoading"
            >Ustalamy szkołę powiązaną z instruktorem…</template
        >
        <template v-else>
            {{
                error ??
                'Nie udało się ustalić szkoły powiązanej z wydarzeniem.'
            }}
            <UiButton
                type="button"
                variant="link"
                class="ml-2 h-auto p-0"
                @click="$emit('retry')"
            >
                Spróbuj ponownie
            </UiButton>
        </template>
    </p>
</template>
