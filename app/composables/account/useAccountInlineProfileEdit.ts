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
import { useAppToast } from '../core/useAppToast';

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
        roleAllowsProfileNames(input.session.value?.role),
    );
    const canEditPhoneAndBio = computed(() =>
        roleAllowsPhoneAndBio(input.session.value?.role),
    );

    const editFirstName = ref('');
    const editLastName = ref('');
    const profileNamesError = ref('');
    const isProfileNamesSaving = ref(false);

    const editPhone = ref('');
    const editBio = ref('');
    const profileContactError = ref('');
    const isProfileContactSaving = ref(false);

    const inlineProfileEditing = ref(false);

    const canEditInlineProfile = computed(
        () =>
            Boolean(input.session.value && !input.isDemoSession.value) &&
            (canEditProfileNames.value || canEditPhoneAndBio.value),
    );

    const isInlineProfileSaving = computed(
        () => isProfileNamesSaving.value || isProfileContactSaving.value,
    );

    function syncNameFormFromSession() {
        const s = input.session.value;

        if (!s || !roleAllowsProfileNames(s.role)) return;

        editFirstName.value = s.firstName ?? '';
        editLastName.value = s.lastName ?? '';
    }

    function syncContactFormFromSession() {
        const s = input.session.value;

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

        const payload: AuthProfilePatchBody = {};

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
    };
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
