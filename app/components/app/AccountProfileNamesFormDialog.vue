<script setup lang="ts">
interface Props {
    open: boolean;
    firstName: string;
    lastName: string;
    isSaving: boolean;
    errorMessage: string;
    nameMaxLen: number;
}

const props = defineProps<Props>();

const emit = defineEmits<{
    'update:open': [value: boolean];
    'update:firstName': [value: string];
    'update:lastName': [value: string];
    submit: [];
}>();

const descriptionId = 'account-profile-names-dialog-desc';

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
                <UiDialogTitle>Imię i nazwisko</UiDialogTitle>
                <UiDialogDescription :id="descriptionId">
                    Zmień swoje dane wyświetlane w aplikacji. Dostępne dla ról
                    MANAGER i ADMIN.
                </UiDialogDescription>
            </UiDialogHeader>

            <form class="space-y-4" @submit.prevent="emit('submit')">
                <div class="space-y-2">
                    <UiLabel for="account-profile-names-first">Imię</UiLabel>
                    <UiInput
                        id="account-profile-names-first"
                        :model-value="firstName"
                        type="text"
                        autocomplete="given-name"
                        :maxlength="nameMaxLen"
                        aria-required="true"
                        :aria-invalid="errorMessage ? 'true' : 'false'"
                        :aria-describedby="
                            errorMessage
                                ? 'account-profile-names-dialog-err'
                                : undefined
                        "
                        :disabled="isSaving"
                        @update:model-value="
                            emit('update:firstName', toTextInputValue($event))
                        "
                    />
                </div>
                <div class="space-y-2">
                    <UiLabel for="account-profile-names-last">Nazwisko</UiLabel>
                    <UiInput
                        id="account-profile-names-last"
                        :model-value="lastName"
                        type="text"
                        autocomplete="family-name"
                        :maxlength="nameMaxLen"
                        aria-required="true"
                        :aria-invalid="errorMessage ? 'true' : 'false'"
                        :aria-describedby="
                            errorMessage
                                ? 'account-profile-names-dialog-err'
                                : undefined
                        "
                        :disabled="isSaving"
                        @update:model-value="
                            emit('update:lastName', toTextInputValue($event))
                        "
                    />
                </div>
                <p
                    v-if="errorMessage"
                    id="account-profile-names-dialog-err"
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
