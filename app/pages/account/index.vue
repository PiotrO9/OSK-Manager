<script setup lang="ts">
import {
    Camera,
    IdCard,
    Info,
    Mail,
    Pencil,
    Phone,
    Save,
    UserRound,
    X,
} from 'lucide-vue-next';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/shadcn/tooltip';
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

const inlineProfileEditing = ref(false);

const canEditInlineProfile = computed(
    () =>
        Boolean(session.value && !isDemoSession.value) &&
        (canEditProfileNames.value || canEditPhoneAndBio.value),
);

const isInlineProfileSaving = computed(
    () => isProfileNamesSaving.value || isProfileContactSaving.value,
);

function handleStartInlineProfileEdit() {
    if (!canEditInlineProfile.value) return;

    profileNamesError.value = '';
    profileContactError.value = '';
    syncNameFormFromSession();
    syncContactFormFromSession();
    inlineProfileEditing.value = true;
}

function handleCancelInlineProfileEdit() {
    profileNamesError.value = '';
    profileContactError.value = '';
    syncNameFormFromSession();
    syncContactFormFromSession();
    inlineProfileEditing.value = false;
}

async function handleInlineProfileSubmit() {
    if (!canEditInlineProfile.value || isInlineProfileSaving.value) return;

    profileNamesError.value = '';
    profileContactError.value = '';

    const payload: {
        firstName?: string;
        lastName?: string;
        phone?: string | null;
        bio?: string | null;
    } = {};

    if (canEditProfileNames.value) {
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

        payload.firstName = first;
        payload.lastName = last;
    }

    if (canEditPhoneAndBio.value) {
        const phone = editPhone.value.trim();
        const bio = editBio.value.trim();

        if (bio.length > PROFILE_BIO_MAX_LEN) {
            profileContactError.value = `Opis może mieć co najwyżej ${PROFILE_BIO_MAX_LEN} znaków.`;

            return;
        }

        payload.phone = phone.length > 0 ? phone : null;
        payload.bio = bio.length > 0 ? bio : null;
    }

    isProfileNamesSaving.value = canEditProfileNames.value;
    isProfileContactSaving.value = canEditPhoneAndBio.value;

    try {
        await patchProfile(payload);
        inlineProfileEditing.value = false;

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
        isProfileContactSaving.value = false;
    }
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
</script>

<template>
    <div class="mx-auto w-full max-w-[1120px] space-y-5 md:space-y-6">
        <div
            class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between"
        >
            <div>
                <h1
                    class="text-foreground text-2xl leading-tight font-bold tracking-tight md:text-3xl"
                >
                    Konto użytkownika
                </h1>
                <p
                    class="text-muted-foreground mt-1 max-w-2xl text-sm leading-relaxed"
                >
                    Dane profilu, rola i ustawienia konta w jednym miejscu.
                </p>
            </div>

            <div v-if="canEditInlineProfile" class="flex flex-wrap gap-2">
                <UiButton
                    v-if="!inlineProfileEditing"
                    type="button"
                    variant="outline"
                    class="gap-2"
                    :disabled="isInlineProfileSaving"
                    aria-label="Włącz edycję profilu"
                    @click="handleStartInlineProfileEdit"
                >
                    <Pencil class="size-4" aria-hidden="true" />
                    Edytuj profil
                </UiButton>
                <UiButton
                    v-if="inlineProfileEditing"
                    type="button"
                    variant="outline"
                    class="gap-2"
                    :disabled="isInlineProfileSaving"
                    aria-label="Anuluj edycję profilu"
                    @click="handleCancelInlineProfileEdit"
                >
                    <X class="size-4" aria-hidden="true" />
                    Anuluj
                </UiButton>
                <UiButton
                    v-if="inlineProfileEditing"
                    type="button"
                    class="gap-2"
                    :disabled="isInlineProfileSaving"
                    :aria-busy="isInlineProfileSaving"
                    aria-label="Zapisz profil"
                    @click="handleInlineProfileSubmit"
                >
                    <Save class="size-4" aria-hidden="true" />
                    {{ isInlineProfileSaving ? 'Zapisywanie...' : 'Zapisz' }}
                </UiButton>
            </div>
        </div>

        <div class="grid gap-4">
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
                                @error="handleAvatarImageError"
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
                                :disabled="
                                    isDemoSession || isAvatarUploadLoading
                                "
                                @change="handleAvatarFileChange"
                            />
                            <div class="space-y-1">
                                <div class="flex items-center gap-2">
                                    <p
                                        class="text-foreground text-sm font-semibold"
                                    >
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
                                            <TooltipContent
                                                side="right"
                                                align="center"
                                            >
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
                                :disabled="
                                    isDemoSession || isAvatarUploadLoading
                                "
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
                                    v-if="
                                        inlineProfileEditing &&
                                        canEditProfileNames
                                    "
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
                                    'text-muted-foreground':
                                        isAccountPkkMissing,
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
                                v-if="
                                    inlineProfileEditing && canEditPhoneAndBio
                                "
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
                                v-if="
                                    inlineProfileEditing && canEditPhoneAndBio
                                "
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
        </div>
    </div>
</template>
