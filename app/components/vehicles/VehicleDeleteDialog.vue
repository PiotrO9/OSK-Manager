<script setup lang="ts">
interface Props {
    open: boolean;
    vehicleName: string;
    registrationNumber: string;
    isDeleting?: boolean;
}

withDefaults(defineProps<Props>(), {
    isDeleting: false,
});

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
            aria-describedby="confirm-delete-vehicle-description"
        >
            <UiDialogHeader>
                <UiDialogTitle>Usunąć pojazd?</UiDialogTitle>
                <UiDialogDescription id="confirm-delete-vehicle-description">
                    Pojazd
                    <span class="text-foreground font-medium">
                        „{{ vehicleName }}"
                    </span>
                    <span v-if="registrationNumber.trim().length > 0">
                        ({{ registrationNumber }})
                    </span>
                    zostanie usunięty z listy. Tej operacji nie można cofnąć.
                </UiDialogDescription>
            </UiDialogHeader>

            <UiDialogFooter>
                <UiButton
                    variant="outline"
                    type="button"
                    :disabled="isDeleting"
                    :aria-label="'Anuluj usuwanie pojazdu'"
                    @click="emit('cancel')"
                >
                    Anuluj
                </UiButton>
                <UiButton
                    variant="destructive"
                    type="button"
                    :disabled="isDeleting"
                    :aria-label="`Potwierdź usunięcie pojazdu ${vehicleName}`"
                    @click="emit('confirm')"
                >
                    Usuń
                </UiButton>
            </UiDialogFooter>
        </UiDialogContent>
    </UiDialog>
</template>
