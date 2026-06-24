<script setup lang="ts">
defineProps<{
    isSaving: boolean;
    isDeleteLoading: boolean;
}>();

defineEmits<{
    delete: [];
}>();
</script>

<template>
    <div
        class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
    >
        <p class="text-muted-foreground text-sm">
            Usunięcie wydarzenia wymaga dodatkowego potwierdzenia.
        </p>
        <UiButton
            type="button"
            variant="destructive"
            class="w-full rounded-xl sm:w-auto"
            :disabled="isSaving || isDeleteLoading"
            :aria-busy="isDeleteLoading"
            aria-label="Usuń to wydarzenie z harmonogramu"
            @click="$emit('delete')"
        >
            Usuń wydarzenie
        </UiButton>
    </div>
</template>
