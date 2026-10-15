<script setup lang="ts">
type AccountAction = 'block' | 'archive' | 'email';

const props = defineProps<{
    action: AccountAction | null;
    accountName: string;
    newEmail?: string;
}>();

const emit = defineEmits<{
    cancel: [];
    confirm: [];
}>();

const title = computed(() => {
    switch (props.action) {
        case 'block':
            return 'Zablokować konto?';
        case 'archive':
            return 'Zarchiwizować konto?';
        case 'email':
            return 'Zmienić adres e-mail?';
        default:
            return '';
    }
});

const confirmLabel = computed(() => {
    switch (props.action) {
        case 'block':
            return 'Zablokuj konto';
        case 'archive':
            return 'Archiwizuj';
        case 'email':
            return 'Zmień e-mail';
        default:
            return '';
    }
});
</script>

<template>
    <UiDialog :open="action !== null" @update:open="!$event && emit('cancel')">
        <UiDialogContent
            :show-close-button="false"
            aria-describedby="manager-account-action-description"
        >
            <UiDialogHeader>
                <UiDialogTitle>{{ title }}</UiDialogTitle>
                <UiDialogDescription id="manager-account-action-description">
                    <template v-if="action === 'block'">
                        Dostęp do konta {{ accountName }} zostanie zablokowany,
                        a aktywne sesje zakończone.
                    </template>
                    <template v-else-if="action === 'archive'">
                        Konto {{ accountName }} zostanie zarchiwizowane. Tej
                        operacji nie można cofnąć w tym panelu.
                    </template>
                    <template v-else-if="action === 'email'">
                        Adres e-mail konta {{ accountName }} zostanie zmieniony
                        na {{ newEmail }} bez linku potwierdzającego.
                    </template>
                </UiDialogDescription>
            </UiDialogHeader>
            <UiDialogFooter>
                <UiButton
                    type="button"
                    variant="outline"
                    @click="emit('cancel')"
                >
                    Anuluj
                </UiButton>
                <UiButton
                    type="button"
                    :variant="action === 'email' ? 'default' : 'destructive'"
                    :activation-delay-seconds="
                        action === 'block' || action === 'archive' ? 5 : 0
                    "
                    :activation-delay-active="
                        action === 'block' || action === 'archive'
                    "
                    @click="emit('confirm')"
                >
                    {{ confirmLabel }}
                </UiButton>
            </UiDialogFooter>
        </UiDialogContent>
    </UiDialog>
</template>
