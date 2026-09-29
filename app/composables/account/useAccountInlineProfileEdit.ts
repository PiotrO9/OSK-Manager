import type { ComputedRef, Ref } from 'vue';
import type {
    AuthProfilePatchBody,
    AuthSession,
} from '~/utils/auth/authSessionMapper';
import { getApiFetchErrorMessage } from '~/utils/api/apiFetchErrorMessage';
import {
    PROFILE_BIO_MAX_LEN,
    PROFILE_NAME_MAX_LEN,
} from '~/utils/account/accountProfileEdit';
import {
    hasManagerAccess,
    hasStudentOrInstructorAccess,
} from '~/utils/auth/authRole';
import { useAppToast } from '../core/useAppToast';

const DISCARD_PROFILE_CHANGES_MESSAGE =
    'Masz niezapisane zmiany profilu. Czy chcesz je odrzucić?';

interface UseAccountInlineProfileEditInput {
    session: Ref<AuthSession | null>;
    isDemoSession: ComputedRef<boolean>;
    patchProfile: (body: AuthProfilePatchBody) => Promise<void>;
}

export function useAccountInlineProfileEdit(
    input: UseAccountInlineProfileEditInput,
) {
    const { addToast } = useAppToast();

    const canEditProfileNames = computed(() =>
        hasManagerAccess(input.session.value?.role),
    );
    const canEditPhoneAndBio = computed(() =>
        hasStudentOrInstructorAccess(input.session.value?.role),
    );

    const editFirstName = shallowRef('');
    const editLastName = shallowRef('');
    const editPhone = shallowRef('');
    const editBio = shallowRef('');

    const editFirstNameError = shallowRef('');
    const editLastNameError = shallowRef('');
    const editBioError = shallowRef('');

    const isProfileNamesSaving = shallowRef(false);
    const isProfileContactSaving = shallowRef(false);
    const inlineProfileEditing = shallowRef(false);

    const canEditInlineProfile = computed(
        () =>
            Boolean(input.session.value && !input.isDemoSession.value) &&
            (canEditProfileNames.value || canEditPhoneAndBio.value),
    );

    const isInlineProfileSaving = computed(
        () => isProfileNamesSaving.value || isProfileContactSaving.value,
    );

    const isInlineProfileDirty = computed(() => {
        const current = input.session.value;

        if (!inlineProfileEditing.value || !current) return false;

        if (canEditProfileNames.value) {
            return (
                editFirstName.value.trim() !==
                    (current.firstName ?? '').trim() ||
                editLastName.value.trim() !== (current.lastName ?? '').trim()
            );
        }

        if (canEditPhoneAndBio.value) {
            return (
                editPhone.value.trim() !== (current.phone ?? '').trim() ||
                editBio.value.trim() !== (current.bio ?? '').trim()
            );
        }

        return false;
    });

    function clearValidationErrors() {
        editFirstNameError.value = '';
        editLastNameError.value = '';
        editBioError.value = '';
    }

    function syncNameFormFromSession() {
        const s = input.session.value;

        if (!s || !hasManagerAccess(s.role)) return;

        editFirstName.value = s.firstName ?? '';
        editLastName.value = s.lastName ?? '';
    }

    function syncContactFormFromSession() {
        const s = input.session.value;

        if (!s || !hasStudentOrInstructorAccess(s.role)) return;

        editPhone.value =
            s.phone === null || s.phone === undefined ? '' : String(s.phone);

        editBio.value =
            s.bio === null || s.bio === undefined ? '' : String(s.bio);
    }

    function handleStartInlineProfileEdit() {
        if (!canEditInlineProfile.value) return;

        clearValidationErrors();
        syncNameFormFromSession();
        syncContactFormFromSession();
        inlineProfileEditing.value = true;
    }

    function confirmDiscardChanges(): boolean {
        if (!isInlineProfileDirty.value || typeof window === 'undefined') {
            return true;
        }

        return window.confirm(DISCARD_PROFILE_CHANGES_MESSAGE);
    }

    function handleCancelInlineProfileEdit(): boolean {
        if (!confirmDiscardChanges()) return false;

        clearValidationErrors();
        syncNameFormFromSession();
        syncContactFormFromSession();
        inlineProfileEditing.value = false;

        return true;
    }

    async function handleInlineProfileSubmit() {
        if (!canEditInlineProfile.value || isInlineProfileSaving.value) return;

        clearValidationErrors();

        if (!isInlineProfileDirty.value) return;

        const payload: AuthProfilePatchBody = {};

        if (canEditProfileNames.value) {
            const first = editFirstName.value.trim();
            const last = editLastName.value.trim();

            if (!first) {
                editFirstNameError.value = 'Imię jest wymagane.';

                return;
            }

            if (!last) {
                editLastNameError.value = 'Nazwisko jest wymagane.';

                return;
            }

            if (
                first.length > PROFILE_NAME_MAX_LEN ||
                last.length > PROFILE_NAME_MAX_LEN
            ) {
                if (first.length > PROFILE_NAME_MAX_LEN) {
                    editFirstNameError.value = `Imię może mieć co najwyżej ${PROFILE_NAME_MAX_LEN} znaków.`;
                }

                if (last.length > PROFILE_NAME_MAX_LEN) {
                    editLastNameError.value = `Nazwisko może mieć co najwyżej ${PROFILE_NAME_MAX_LEN} znaków.`;
                }

                return;
            }

            payload.firstName = first;
            payload.lastName = last;
        }

        if (canEditPhoneAndBio.value) {
            const phone = editPhone.value.trim();
            const bio = editBio.value.trim();

            if (bio.length > PROFILE_BIO_MAX_LEN) {
                editBioError.value = `Opis może mieć co najwyżej ${PROFILE_BIO_MAX_LEN} znaków.`;

                return;
            }

            payload.phone = phone.length > 0 ? phone : null;
            payload.bio = bio.length > 0 ? bio : null;
        }

        isProfileNamesSaving.value = canEditProfileNames.value;
        isProfileContactSaving.value = canEditPhoneAndBio.value;

        try {
            await input.patchProfile(payload);
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

    watch(
        () => input.session.value?.userId,
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

    return {
        canEditInlineProfile,
        canEditPhoneAndBio,
        canEditProfileNames,
        confirmDiscardChanges,
        editBio,
        editBioError,
        editFirstName,
        editFirstNameError,
        editLastName,
        editLastNameError,
        editPhone,
        handleCancelInlineProfileEdit,
        handleInlineProfileSubmit,
        handleStartInlineProfileEdit,
        inlineProfileEditing,
        isInlineProfileDirty,
        isInlineProfileSaving,
    };
}
