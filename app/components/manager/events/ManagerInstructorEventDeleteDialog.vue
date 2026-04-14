<script setup lang="ts">
interface Props {
    open: boolean;
    /** Krótki opis (np. zakres czasu), opcjonalnie. */
    timeRangeLabel?: string;
    /** Blokuje przyciski podczas żądania DELETE. */
    isDeleting?: boolean;
}

withDefaults(defineProps<Props>(), {
    timeRangeLabel: '',
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
            aria-describedby="confirm-delete-instructor-event-description"
        >
            <UiDialogHeader>
                <UiDialogTitle>Usunąć blok czasu?</UiDialogTitle>
                <UiDialogDescription
                    id="confirm-delete-instructor-event-description"
                >
                    Czy na pewno chcesz usunąć ten blok z harmonogramu?
                    <span
                        v-if="timeRangeLabel?.trim()"
                        class="text-foreground mt-2 block font-medium"
                    >
                        {{ timeRangeLabel }}
                    </span>
                    Tej operacji nie można cofnąć.
                </UiDialogDescription>
            </UiDialogHeader>

            <UiDialogFooter>
                <UiButton
                    variant="outline"
                    type="button"
                    :disabled="isDeleting"
                    aria-label="Anuluj usuwanie bloku czasu"
                    @click="emit('cancel')"
                >
                    Anuluj
                </UiButton>
                <UiButton
                    variant="destructive"
                    type="button"
                    :disabled="isDeleting"
                    :aria-busy="isDeleting"
                    aria-label="Potwierdź usunięcie bloku czasu z harmonogramu"
                    @click="emit('confirm')"
                >
                    {{ isDeleting ? 'Usuwanie…' : 'Usuń' }}
                </UiButton>
            </UiDialogFooter>
        </UiDialogContent>
    </UiDialog>
</template>
