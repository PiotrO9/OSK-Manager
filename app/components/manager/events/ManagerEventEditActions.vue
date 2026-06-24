<script setup lang="ts">
defineProps<{
    isSaving: boolean;
    isDeleteLoading: boolean;
    isFormDirty: boolean;
}>();

defineEmits<{
    cancel: [];
    delete: [];
}>();
</script>

<template>
    <ActionGroup label="Akcje formularza" align="end">
        <UiButton
            type="button"
            variant="outline"
            class="rounded-xl"
            :disabled="isSaving || isDeleteLoading"
            @click="$emit('cancel')"
        >
            Anuluj
        </UiButton>
        <UiButton
            type="submit"
            class="rounded-xl"
            :disabled="isSaving || isDeleteLoading || !isFormDirty"
        >
            {{ isSaving ? 'Zapisywanie...' : 'Zapisz zmiany' }}
        </UiButton>
    </ActionGroup>
</template>
