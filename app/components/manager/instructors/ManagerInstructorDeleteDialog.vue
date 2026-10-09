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
                <UiDialogTitle>Zablokować konto instruktora?</UiDialogTitle>
                <UiDialogDescription id="confirm-delete-instructor-description">
                    Czy na pewno chcesz zablokować konto instruktora
                    <span class="text-foreground font-medium">
                        „{{ instructorDisplayName }}"
                    </span>
                    ? Aktywne sesje zostaną zakończone. Zaplanowane lekcje i
                    przypisania pozostaną; w razie potrzeby przenieś je osobno.
                    Konto można odblokować w sekcji „Konta osób”.
                </UiDialogDescription>
            </UiDialogHeader>

            <UiDialogFooter>
                <UiButton
                    variant="outline"
                    aria-label="Anuluj blokowanie instruktora"
                    @click="emit('cancel')"
                >
                    Anuluj
                </UiButton>
                <UiButton
                    variant="destructive"
                    :aria-label="`Potwierdź zablokowanie instruktora ${instructorDisplayName}`"
                    @click="emit('confirm')"
                >
                    Zablokuj
                </UiButton>
            </UiDialogFooter>
        </UiDialogContent>
    </UiDialog>
</template>
