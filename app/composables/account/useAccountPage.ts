import { useAuthSession } from '../auth/useAuthSession';
import { useAccountAvatarUpload } from './useAccountAvatarUpload';
import { useAccountInlineProfileEdit } from './useAccountInlineProfileEdit';

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

    const isDemoSession = computed(() => session.value?.userId === 'demo');

    const displayName = computed(() => session.value?.userName ?? 'Użytkownik');

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

    const {
        avatarFileInputRef,
        handleAvatarFileChange,
        handleAvatarImageError,
        handleChooseAvatarClick,
        handleChooseAvatarKeyDown,
        isAvatarUploadLoading,
        showAvatarImage,
    } = useAccountAvatarUpload({
        avatarSrc,
        isDemoSession,
        refreshProfileFromServer,
    });
    const {
        canEditInlineProfile,
        canEditPhoneAndBio,
        canEditProfileNames,
        editBio,
        editFirstName,
        editLastName,
        editPhone,
        handleCancelInlineProfileEdit,
        handleInlineProfileSubmit,
        handleStartInlineProfileEdit,
        inlineProfileEditing,
        isInlineProfileSaving,
        profileContactError,
        profileNamesError,
    } = useAccountInlineProfileEdit({
        session,
        isDemoSession,
        patchProfile,
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

function hasPkkNumber(value: string | null | undefined): value is string {
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
        return '—';
    }

    return value.trim();
}
