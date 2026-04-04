<script setup lang="ts">
interface Props {
    open: boolean;
    schoolName: string;
}

defineProps<Props>();

const emit = defineEmits<{
    'update:open': [value: boolean];
    cancel: [];
    confirm: [];
}>();

function handleOpenChange(open: boolean) {
    emit('update:open', open);
}
</script>

<template>
    <UiDialog :open="open" @update:open="handleOpenChange">
        <UiDialogContent
            :show-close-button="false"
            aria-describedby="confirm-delete-osk-description"
        >
            <UiDialogHeader>
                <UiDialogTitle>Usunąć szkołę jazdy?</UiDialogTitle>
                <UiDialogDescription id="confirm-delete-osk-description">
                    Szkoła
                    <span class="text-foreground font-medium">
                        „{{ schoolName }}"
                    </span>
                    zostanie trwale usunięta. Tej operacji nie można cofnąć.
                </UiDialogDescription>
            </UiDialogHeader>

            <UiDialogFooter>
                <UiButton
                    variant="outline"
                    :aria-label="'Anuluj usuwanie'"
                    @click="emit('cancel')"
                >
                    Anuluj
                </UiButton>
                <UiButton
                    variant="destructive"
                    :aria-label="`Potwierdź usunięcie szkoły ${schoolName}`"
                    @click="emit('confirm')"
                >
                    Usuń
                </UiButton>
            </UiDialogFooter>
        </UiDialogContent>
    </UiDialog>
</template>
