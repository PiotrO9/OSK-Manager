<script setup lang="ts">
import { Save, X } from 'lucide-vue-next';
import AccountBioSection from './AccountBioSection.vue';
import AccountContactSection from './AccountContactSection.vue';
import AccountPersonalDataSection from './AccountPersonalDataSection.vue';
import AccountStudentDataSection from './AccountStudentDataSection.vue';
import type { AuthSession } from '~/utils/auth/authSessionMapper';

const props = defineProps<{
    accountPkkNumber: string;
    canEditPhoneAndBio: boolean;
    canEditProfileNames: boolean;
    editBioError: string;
    editFirstNameError: string;
    editLastNameError: string;
    firstName: string | null | undefined;
    formatProfileField: (value: string | null | undefined) => string;
    inlineProfileEditing: boolean;
    isAccountPkkMissing: boolean;
    isInlineProfileDirty: boolean;
    isInlineProfileSaving: boolean;
    isStudentSession: boolean;
    lastName: string | null | undefined;
    session: AuthSession | null;
}>();

const emit = defineEmits<{
    cancelEdit: [];
    save: [];
}>();

const editFirstName = defineModel<string>('editFirstName', { required: true });
const editLastName = defineModel<string>('editLastName', { required: true });
const editPhone = defineModel<string>('editPhone', { required: true });
const editBio = defineModel<string>('editBio', { required: true });

const profileForm = useTemplateRef<HTMLFormElement>('profileForm');

function focusField(name: string): void {
    void nextTick(() => {
        profileForm.value
            ?.querySelector<
                HTMLInputElement | HTMLTextAreaElement
            >(`[name="${name}"]`)
            ?.focus();
    });
}

watch(
    () => props.editFirstNameError,
    (error) => {
        if (error) focusField('firstName');
    },
);
watch(
    () => props.editLastNameError,
    (error) => {
        if (error) focusField('lastName');
    },
);
watch(
    () => props.editBioError,
    (error) => {
        if (error) focusField('bio');
    },
);
</script>

<template>
    <form ref="profileForm" novalidate @submit.prevent="emit('save')">
        <UiCard class="border-border bg-card gap-0 rounded-2xl py-0 shadow-sm">
            <UiCardHeader class="border-border border-b px-5 py-4">
                <h2 class="text-foreground text-lg font-bold">Dane profilu</h2>
            </UiCardHeader>

            <UiCardContent class="divide-border divide-y px-5 py-0">
                <AccountPersonalDataSection
                    v-model:edit-first-name="editFirstName"
                    v-model:edit-last-name="editLastName"
                    class="py-3 first:pt-5 last:pb-5"
                    :can-edit-profile-names="canEditProfileNames"
                    :edit-first-name-error="editFirstNameError"
                    :edit-last-name-error="editLastNameError"
                    :first-name="firstName"
                    :format-profile-field="formatProfileField"
                    :inline-profile-editing="inlineProfileEditing"
                    :is-inline-profile-saving="isInlineProfileSaving"
                    :last-name="lastName"
                />

                <AccountContactSection
                    v-model:edit-phone="editPhone"
                    class="py-3 first:pt-5 last:pb-5"
                    :can-edit-phone-and-bio="canEditPhoneAndBio"
                    :format-profile-field="formatProfileField"
                    :inline-profile-editing="inlineProfileEditing"
                    :is-inline-profile-saving="isInlineProfileSaving"
                    :session="session"
                />

                <AccountBioSection
                    v-model:edit-bio="editBio"
                    class="py-3 first:pt-5 last:pb-5"
                    :can-edit-phone-and-bio="canEditPhoneAndBio"
                    :edit-bio-error="editBioError"
                    :format-profile-field="formatProfileField"
                    :inline-profile-editing="inlineProfileEditing"
                    :is-inline-profile-saving="isInlineProfileSaving"
                    :session="session"
                />

                <AccountStudentDataSection
                    v-if="isStudentSession"
                    class="py-3 first:pt-5 last:pb-5"
                    :account-pkk-number="accountPkkNumber"
                    :is-account-pkk-missing="isAccountPkkMissing"
                />
            </UiCardContent>

            <div
                v-if="inlineProfileEditing"
                class="border-border bg-muted/20 flex flex-col gap-3 border-t px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
                <p
                    v-if="isInlineProfileDirty"
                    class="text-muted-foreground text-xs leading-relaxed"
                >
                    Masz niezapisane zmiany.
                </p>
                <ActionGroup
                    label="Akcje edycji profilu"
                    align="end"
                    class="sm:ml-auto"
                >
                    <UiButton
                        type="button"
                        variant="outline"
                        :disabled="isInlineProfileSaving"
                        @click="$emit('cancelEdit')"
                    >
                        <X class="size-4" aria-hidden="true" />
                        Anuluj
                    </UiButton>
                    <UiButton
                        type="submit"
                        :disabled="
                            isInlineProfileSaving || !isInlineProfileDirty
                        "
                        :aria-busy="isInlineProfileSaving"
                    >
                        <Save class="size-4" aria-hidden="true" />
                        {{ isInlineProfileSaving ? 'Zapisywanie…' : 'Zapisz' }}
                    </UiButton>
                </ActionGroup>
            </div>
        </UiCard>
    </form>
</template>
