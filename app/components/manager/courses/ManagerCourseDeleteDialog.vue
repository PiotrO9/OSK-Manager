<script setup lang="ts">
withDefaults(
    defineProps<{
        open: boolean;
        courseName: string;
        isDeleting?: boolean;
        error?: string | null;
    }>(),
    { isDeleting: false, error: null },
);
const emit = defineEmits<{
    'update:open': [open: boolean];
    cancel: [];
    confirm: [];
}>();
</script>

<template>
    <UiDialog :open="open" @update:open="emit('update:open', $event)">
        <UiDialogContent
            :show-close-button="false"
            aria-describedby="confirm-delete-course-description"
        >
            <UiDialogHeader>
                <UiDialogTitle>Usunąć kurs?</UiDialogTitle>
                <UiDialogDescription id="confirm-delete-course-description">
                    Kurs „{{ courseName }}” zniknie z listy. Tej operacji nie
                    można cofnąć.
                </UiDialogDescription>
            </UiDialogHeader>
            <p v-if="error" class="text-destructive text-sm" role="alert">
                {{ error }}
            </p>
            <UiDialogFooter>
                <UiButton
                    type="button"
                    variant="outline"
                    :disabled="isDeleting"
                    @click="emit('cancel')"
                    >Anuluj</UiButton
                >
                <UiButton
                    type="button"
                    variant="destructive"
                    :disabled="isDeleting"
                    @click="emit('confirm')"
                >
                    <span
                        v-if="isDeleting"
                        class="mr-2 size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
                        aria-hidden="true"
                    />
                    {{ isDeleting ? 'Usuwanie…' : 'Usuń kurs' }}
                </UiButton>
            </UiDialogFooter>
        </UiDialogContent>
    </UiDialog>
</template>
