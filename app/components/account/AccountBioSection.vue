<script setup lang="ts">
import { AlignLeft } from 'lucide-vue-next';
import { PROFILE_BIO_MAX_LEN } from '~/utils/account/accountProfileEdit';
import type { AuthSession } from '~/utils/auth/authSessionMapper';

defineProps<{
    canEditPhoneAndBio: boolean;
    editBioError: string;
    formatProfileField: (value: string | null | undefined) => string;
    inlineProfileEditing: boolean;
    isInlineProfileSaving: boolean;
    session: AuthSession | null;
}>();

const editBio = defineModel<string>('editBio', { required: true });
</script>

<template>
    <section aria-labelledby="account-bio-heading">
        <div class="mb-2 flex items-center gap-2">
            <AlignLeft
                class="text-muted-foreground size-4"
                aria-hidden="true"
            />
            <h3
                id="account-bio-heading"
                class="text-foreground text-sm font-semibold"
            >
                Opis
            </h3>
        </div>

        <label
            v-if="inlineProfileEditing && canEditPhoneAndBio"
            class="grid gap-1.5"
            for="account-bio"
        >
            <span class="text-foreground text-sm font-medium">O mnie</span>
            <UiTextarea
                id="account-bio"
                v-model="editBio"
                name="bio"
                autocomplete="off"
                class="min-h-28 resize-y"
                :maxlength="PROFILE_BIO_MAX_LEN"
                :disabled="isInlineProfileSaving"
                :aria-invalid="Boolean(editBioError)"
                :aria-describedby="
                    editBioError
                        ? 'account-bio-error account-bio-count'
                        : 'account-bio-count'
                "
            />
            <span
                v-if="editBioError"
                id="account-bio-error"
                class="text-destructive text-xs font-medium"
                aria-live="polite"
            >
                {{ editBioError }}
            </span>
            <span
                id="account-bio-count"
                class="text-muted-foreground text-right text-xs tabular-nums"
            >
                {{ editBio.length }} / {{ PROFILE_BIO_MAX_LEN }}
            </span>
        </label>

        <dl v-else>
            <div
                v-if="session && session.bio !== undefined"
                class="grid gap-1.5 py-2"
            >
                <dt class="sr-only">Opis profilu</dt>
                <dd
                    class="text-foreground text-sm leading-relaxed break-words whitespace-pre-wrap"
                >
                    {{ formatProfileField(session.bio) }}
                </dd>
            </div>
        </dl>
    </section>
</template>
