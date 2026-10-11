<script setup lang="ts">
defineProps<{ open: boolean }>();

const emit = defineEmits<{
    cancel: [];
    discard: [];
}>();
</script>

<template>
    <UiDialog :open="open" @update:open="!$event && emit('cancel')">
        <UiDialogContent
            :show-close-button="false"
            aria-describedby="account-discard-description"
        >
            <UiDialogHeader>
                <UiDialogTitle>Odrzucić zmiany profilu?</UiDialogTitle>
                <UiDialogDescription id="account-discard-description">
                    Masz niezapisane zmiany. Jeśli opuścisz edycję, utracisz
                    wpisane dane.
                </UiDialogDescription>
            </UiDialogHeader>
            <UiDialogFooter>
                <UiButton
                    type="button"
                    variant="outline"
                    @click="emit('cancel')"
                >
                    Zostań
                </UiButton>
                <UiButton
                    type="button"
                    variant="destructive"
                    @click="emit('discard')"
                >
                    Odrzuć zmiany
                </UiButton>
            </UiDialogFooter>
        </UiDialogContent>
    </UiDialog>
</template>
