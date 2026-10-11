import { useAuthSession } from '../auth/useAuthSession';
import { useAccountAvatarUpload } from './useAccountAvatarUpload';
import { useAccountInlineProfileEdit } from './useAccountInlineProfileEdit';
import {
    formatAccountProfileField,
    getAccountRolePresentation,
    getAccountUserInitials,
    hasAccountPkkNumber,
} from '~/utils/account/accountProfilePresentation';
import { isAuthRole } from '~/utils/auth/authRole';

export function useAccountPage() {
    const { session, refreshProfileFromServer, patchProfile } =
        useAuthSession();

    const isDemoSession = computed(
        () =>
            session.value?.userId === 'demo' ||
            isAuthRole(session.value?.role, 'DEMO'),
    );

    const displayName = computed(() => session.value?.userName ?? 'Użytkownik');

    const sessionRoleBadge = computed(() =>
        getAccountRolePresentation(session.value?.role),
    );

    const isStudentSession = computed(() =>
        isAuthRole(session.value?.role, 'STUDENT'),
    );

    const accountPkkNumber = computed(() => {
        const raw = session.value?.pkkNumber;

        return hasAccountPkkNumber(raw) ? raw.trim() : 'Brak przypisanego PKK';
    });

    const isAccountPkkMissing = computed(
        () => !hasAccountPkkNumber(session.value?.pkkNumber),
    );

    const userInitials = computed(() =>
        getAccountUserInitials(displayName.value),
    );

    const sessionAvatarSrc = computed(() => {
        const raw = session.value?.avatarUrl;

        if (typeof raw !== 'string' || raw.trim() === '') {
            return '';
        }

        return raw.trim();
    });

    const {
        avatarSrc,
        handleAvatarFileChange,
        handleAvatarImageError,
        isAvatarUploadLoading,
        showAvatarImage,
    } = useAccountAvatarUpload({
        avatarSrc: sessionAvatarSrc,
        isDemoSession,
        refreshProfileFromServer,
    });
    const {
        canEditInlineProfile,
        canEditPhoneAndBio,
        canEditProfileNames,
        requestDiscardChanges,
        finishDiscardDecision,
        editBioError,
        editBio,
        editFirstNameError,
        editFirstName,
        editLastNameError,
        editLastName,
        editPhone,
        handleCancelInlineProfileEdit,
        handleInlineProfileSubmit,
        handleStartInlineProfileEdit,
        inlineProfileEditing,
        isDiscardDialogOpen,
        isInlineProfileDirty,
        isInlineProfileSaving,
    } = useAccountInlineProfileEdit({
        session,
        isDemoSession,
        patchProfile,
    });

    return {
        accountPkkNumber,
        avatarSrc,
        canEditInlineProfile,
        canEditPhoneAndBio,
        canEditProfileNames,
        requestDiscardChanges,
        finishDiscardDecision,
        displayName,
        editBio,
        editBioError,
        editFirstName,
        editFirstNameError,
        editLastName,
        editLastNameError,
        editPhone,
        formatProfileField: formatAccountProfileField,
        handleAvatarFileChange,
        handleAvatarImageError,
        handleCancelInlineProfileEdit,
        handleInlineProfileSubmit,
        handleStartInlineProfileEdit,
        inlineProfileEditing,
        isDiscardDialogOpen,
        isAccountPkkMissing,
        isAvatarUploadLoading,
        isDemoSession,
        isInlineProfileDirty,
        isInlineProfileSaving,
        isStudentSession,
        session,
        sessionRoleBadge,
        showAvatarImage,
        userInitials,
    };
}
