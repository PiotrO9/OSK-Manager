<script setup lang="ts">
interface Props {
    open: boolean;
    instructorDisplayName: string;
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
            aria-describedby="confirm-delete-instructor-description"
        >
            <UiDialogHeader>
                <UiDialogTitle>Usunąć instruktora?</UiDialogTitle>
                <UiDialogDescription id="confirm-delete-instructor-description">
                    Czy na pewno chcesz usunąć instruktora
                    <span class="text-foreground font-medium">
                        „{{ instructorDisplayName }}"
                    </span>
                    ? Konto zostanie wyłączone — użytkownik nie zaloguje się
                    ponownie do aplikacji.
                </UiDialogDescription>
            </UiDialogHeader>

            <UiDialogFooter>
                <UiButton
                    variant="outline"
                    aria-label="Anuluj usuwanie instruktora"
                    @click="emit('cancel')"
                >
                    Anuluj
                </UiButton>
                <UiButton
                    variant="destructive"
                    :aria-label="`Potwierdź usunięcie instruktora ${instructorDisplayName}`"
                    @click="emit('confirm')"
                >
                    Usuń
                </UiButton>
            </UiDialogFooter>
        </UiDialogContent>
    </UiDialog>
</template>
