import { getApiFetchErrorMessage } from '~/utils/api/apiFetchErrorMessage';
import { resolveBffEndpoint } from '~/utils/api/bffEndpoint';

const MAX_AVATAR_BYTES = 5 * 1024 * 1024;
const ALLOWED_AVATAR_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

export const PROFILE_NAME_MAX_LEN = 100;
export const PROFILE_BIO_MAX_LEN = 2000;

export type RoleBadgeVariant =
    | 'default'
    | 'secondary'
    | 'destructive'
    | 'outline';

export interface RoleBadgePresentation {
    label: string;
    variant: RoleBadgeVariant;
    class?: string;
}

export function useAccountPage() {
    const { session, refreshProfileFromServer, patchProfile } =
        useAuthSession();
    const { addToast } = useAppToast();

    const canEditProfileNames = computed(() =>
        roleAllowsProfileNames(session.value?.role),
    );
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

    const avatarFileInputRef = ref<HTMLInputElement | null>(null);
    const isAvatarUploadLoading = ref(false);
    const avatarImageFailed = ref(false);

    const displayName = computed(
        () => session.value?.userName ?? 'UĹĽytkownik',
    );

    const sessionRoleBadge = computed(() =>
        getRoleBadgePresentation(session.value?.role),
    );

    const isStudentSession = computed(
        () => session.value?.role?.trim().toUpperCase() === 'STUDENT',
    );

    const accountPkkNumber = computed(() => {
        const raw = session.value?.pkkNumber;

        return hasPkkNumber(raw) ? raw.trim() : 'Brak przypisanego PKK';
    });

    const isAccountPkkMissing = computed(
        () => !hasPkkNumber(session.value?.pkkNumber),
    );

    const userInitials = computed(() =>
        userInitialsFromName(displayName.value),
    );

    const avatarSrc = computed(() => {
        const raw = session.value?.avatarUrl;

        if (typeof raw !== 'string' || raw.trim() === '') {
            return '';
        }

        return raw.trim();
    });

    const showAvatarImage = computed(
        () => Boolean(avatarSrc.value) && !avatarImageFailed.value,
    );

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

        editBio.value =
            s.bio === null || s.bio === undefined ? '' : String(s.bio);
    }

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
                profileNamesError.value = 'ImiÄ™ jest wymagane.';

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
                profileNamesError.value = `KaĹĽde pole moĹĽe mieÄ‡ co najwyĹĽej ${PROFILE_NAME_MAX_LEN} znakĂłw.`;

                return;
            }

            payload.firstName = first;
            payload.lastName = last;
        }

        if (canEditPhoneAndBio.value) {
            const phone = editPhone.value.trim();
            const bio = editBio.value.trim();

            if (bio.length > PROFILE_BIO_MAX_LEN) {
                profileContactError.value = `Opis moĹĽe mieÄ‡ co najwyĹĽej ${PROFILE_BIO_MAX_LEN} znakĂłw.`;

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
                description: getApiFetchErrorMessage(err, 'SprĂłbuj ponownie.'),
            });
        } finally {
            isProfileNamesSaving.value = false;
            isProfileContactSaving.value = false;
        }
    }

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
                title: 'NieobsĹ‚ugiwany format',
                description: 'Dozwolone: JPEG, PNG, WebP.',
            });

            return;
        }

        if (file.size > MAX_AVATAR_BYTES) {
            addToast({
                variant: 'error',
                title: 'Plik za duĹĽy',
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
                throw new Error('NieprawidĹ‚owa odpowiedĹş serwera.');
            }

            await refreshProfileFromServer();

            addToast({
                variant: 'success',
                title: 'Avatar zaktualizowany',
            });
        } catch (err: unknown) {
            addToast({
                variant: 'error',
                title: 'Upload nie powiĂłdĹ‚ siÄ™',
                description: getApiFetchErrorMessage(
                    err,
                    'SprĂłbuj ponownie pĂłĹşniej.',
                ),
            });
        } finally {
            isAvatarUploadLoading.value = false;
        }
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

    watch(avatarSrc, () => {
        avatarImageFailed.value = false;
    });

    return {
        accountPkkNumber,
        avatarFileInputRef,
        avatarSrc,
        canEditInlineProfile,
        canEditPhoneAndBio,
        canEditProfileNames,
        displayName,
        editBio,
        editFirstName,
        editLastName,
        editPhone,
        formatProfileField,
        handleAvatarFileChange,
        handleAvatarImageError,
        handleCancelInlineProfileEdit,
        handleChooseAvatarClick,
        handleChooseAvatarKeyDown,
        handleInlineProfileSubmit,
        handleStartInlineProfileEdit,
        inlineProfileEditing,
        isAccountPkkMissing,
        isAvatarUploadLoading,
        isDemoSession,
        isInlineProfileSaving,
        isStudentSession,
        profileContactError,
        profileNamesError,
        session,
        sessionRoleBadge,
        showAvatarImage,
        userInitials,
    };
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

function roleAllowsPhoneAndBio(role: string | undefined): boolean {
    if (!role) return false;

    const r = role.trim().toUpperCase();

    return r === 'STUDENT' || r === 'INSTRUCTOR';
}

function hasPkkNumber(value: string | null | undefined): boolean {
    return typeof value === 'string' && value.trim().length > 0;
}

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

function formatProfileField(value: string | null | undefined): string {
    if (value === null || value === undefined || value.trim() === '') {
        return 'â€”';
    }

    return value.trim();
}
