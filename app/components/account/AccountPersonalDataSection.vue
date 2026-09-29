<script setup lang="ts">
import { UserRound } from 'lucide-vue-next';
import { PROFILE_NAME_MAX_LEN } from '~/utils/account/accountProfileEdit';

defineProps<{
    canEditProfileNames: boolean;
    editFirstNameError: string;
    editLastNameError: string;
    firstName: string | null | undefined;
    formatProfileField: (value: string | null | undefined) => string;
    inlineProfileEditing: boolean;
    isInlineProfileSaving: boolean;
    lastName: string | null | undefined;
}>();

const editFirstName = defineModel<string>('editFirstName', { required: true });
const editLastName = defineModel<string>('editLastName', { required: true });
</script>

<template>
    <section aria-labelledby="account-personal-data-heading">
        <div class="mb-2 flex items-center gap-2">
            <UserRound
                class="text-muted-foreground size-4"
                aria-hidden="true"
            />
            <h3
                id="account-personal-data-heading"
                class="text-foreground text-sm font-semibold"
            >
                Dane osobowe
            </h3>
        </div>

        <div
            v-if="inlineProfileEditing && canEditProfileNames"
            class="grid gap-4"
        >
            <label class="grid gap-1.5" for="account-first-name">
                <span class="text-foreground text-sm font-medium">Imię</span>
                <UiInput
                    id="account-first-name"
                    v-model="editFirstName"
                    name="firstName"
                    autocomplete="given-name"
                    :maxlength="PROFILE_NAME_MAX_LEN"
                    :disabled="isInlineProfileSaving"
                    :aria-invalid="Boolean(editFirstNameError)"
                    :aria-describedby="
                        editFirstNameError
                            ? 'account-first-name-error'
                            : undefined
                    "
                    required
                />
                <span
                    v-if="editFirstNameError"
                    id="account-first-name-error"
                    class="text-destructive text-xs font-medium"
                    aria-live="polite"
                >
                    {{ editFirstNameError }}
                </span>
            </label>

            <label class="grid gap-1.5" for="account-last-name">
                <span class="text-foreground text-sm font-medium"
                    >Nazwisko</span
                >
                <UiInput
                    id="account-last-name"
                    v-model="editLastName"
                    name="lastName"
                    autocomplete="family-name"
                    :maxlength="PROFILE_NAME_MAX_LEN"
                    :disabled="isInlineProfileSaving"
                    :aria-invalid="Boolean(editLastNameError)"
                    :aria-describedby="
                        editLastNameError
                            ? 'account-last-name-error'
                            : undefined
                    "
                    required
                />
                <span
                    v-if="editLastNameError"
                    id="account-last-name-error"
                    class="text-destructive text-xs font-medium"
                    aria-live="polite"
                >
                    {{ editLastNameError }}
                </span>
            </label>
        </div>

        <dl v-else class="divide-border divide-y">
            <div class="flex min-w-0 items-start justify-between gap-4 py-2">
                <dt class="text-muted-foreground text-sm">Imię</dt>
                <dd
                    class="text-foreground min-w-0 text-right text-sm font-semibold break-words"
                >
                    {{ formatProfileField(firstName) }}
                </dd>
            </div>
            <div class="flex min-w-0 items-start justify-between gap-4 py-2">
                <dt class="text-muted-foreground text-sm">Nazwisko</dt>
                <dd
                    class="text-foreground min-w-0 text-right text-sm font-semibold break-words"
                >
                    {{ formatProfileField(lastName) }}
                </dd>
            </div>
        </dl>
    </section>
</template>
