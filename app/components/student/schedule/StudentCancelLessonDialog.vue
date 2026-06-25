<script setup lang="ts">
defineProps<{
    isCancelling: boolean;
    pendingCancelLessonLabel: string;
}>();

defineEmits<{
    cancel: [];
    confirm: [];
}>();

const open = defineModel<boolean>('open', {
    required: true,
});
</script>

<template>
    <UiDialog v-model:open="open">
        <UiDialogContent
            :show-close-button="false"
            aria-describedby="student-cancel-lesson-description"
        >
            <UiDialogHeader>
                <UiDialogTitle>AnulowaÄ‡ rezerwacjÄ™?</UiDialogTitle>
                <UiDialogDescription id="student-cancel-lesson-description">
                    Ta jazda zostanie oznaczona jako anulowana i zniknie z
                    Twojego aktywnego harmonogramu.
                    <span
                        v-if="pendingCancelLessonLabel"
                        class="text-foreground mt-2 block font-medium"
                    >
                        {{ pendingCancelLessonLabel }}
                    </span>
                </UiDialogDescription>
            </UiDialogHeader>

            <UiDialogFooter>
                <UiButton
                    type="button"
                    variant="outline"
                    :disabled="isCancelling"
                    @click="$emit('cancel')"
                >
                    Nie
                </UiButton>
                <UiButton
                    type="button"
                    variant="destructive"
                    :disabled="isCancelling"
                    :aria-busy="isCancelling"
                    @click="$emit('confirm')"
                >
                    {{ isCancelling ? 'Anulowanie...' : 'Anuluj rezerwacjÄ™' }}
                </UiButton>
            </UiDialogFooter>
        </UiDialogContent>
    </UiDialog>
</template>
