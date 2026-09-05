<script setup lang="ts">
defineProps<{
    isAssigning: boolean;
    isSubmitDisabled: boolean;
    primarySubmitLabel: string;
}>();

const emit = defineEmits<{
    cancel: [];
    submit: [];
}>();
</script>

<template>
    <UiDialogFooter class="gap-2 sm:gap-2">
        <UiButton
            type="button"
            variant="outline"
            :disabled="isAssigning"
            @click="emit('cancel')"
        >
            Anuluj
        </UiButton>
        <UiButton
            type="button"
            :disabled="isSubmitDisabled"
            @click="emit('submit')"
        >
            {{ primarySubmitLabel }}
        </UiButton>
    </UiDialogFooter>
</template>
