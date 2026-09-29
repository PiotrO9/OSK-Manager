<script setup lang="ts">
import { Phone } from 'lucide-vue-next';
import type { AuthSession } from '~/utils/auth/authSessionMapper';

defineProps<{
    canEditPhoneAndBio: boolean;
    formatProfileField: (value: string | null | undefined) => string;
    inlineProfileEditing: boolean;
    isInlineProfileSaving: boolean;
    session: AuthSession | null;
}>();

const editPhone = defineModel<string>('editPhone', { required: true });
</script>

<template>
    <section aria-labelledby="account-contact-heading">
        <div class="mb-2 flex items-center gap-2">
            <Phone class="text-muted-foreground size-4" aria-hidden="true" />
            <h3
                id="account-contact-heading"
                class="text-foreground text-sm font-semibold"
            >
                Kontakt
            </h3>
        </div>

        <div v-if="inlineProfileEditing && canEditPhoneAndBio">
            <label class="grid gap-1.5" for="account-phone">
                <span class="text-foreground text-sm font-medium">Telefon</span>
                <UiInput
                    id="account-phone"
                    v-model="editPhone"
                    name="phone"
                    type="tel"
                    inputmode="tel"
                    autocomplete="tel"
                    :disabled="isInlineProfileSaving"
                />
            </label>
        </div>

        <dl v-else>
            <div
                v-if="session && session.phone !== undefined"
                class="flex min-w-0 items-start justify-between gap-4 py-2"
            >
                <dt class="text-muted-foreground text-sm">Telefon</dt>
                <dd
                    class="text-foreground min-w-0 text-right text-sm font-medium break-words"
                >
                    {{ formatProfileField(session.phone) }}
                </dd>
            </div>
        </dl>
    </section>
</template>
