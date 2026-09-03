<script setup lang="ts">
import { Camera, IdCard, Info, Mail, Phone, UserRound } from 'lucide-vue-next';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/shadcn/tooltip';
import type { RoleBadgePresentation } from '~/composables/account/useAccountPage';
import {
    PROFILE_BIO_MAX_LEN,
    PROFILE_NAME_MAX_LEN,
} from '~/utils/account/accountProfileEdit';
import type { AuthSession } from '~/utils/auth/authSessionMapper';

defineProps<{
    accountPkkNumber: string;
    avatarSrc: string;
    canEditPhoneAndBio: boolean;
    canEditProfileNames: boolean;
    displayName: string;
    formatProfileField: (value: string | null | undefined) => string;
    inlineProfileEditing: boolean;
    isAccountPkkMissing: boolean;
    isAvatarUploadLoading: boolean;
    isDemoSession: boolean;
    isInlineProfileSaving: boolean;
    isStudentSession: boolean;
    profileContactError: string;
    profileNamesError: string;
    session: AuthSession | null;
    sessionRoleBadge: RoleBadgePresentation;
    showAvatarImage: boolean;
    userInitials: string;
}>();
defineEmits<{
    avatarError: [];
    avatarFileChange: [event: Event];
    chooseAvatar: [];
    chooseAvatarKeydown: [event: KeyboardEvent];
}>();
const avatarFileInputRef = defineModel<HTMLInputElement | null>(
    'avatarFileInputRef',
    {
        required: true,
    },
);
const editFirstName = defineModel<string>('editFirstName', { required: true });
const editLastName = defineModel<string>('editLastName', { required: true });
const editPhone = defineModel<string>('editPhone', { required: true });
const editBio = defineModel<string>('editBio', { required: true });
</script>

<template>
    <UiCard
        class="border-border bg-card overflow-hidden rounded-2xl shadow-sm"
        aria-label="Karta: dane konta"
    >
        <UiCardContent class="flex flex-col gap-4 px-6 py-0">
            <div
                class="border-border/70 bg-muted/20 flex flex-col gap-4 rounded-2xl border px-4 py-4 sm:flex-row sm:items-center"
            >
                <div
                    class="border-border bg-muted/40 relative flex size-32 shrink-0 items-center justify-center overflow-hidden rounded-2xl border"
                    aria-hidden="true"
                >
                    <img
                        v-if="showAvatarImage"
                        :src="avatarSrc"
                        alt=""
                        class="size-full object-cover"
                        loading="lazy"
                        @error="$emit('avatarError')"
                    />
                    <span
                        v-else
                        class="text-foreground text-2xl font-bold tracking-tight"
                    >
                        {{ userInitials }}
                    </span>
                    <span
                        class="bg-primary text-primary-foreground absolute right-2 bottom-2 inline-flex size-8 items-center justify-center rounded-full shadow-sm"
                        aria-hidden="true"
                    >
                        <Camera class="size-4" />
                    </span>
                </div>
                <div class="min-w-0 flex-1 space-y-3">
                    <input
                        ref="avatarFileInputRef"
                        type="file"
                        class="sr-only"
                        accept="image/jpeg,image/png,image/webp"
                        aria-label="Wybierz plik obrazu avatara"
                        :disabled="isDemoSession || isAvatarUploadLoading"
                        @change="$emit('avatarFileChange', $event)"
                    />
                    <div class="space-y-1">
                        <div class="flex items-center gap-2">
                            <p class="text-foreground text-sm font-semibold">
                                Zdjęcie profilowe
                            </p>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger as-child>
                                        <button
                                            type="button"
                                            class="text-muted-foreground hover:text-foreground focus-visible:ring-ring inline-flex size-5 items-center justify-center rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                                            aria-label="Wymagania zdjęcia profilowego"
                                        >
                                            <Info
                                                class="size-4"
                                                aria-hidden="true"
                                            />
                                        </button>
                                    </TooltipTrigger>
                                    <TooltipContent side="right" align="center">
                                        JPEG, PNG lub WebP, do 5 MB.
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                        <p
                            v-if="isDemoSession"
                            class="text-muted-foreground text-sm"
                            role="status"
                        >
                            W trybie demo nie można przesłać avatara.
                        </p>
                    </div>
                    <UiButton
                        type="button"
                        variant="secondary"
                        :disabled="isDemoSession || isAvatarUploadLoading"
                        :aria-busy="isAvatarUploadLoading"
                        @click="$emit('chooseAvatar')"
                        @keydown="$emit('chooseAvatarKeydown', $event)"
                    >
                        {{
                            isAvatarUploadLoading
                                ? 'Wysyłanie…'
                                : 'Zmień avatar'
                        }}
                    </UiButton>
                </div>
            </div>

            <dl class="grid gap-4 text-sm sm:grid-cols-2">
                <div
                    class="flex flex-wrap items-start justify-between gap-3 sm:col-span-2"
                >
                    <div class="min-w-0 flex-1">
                        <dt
                            class="text-foreground flex items-center gap-2 text-xs font-semibold"
                        >
                            <UserRound
                                class="text-muted-foreground size-4"
                                aria-hidden="true"
                            />
                            Imię i nazwisko
                        </dt>
                        <div
                            v-if="inlineProfileEditing && canEditProfileNames"
                            class="mt-2 grid gap-3 sm:grid-cols-2"
                        >
                            <label class="grid gap-1.5">
                                <span
                                    class="text-muted-foreground text-xs font-medium"
                                >
                                    Imię
                                </span>
                                <UiInput
                                    v-model="editFirstName"
                                    :maxlength="PROFILE_NAME_MAX_LEN"
                                    autocomplete="given-name"
                                    :disabled="isInlineProfileSaving"
                                    aria-label="Imię"
                                />
                            </label>
                            <label class="grid gap-1.5">
                                <span
                                    class="text-muted-foreground text-xs font-medium"
                                >
                                    Nazwisko
                                </span>
                                <UiInput
                                    v-model="editLastName"
                                    :maxlength="PROFILE_NAME_MAX_LEN"
                                    autocomplete="family-name"
                                    :disabled="isInlineProfileSaving"
                                    aria-label="Nazwisko"
                                />
                            </label>
                            <p
                                v-if="profileNamesError"
                                class="text-destructive text-xs font-medium sm:col-span-2"
                            >
                                {{ profileNamesError }}
                            </p>
                        </div>
                        <dd
                            v-else
                            class="border-border bg-background text-foreground mt-2 min-h-10 rounded-xl border px-3 py-2.5 font-medium"
                        >
                            {{ displayName }}
                        </dd>
                    </div>
                </div>
                <div v-if="session?.email">
                    <dt
                        class="text-foreground flex items-center gap-2 text-xs font-semibold"
                    >
                        <Mail
                            class="text-muted-foreground size-4"
                            aria-hidden="true"
                        />
                        Email
                    </dt>
                    <dd
                        class="border-border bg-background text-foreground mt-2 min-h-10 rounded-xl border px-3 py-2.5 break-all"
                    >
                        {{ session.email }}
                    </dd>
                </div>
                <div v-if="session?.role">
                    <dt
                        class="text-foreground flex items-center gap-2 text-xs font-semibold"
                    >
                        <IdCard
                            class="text-muted-foreground size-4"
                            aria-hidden="true"
                        />
                        Rola
                    </dt>
                    <dd class="mt-2">
                        <UiBadge
                            :variant="sessionRoleBadge.variant"
                            :class="sessionRoleBadge.class"
                            class="cursor-default text-xs"
                        >
                            {{ sessionRoleBadge.label }}
                        </UiBadge>
                    </dd>
                </div>
                <div v-if="isStudentSession">
                    <dt class="text-foreground text-xs font-semibold">
                        Numer PKK
                    </dt>
                    <dd
                        class="border-border bg-background text-foreground mt-2 min-h-10 rounded-xl border px-3 py-2.5 font-medium"
                        :class="{
                            'text-muted-foreground': isAccountPkkMissing,
                        }"
                    >
                        {{ accountPkkNumber }}
                    </dd>
                </div>
                <div v-if="session && session.phone !== undefined">
                    <dt
                        class="text-foreground flex items-center gap-2 text-xs font-semibold"
                    >
                        <Phone
                            class="text-muted-foreground size-4"
                            aria-hidden="true"
                        />
                        Telefon
                    </dt>
                    <UiInput
                        v-if="inlineProfileEditing && canEditPhoneAndBio"
                        v-model="editPhone"
                        type="tel"
                        autocomplete="tel"
                        class="mt-2"
                        :disabled="isInlineProfileSaving"
                        aria-label="Telefon"
                    />
                    <dd
                        v-else
                        class="border-border bg-background text-foreground mt-2 min-h-10 rounded-xl border px-3 py-2.5"
                    >
                        {{ formatProfileField(session.phone) }}
                    </dd>
                </div>
                <div
                    v-if="session && session.bio !== undefined"
                    class="sm:col-span-2"
                >
                    <dt class="text-foreground text-xs font-semibold">
                        O mnie
                    </dt>
                    <UiTextarea
                        v-if="inlineProfileEditing && canEditPhoneAndBio"
                        v-model="editBio"
                        class="mt-2 min-h-28 resize-y"
                        :maxlength="PROFILE_BIO_MAX_LEN"
                        :disabled="isInlineProfileSaving"
                        aria-label="O mnie"
                    />
                    <dd
                        v-else
                        class="border-border bg-background text-foreground mt-2 min-h-24 rounded-xl border px-3 py-2.5 leading-relaxed whitespace-pre-wrap"
                    >
                        {{ formatProfileField(session.bio) }}
                    </dd>
                    <p
                        v-if="
                            inlineProfileEditing &&
                            canEditPhoneAndBio &&
                            profileContactError
                        "
                        class="text-destructive mt-2 text-xs font-medium"
                    >
                        {{ profileContactError }}
                    </p>
                </div>
            </dl>
        </UiCardContent>
    </UiCard>
</template>
