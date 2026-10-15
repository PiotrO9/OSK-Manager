<script setup lang="ts">
const props = defineProps<{
    lessonLabel: string;
    isCancelling: boolean;
    canConfirm: boolean;
    errorMessage: string | null;
}>();

defineEmits<{
    confirm: [];
}>();

const open = defineModel<boolean>('open', { required: true });

function handleOpenChange(value: boolean): void {
    if (!props.isCancelling) {
        open.value = value;
    }
}
</script>

<template>
    <UiDialog :open="open" @update:open="handleOpenChange">
        <UiDialogContent
            :show-close-button="!isCancelling"
            aria-describedby="manager-cancel-lesson-description"
        >
            <UiDialogHeader>
                <UiDialogTitle>Anulować rezerwację jazdy?</UiDialogTitle>
                <UiDialogDescription id="manager-cancel-lesson-description">
                    Jazda zostanie oznaczona jako anulowana.
                    <span class="text-foreground mt-2 block font-medium">
                        {{ lessonLabel }}
                    </span>
                </UiDialogDescription>
            </UiDialogHeader>

            <p
                v-if="errorMessage"
                role="alert"
                class="text-destructive text-sm"
            >
                {{ errorMessage }}
            </p>

            <UiDialogFooter>
                <UiButton
                    type="button"
                    variant="outline"
                    :disabled="isCancelling"
                    @click="open = false"
                >
                    Nie
                </UiButton>
                <UiButton
                    type="button"
                    variant="destructive"
                    :disabled="isCancelling || !canConfirm"
                    :aria-busy="isCancelling"
                    @click="$emit('confirm')"
                >
                    {{ isCancelling ? 'Anulowanie...' : 'Anuluj rezerwację' }}
                </UiButton>
            </UiDialogFooter>
        </UiDialogContent>
    </UiDialog>
</template>
