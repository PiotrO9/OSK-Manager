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

const { session, refreshProfileFromServer, patchProfile } = useAuthSession();
const { addToast } = useAppToast();

const PROFILE_NAME_MAX_LEN = 100;

type RoleBadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline';

interface RoleBadgePresentation {
    label: string;
    variant: RoleBadgeVariant;
    class?: string;
}

function getRoleBadgePresentation(
    role: string | undefined,
): RoleBadgePresentation {
    if (!role || role.trim() === '') {
        return {
            label: 'Nieznana rola',
            variant: 'outline',
            class: 'border-zinc-400/70 bg-zinc-500 px-2.5 py-1 font-semibold text-white opacity-95 shadow-sm dark:bg-zinc-500',
        };
    }

    const r = role.trim().toUpperCase();

    /* Kolory: wyraźne tła + `outline` jako baza, potem pełne nadpisanie (tailwind-merge). */
    switch (r) {
        case 'STUDENT':
            return {
                label: 'Kursant',
                variant: 'outline',
                class: 'border-cyan-600/50 bg-cyan-500 px-2.5 py-1 font-semibold text-white shadow-sm dark:border-cyan-400/60 dark:bg-cyan-600',
            };
        case 'INSTRUCTOR':
            return {
                label: 'Instruktor',
                variant: 'outline',
                class: 'border-emerald-700/45 bg-emerald-600 px-2.5 py-1 font-semibold text-white shadow-sm dark:border-emerald-400/50 dark:bg-emerald-600',
            };
        case 'MANAGER':
            return {
                label: 'Manager',
                variant: 'outline',
                class: 'border-blue-700/50 bg-blue-600 px-2.5 py-1 font-semibold text-white shadow-sm dark:border-blue-400/55 dark:bg-blue-600',
            };
        case 'ADMIN':
            return {
                label: 'Administrator',
                variant: 'outline',
                class: 'border-fuchsia-800/50 bg-fuchsia-700 px-2.5 py-1 font-semibold text-white shadow-sm dark:border-fuchsia-400/55 dark:bg-fuchsia-700',
            };
        case 'DEMO':
            return {
                label: 'Tryb demo',
                variant: 'outline',
                class: 'border-2 border-dashed border-amber-600 bg-amber-100 px-2.5 py-1 font-semibold text-amber-950 shadow-sm dark:border-amber-400 dark:bg-amber-950/50 dark:text-amber-50',
            };
        default:
            return {
                label: role.trim(),
                variant: 'outline',
                class: 'border-zinc-500/55 bg-zinc-600 px-2.5 py-1 font-semibold text-white shadow-sm dark:bg-zinc-600',
            };
    }
}

function roleAllowsProfileNames(role: string | undefined): boolean {
    if (!role) return false;

    const r = role.trim().toUpperCase();

    return r === 'MANAGER' || r === 'ADMIN';
}

const canEditProfileNames = computed(() =>
    roleAllowsProfileNames(session.value?.role),
);

function roleAllowsPhoneAndBio(role: string | undefined): boolean {
    if (!role) return false;

    const r = role.trim().toUpperCase();

    return r === 'STUDENT' || r === 'INSTRUCTOR';
}

const canEditPhoneAndBio = computed(() =>
    roleAllowsPhoneAndBio(session.value?.role),
);

const editFirstName = ref('');
const editLastName = ref('');
const profileNamesError = ref('');
const isProfileNamesSaving = ref(false);

const editPhone = ref('');
const editBio = ref('');
const profileContactError = ref('');
const isProfileContactSaving = ref(false);

const PROFILE_BIO_MAX_LEN = 2000;

function syncNameFormFromSession() {
    const s = session.value;

    if (!s || !roleAllowsProfileNames(s.role)) return;

    editFirstName.value = s.firstName ?? '';
    editLastName.value = s.lastName ?? '';
}

function syncContactFormFromSession() {
    const s = session.value;

    if (!s || !roleAllowsPhoneAndBio(s.role)) return;

    editPhone.value =
        s.phone === null || s.phone === undefined ? '' : String(s.phone);

    editBio.value = s.bio === null || s.bio === undefined ? '' : String(s.bio);
}

watch(
    () => session.value?.userId,
    () => {
        syncNameFormFromSession();
        syncContactFormFromSession();
    },
    { immediate: true },
);

watch(canEditProfileNames, (ok) => {
    if (ok) syncNameFormFromSession();
});

watch(canEditPhoneAndBio, (ok) => {
    if (ok) syncContactFormFromSession();
});

const isDemoSession = computed(() => session.value?.userId === 'demo');

const showProfileNamesEditButton = computed(() =>
    Boolean(session.value && !isDemoSession.value && canEditProfileNames.value),
);

const showProfileContactEditButton = computed(() =>
    Boolean(session.value && !isDemoSession.value && canEditPhoneAndBio.value),
);

const namesDialogOpen = ref(false);
const contactDialogOpen = ref(false);

function handleOpenNamesDialog() {
    if (!session.value || isDemoSession.value) return;

    profileNamesError.value = '';
    syncNameFormFromSession();
    namesDialogOpen.value = true;
}

function handleNamesDialogOpenChange(open: boolean) {
    namesDialogOpen.value = open;

    if (!open) profileNamesError.value = '';
}

function handleOpenContactDialog() {
    if (!session.value || isDemoSession.value) return;

    profileContactError.value = '';
    syncContactFormFromSession();
    contactDialogOpen.value = true;
}

function handleContactDialogOpenChange(open: boolean) {
    contactDialogOpen.value = open;

    if (!open) profileContactError.value = '';
}

const avatarFileInputRef = ref<HTMLInputElement | null>(null);
const isAvatarUploadLoading = ref(false);
const avatarImageFailed = ref(false);

const displayName = computed(() => session.value?.userName ?? 'Użytkownik');

const sessionRoleBadge = computed(() =>
    getRoleBadgePresentation(session.value?.role),
);

const isStudentSession = computed(
    () => session.value?.role?.trim().toUpperCase() === 'STUDENT',
);

function hasPkkNumber(value: string | null | undefined): boolean {
    return typeof value === 'string' && value.trim().length > 0;
}

const accountPkkNumber = computed(() => {
    const raw = session.value?.pkkNumber;

    return hasPkkNumber(raw) ? raw.trim() : 'Brak przypisanego PKK';
});

const isAccountPkkMissing = computed(
    () => !hasPkkNumber(session.value?.pkkNumber),
);

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

async function handleProfileNamesSubmit() {
    profileNamesError.value = '';

    const first = editFirstName.value.trim();
    const last = editLastName.value.trim();

    if (!first) {
        profileNamesError.value = 'Imię jest wymagane.';

        return;
    }

    if (!last) {
        profileNamesError.value = 'Nazwisko jest wymagane.';

        return;
    }

    if (
        first.length > PROFILE_NAME_MAX_LEN ||
        last.length > PROFILE_NAME_MAX_LEN
    ) {
        profileNamesError.value = `Każde pole może mieć co najwyżej ${PROFILE_NAME_MAX_LEN} znaków.`;

        return;
    }

    if (isProfileNamesSaving.value) return;

    isProfileNamesSaving.value = true;

    try {
        await patchProfile({ firstName: first, lastName: last });

        namesDialogOpen.value = false;

        addToast({
            variant: 'success',
            title: 'Profil zaktualizowany',
        });
    } catch (err: unknown) {
        addToast({
            variant: 'error',
            title: 'Nie zapisano zmian',
            description: getApiFetchErrorMessage(err, 'Spróbuj ponownie.'),
        });
    } finally {
        isProfileNamesSaving.value = false;
    }
}

async function handleProfileContactSubmit() {
    profileContactError.value = '';

    const phone = editPhone.value.trim();
    const bio = editBio.value.trim();

    if (!phone && !bio) {
        profileContactError.value =
            'Podaj numer telefonu lub treść w polu „O mnie” (albo oba).';

        return;
    }

    if (bio.length > PROFILE_BIO_MAX_LEN) {
        profileContactError.value = `Opis może mieć co najwyżej ${PROFILE_BIO_MAX_LEN} znaków.`;

        return;
    }

    if (isProfileContactSaving.value) return;

    isProfileContactSaving.value = true;

    try {
        await patchProfile({
            phone: phone.length > 0 ? phone : null,
            bio: bio.length > 0 ? bio : null,
        });

        contactDialogOpen.value = false;

        addToast({
            variant: 'success',
            title: 'Profil zaktualizowany',
        });
    } catch (err: unknown) {
        addToast({
            variant: 'error',
            title: 'Nie zapisano zmian',
            description: getApiFetchErrorMessage(err, 'Spróbuj ponownie.'),
        });
    } finally {
        isProfileContactSaving.value = false;
    }
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
                    <div
                        class="flex flex-wrap items-start justify-between gap-3"
                    >
                        <div class="min-w-0 flex-1">
                            <dt class="text-muted-foreground font-medium">
                                Imię i nazwisko
                            </dt>
                            <dd class="text-foreground mt-0.5 font-medium">
                                {{ displayName }}
                            </dd>
                        </div>
                        <UiButton
                            v-if="showProfileNamesEditButton"
                            type="button"
                            variant="outline"
                            size="sm"
                            class="shrink-0"
                            :disabled="
                                isProfileNamesSaving || isProfileContactSaving
                            "
                            aria-label="Otwórz edycję imienia i nazwiska"
                            @click="handleOpenNamesDialog"
                        >
                            Zmień
                        </UiButton>
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
                        <dd class="mt-0.5">
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
                        <dt class="text-muted-foreground font-medium">
                            Numer PKK
                        </dt>
                        <dd
                            class="text-foreground mt-0.5 font-medium"
                            :class="{
                                'text-muted-foreground': isAccountPkkMissing,
                            }"
                        >
                            {{ accountPkkNumber }}
                        </dd>
                    </div>
                    <div
                        v-if="showProfileContactEditButton"
                        class="flex justify-end pt-0.5"
                    >
                        <UiButton
                            type="button"
                            variant="outline"
                            size="sm"
                            :disabled="
                                isProfileNamesSaving || isProfileContactSaving
                            "
                            aria-label="Otwórz edycję telefonu i opisu profilu"
                            @click="handleOpenContactDialog"
                        >
                            Edytuj telefon i opis
                        </UiButton>
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
                </dl>
            </UiCardContent>
        </UiCard>

        <AccountProfileNamesFormDialog
            :open="namesDialogOpen"
            :first-name="editFirstName"
            :last-name="editLastName"
            :is-saving="isProfileNamesSaving"
            :error-message="profileNamesError"
            :name-max-len="PROFILE_NAME_MAX_LEN"
            @update:open="handleNamesDialogOpenChange"
            @update:first-name="editFirstName = $event"
            @update:last-name="editLastName = $event"
            @submit="handleProfileNamesSubmit"
        />

        <AccountProfileContactFormDialog
            :open="contactDialogOpen"
            :phone="editPhone"
            :bio="editBio"
            :is-saving="isProfileContactSaving"
            :error-message="profileContactError"
            :bio-max-len="PROFILE_BIO_MAX_LEN"
            @update:open="handleContactDialogOpenChange"
            @update:phone="editPhone = $event"
            @update:bio="editBio = $event"
            @submit="handleProfileContactSubmit"
        />
    </div>
</template>
