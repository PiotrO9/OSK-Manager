<script setup lang="ts">
import { Loader2 } from 'lucide-vue-next';

interface Props {
    open: boolean;
    schoolName: string;
    isDeleting: boolean;
    isDefault: boolean;
    isOnlySchool: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
    'update:open': [value: boolean];
    cancel: [];
    confirm: [];
}>();

function handleOpenChange(open: boolean) {
    if (!open && props.isDeleting) return;

    emit('update:open', open);
}

function preventCloseWhileDeleting(event: Event) {
    if (props.isDeleting) {
        event.preventDefault();
    }
}
</script>

<template>
    <UiDialog :open="open" @update:open="handleOpenChange">
        <UiDialogContent
            :show-close-button="false"
            aria-describedby="confirm-delete-osk-description"
            @pointer-down-outside="preventCloseWhileDeleting"
            @escape-key-down="preventCloseWhileDeleting"
        >
            <UiDialogHeader>
                <UiDialogTitle>Usunąć szkołę jazdy?</UiDialogTitle>
                <UiDialogDescription id="confirm-delete-osk-description">
                    Szkoła
                    <span class="text-foreground font-medium">
                        „{{ schoolName }}”
                    </span>
                    zniknie z aktywnej listy i przestanie być dostępna jako
                    kontekst pracy.
                </UiDialogDescription>
            </UiDialogHeader>

            <div
                v-if="isOnlySchool || isDefault"
                class="border-warning-300 bg-warning-50/70 text-warning-950 dark:border-warning-500/40 dark:bg-warning-500/10 dark:text-warning-200 rounded-lg border px-3 py-2 text-sm leading-relaxed"
                role="note"
            >
                <template v-if="isOnlySchool">
                    To jedyna szkoła na koncie. Po usunięciu część modułów nie
                    będzie miała domyślnego kontekstu do czasu dodania nowej
                    OSK.
                </template>
                <template v-else>
                    To domyślna szkoła. Po usunięciu aplikacja automatycznie
                    wybierze inną OSK jako domyślną.
                </template>
            </div>

            <UiDialogFooter>
                <UiButton
                    variant="outline"
                    type="button"
                    :disabled="isDeleting"
                    aria-label="Anuluj usuwanie"
                    @click="emit('cancel')"
                >
                    Anuluj
                </UiButton>
                <UiButton
                    variant="destructive"
                    type="button"
                    :disabled="isDeleting"
                    :aria-busy="isDeleting"
                    :aria-label="`Potwierdź usunięcie szkoły ${schoolName}`"
                    @click="emit('confirm')"
                >
                    <Loader2
                        v-if="isDeleting"
                        class="size-4 animate-spin"
                        aria-hidden="true"
                    />
                    {{ isDeleting ? 'Usuwanie…' : 'Usuń szkołę' }}
                </UiButton>
            </UiDialogFooter>
        </UiDialogContent>
    </UiDialog>
</template>
