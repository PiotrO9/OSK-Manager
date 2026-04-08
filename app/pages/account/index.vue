<script setup lang="ts">
import { getApiFetchErrorMessage } from '~/utils/apiFetchErrorMessage';
import { resolveBffEndpoint } from '~/utils/bffEndpoint';

definePageMeta({
    layout: 'app-shell',
});

usePageMeta({
    title: () => 'Moje konto',
    description: () => 'Dane profilu i avatar.',
});

const MAX_AVATAR_BYTES = 5 * 1024 * 1024;

const ALLOWED_AVATAR_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

const { session, refreshProfileFromServer } = useAuthSession();
const { addToast } = useAppToast();

const avatarFileInputRef = ref<HTMLInputElement | null>(null);
const isAvatarUploadLoading = ref(false);
const avatarImageFailed = ref(false);

const isDemoSession = computed(() => session.value?.userId === 'demo');

const displayName = computed(() => session.value?.userName ?? 'Użytkownik');

function userInitialsFromName(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean);

    if (parts.length === 0) {
        return 'U';
    }

    if (parts.length === 1) {
        const w = parts[0] ?? '';

        return w.slice(0, 2).toUpperCase();
    }

    const a = parts[0]?.[0] ?? '';
    const b = parts[1]?.[0] ?? '';
    const pair = `${a}${b}`.toUpperCase();

    return pair || 'U';
}

const userInitials = computed(() => userInitialsFromName(displayName.value));

const avatarSrc = computed(() => {
    const raw = session.value?.avatarUrl;

    if (typeof raw !== 'string' || raw.trim() === '') {
        return '';
    }

    return raw.trim();
});

watch(avatarSrc, () => {
    avatarImageFailed.value = false;
});

const showAvatarImage = computed(
    () => Boolean(avatarSrc.value) && !avatarImageFailed.value,
);

function handleAvatarImageError() {
    avatarImageFailed.value = true;
}

function handleChooseAvatarClick() {
    if (isDemoSession.value || isAvatarUploadLoading.value) return;

    avatarFileInputRef.value?.click();
}

function handleChooseAvatarKeyDown(event: KeyboardEvent) {
    if (event.key !== 'Enter' && event.key !== ' ') return;

    event.preventDefault();
    handleChooseAvatarClick();
}

async function handleAvatarFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    input.value = '';

    if (!file || isDemoSession.value) return;

    if (!ALLOWED_AVATAR_TYPES.has(file.type)) {
        addToast({
            variant: 'error',
            title: 'Nieobsługiwany format',
            description: 'Dozwolone: JPEG, PNG, WebP.',
        });

        return;
    }

    if (file.size > MAX_AVATAR_BYTES) {
        addToast({
            variant: 'error',
            title: 'Plik za duży',
            description: 'Maksymalny rozmiar avatara to 5 MB.',
        });

        return;
    }

    isAvatarUploadLoading.value = true;

    try {
        const url = resolveBffEndpoint('/api/auth/profile/avatar');
        const body = new FormData();

        body.append('file', file, file.name);

        const raw = await $fetch<{
            success?: boolean;
            data?: { photoUrl?: string };
        }>(url, {
            method: 'POST',
            body,
            credentials: 'include',
        });

        if (raw?.success !== true || !raw?.data?.photoUrl) {
            throw new Error('Nieprawidłowa odpowiedź serwera.');
        }

        await refreshProfileFromServer();

        addToast({
            variant: 'success',
            title: 'Avatar zaktualizowany',
        });
    } catch (err: unknown) {
        addToast({
            variant: 'error',
            title: 'Upload nie powiódł się',
            description: getApiFetchErrorMessage(
                err,
                'Spróbuj ponownie później.',
            ),
        });
    } finally {
        isAvatarUploadLoading.value = false;
    }
}

function formatProfileField(value: string | null | undefined): string {
    if (value === null || value === undefined || value.trim() === '') {
        return '—';
    }

    return value.trim();
}
</script>

<template>
    <div class="mx-auto w-full max-w-lg space-y-6">
        <div>
            <h1 class="text-foreground text-2xl font-semibold tracking-tight">
                Moje konto
            </h1>
            <p class="text-muted-foreground mt-1 text-sm">
                Podgląd danych profilu i zmiana zdjęcia używanego jako avatar.
            </p>
        </div>

        <UiCard aria-label="Karta: dane konta">
            <UiCardHeader>
                <UiCardTitle>Profil</UiCardTitle>
            </UiCardHeader>
            <UiCardContent class="space-y-6">
                <div class="flex flex-col gap-4 sm:flex-row sm:items-start">
                    <div
                        class="border-border bg-muted/40 relative flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-full border"
                        aria-hidden="true"
                    >
                        <img
                            v-if="showAvatarImage"
                            :src="avatarSrc"
                            alt=""
                            class="size-full object-cover"
                            loading="lazy"
                            @error="handleAvatarImageError"
                        />
                        <span
                            v-else
                            class="text-muted-foreground text-xl font-semibold tracking-tight"
                        >
                            {{ userInitials }}
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
                            @change="handleAvatarFileChange"
                        />
                        <UiButton
                            type="button"
                            variant="secondary"
                            :disabled="isDemoSession || isAvatarUploadLoading"
                            :aria-busy="isAvatarUploadLoading"
                            @click="handleChooseAvatarClick"
                            @keydown="handleChooseAvatarKeyDown"
                        >
                            {{
                                isAvatarUploadLoading
                                    ? 'Wysyłanie…'
                                    : 'Zmień avatar'
                            }}
                        </UiButton>
                        <p
                            v-if="isDemoSession"
                            class="text-muted-foreground text-sm"
                            role="status"
                        >
                            W trybie demo nie można przesłać avatara.
                        </p>
                        <p v-else class="text-muted-foreground text-xs">
                            JPEG, PNG lub WebP, do 5 MB.
                        </p>
                    </div>
                </div>

                <dl class="space-y-3 text-sm">
                    <div>
                        <dt class="text-muted-foreground font-medium">
                            Imię i nazwisko
                        </dt>
                        <dd class="text-foreground mt-0.5 font-medium">
                            {{ displayName }}
                        </dd>
                    </div>
                    <div v-if="session?.email">
                        <dt class="text-muted-foreground font-medium">
                            E-mail
                        </dt>
                        <dd class="text-foreground mt-0.5 break-all">
                            {{ session.email }}
                        </dd>
                    </div>
                    <div v-if="session?.role">
                        <dt class="text-muted-foreground font-medium">Rola</dt>
                        <dd class="text-foreground mt-0.5">
                            {{ session.role }}
                        </dd>
                    </div>
                    <div v-if="session && session.phone !== undefined">
                        <dt class="text-muted-foreground font-medium">
                            Telefon
                        </dt>
                        <dd class="text-foreground mt-0.5">
                            {{ formatProfileField(session.phone) }}
                        </dd>
                    </div>
                    <div v-if="session && session.bio !== undefined">
                        <dt class="text-muted-foreground font-medium">
                            O mnie
                        </dt>
                        <dd class="text-foreground mt-0.5 whitespace-pre-wrap">
                            {{ formatProfileField(session.bio) }}
                        </dd>
                    </div>
                    <div v-if="session?.profileUpdatedAt">
                        <dt class="text-muted-foreground font-medium">
                            Profil zaktualizowany
                        </dt>
                        <dd class="text-foreground mt-0.5">
                            {{ session.profileUpdatedAt }}
                        </dd>
                    </div>
                </dl>
            </UiCardContent>
        </UiCard>
    </div>
</template>
