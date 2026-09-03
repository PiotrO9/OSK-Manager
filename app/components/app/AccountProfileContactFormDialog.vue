<script setup lang="ts">
interface Props {
    open: boolean;
    phone: string;
    bio: string;
    isSaving: boolean;
    errorMessage: string;
    bioMaxLen: number;
}

const props = defineProps<Props>();

const emit = defineEmits<{
    'update:open': [value: boolean];
    'update:phone': [value: string];
    'update:bio': [value: string];
    submit: [];
}>();

const descriptionId = 'account-profile-contact-dialog-desc';

const bioLength = computed(() => props.bio.length);

function handleOpenChange(open: boolean) {
    emit('update:open', open);
}

function handleCancel() {
    emit('update:open', false);
}

function handlePointerDownOutside(event: Event) {
    if (props.isSaving) {
        event.preventDefault();
    }
}

function toTextInputValue(value: string | number): string {
    return String(value);
}
</script>

<template>
    <UiDialog :open="open" @update:open="handleOpenChange">
        <UiDialogContent
            :show-close-button="true"
            :aria-describedby="descriptionId"
            class="max-w-md"
            @pointer-down-outside="handlePointerDownOutside"
        >
            <UiDialogHeader>
                <UiDialogTitle>Telefon i opis</UiDialogTitle>
                <UiDialogDescription :id="descriptionId">
                    Zaktualizuj numer telefonu oraz krótki opis „O mnie”.
                    Imienia i nazwiska nie edytujesz tutaj — ustala je pracownik
                    szkoły (MANAGER / ADMIN).
                </UiDialogDescription>
            </UiDialogHeader>

            <form class="space-y-4" @submit.prevent="emit('submit')">
                <div class="space-y-2">
                    <UiLabel for="account-profile-contact-phone"
                        >Telefon</UiLabel
                    >
                    <UiInput
                        id="account-profile-contact-phone"
                        :model-value="phone"
                        type="tel"
                        autocomplete="tel"
                        :aria-invalid="errorMessage ? 'true' : 'false'"
                        :aria-describedby="
                            errorMessage
                                ? 'account-profile-contact-dialog-err'
                                : undefined
                        "
                        :disabled="isSaving"
                        @update:model-value="
                            emit('update:phone', toTextInputValue($event))
                        "
                    />
                </div>
                <div class="space-y-2">
                    <UiLabel for="account-profile-contact-bio">O mnie</UiLabel>
                    <UiTextarea
                        id="account-profile-contact-bio"
                        :model-value="bio"
                        :maxlength="bioMaxLen"
                        rows="4"
                        class="min-h-[96px] resize-y"
                        :aria-invalid="errorMessage ? 'true' : 'false'"
                        :aria-describedby="
                            errorMessage
                                ? 'account-profile-contact-dialog-err'
                                : undefined
                        "
                        :disabled="isSaving"
                        @update:model-value="
                            emit('update:bio', toTextInputValue($event))
                        "
                    />
                    <p class="text-muted-foreground text-xs">
                        {{ bioLength }} / {{ bioMaxLen }}
                    </p>
                </div>
                <p
                    v-if="errorMessage"
                    id="account-profile-contact-dialog-err"
                    class="text-destructive text-sm"
                    role="alert"
                >
                    {{ errorMessage }}
                </p>

                <UiDialogFooter class="gap-2 sm:gap-2">
                    <UiButton
                        type="button"
                        variant="outline"
                        :disabled="isSaving"
                        @click="handleCancel"
                    >
                        Anuluj
                    </UiButton>
                    <UiButton
                        type="submit"
                        :disabled="isSaving"
                        :aria-busy="isSaving"
                    >
                        {{ isSaving ? 'Zapisywanie…' : 'Zapisz zmiany' }}
                    </UiButton>
                </UiDialogFooter>
            </form>
        </UiDialogContent>
    </UiDialog>
</template>
