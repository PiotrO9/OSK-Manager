import { beforeEach, describe, expect, it, vi } from 'vitest';
import { computed, ref, shallowRef, watch } from 'vue';
import type { AuthSession } from '~/utils/auth/authSessionMapper';

const addToastMock = vi.hoisted(() => vi.fn());

vi.mock('../core/useAppToast', () => ({
    useAppToast: () => ({
        addToast: addToastMock,
    }),
}));

function installVueGlobals(): void {
    vi.stubGlobal('ref', ref);
    vi.stubGlobal('shallowRef', shallowRef);
    vi.stubGlobal('computed', computed);
    vi.stubGlobal('watch', watch);
}

function session(overrides: Partial<AuthSession> = {}): AuthSession {
    return {
        userId: 'user-1',
        userName: 'Jan Kowalski',
        email: 'jan@example.com',
        role: 'MANAGER',
        firstName: 'Jan',
        lastName: 'Kowalski',
        phone: null,
        bio: null,
        drivingSchools: [],
        defaultOskId: null,
        ...overrides,
    };
}

describe('useAccountInlineProfileEdit', () => {
    beforeEach(() => {
        vi.unstubAllGlobals();
        addToastMock.mockReset();
        installVueGlobals();
    });

    it('starts and cancels inline edit with values from session', async () => {
        const { useAccountInlineProfileEdit } =
            await import('./useAccountInlineProfileEdit');
        const accountSession = ref<AuthSession | null>(session());
        const profile = useAccountInlineProfileEdit({
            session: accountSession,
            isDemoSession: computed(() => false),
            patchProfile: vi.fn(),
        });

        profile.handleStartInlineProfileEdit();

        expect(profile.inlineProfileEditing.value).toBe(true);
        expect(profile.isInlineProfileDirty.value).toBe(false);
        expect(profile.editFirstName.value).toBe('Jan');
        expect(profile.editLastName.value).toBe('Kowalski');

        expect(profile.isInlineProfileDirty.value).toBe(false);
        profile.handleCancelInlineProfileEdit();

        expect(profile.inlineProfileEditing.value).toBe(false);
        expect(profile.editFirstName.value).toBe('Jan');
    });

    it('validates manager first and last names before saving', async () => {
        const { useAccountInlineProfileEdit } =
            await import('./useAccountInlineProfileEdit');
        const patchProfile = vi.fn();
        const profile = useAccountInlineProfileEdit({
            session: ref<AuthSession | null>(session()),
            isDemoSession: computed(() => false),
            patchProfile,
        });

        profile.handleStartInlineProfileEdit();
        profile.editFirstName.value = '';

        await profile.handleInlineProfileSubmit();

        expect(profile.editFirstNameError.value).toBe('Imię jest wymagane.');
        expect(patchProfile).not.toHaveBeenCalled();
    });

    it('does not save when the profile draft has not changed', async () => {
        const { useAccountInlineProfileEdit } =
            await import('./useAccountInlineProfileEdit');
        const patchProfile = vi.fn();
        const profile = useAccountInlineProfileEdit({
            session: ref<AuthSession | null>(session()),
            isDemoSession: computed(() => false),
            patchProfile,
        });

        profile.handleStartInlineProfileEdit();
        await profile.handleInlineProfileSubmit();

        expect(profile.isInlineProfileDirty.value).toBe(false);
        expect(patchProfile).not.toHaveBeenCalled();
    });

    it('keeps a dirty draft when the navigation dialog is cancelled', async () => {
        const { useAccountInlineProfileEdit } =
            await import('./useAccountInlineProfileEdit');
        const profile = useAccountInlineProfileEdit({
            session: ref<AuthSession | null>(session()),
            isDemoSession: computed(() => false),
            patchProfile: vi.fn(),
        });

        profile.handleStartInlineProfileEdit();
        profile.editFirstName.value = 'Anna';

        const navigation = profile.requestDiscardChanges();

        expect(profile.isDiscardDialogOpen.value).toBe(true);
        profile.finishDiscardDecision(false);

        expect(await navigation).toBe(false);
        expect(profile.inlineProfileEditing.value).toBe(true);
        expect(profile.editFirstName.value).toBe('Anna');
        expect(profile.isDiscardDialogOpen.value).toBe(false);
    });

    it('discards a dirty draft immediately when edit is cancelled', async () => {
        const { useAccountInlineProfileEdit } =
            await import('./useAccountInlineProfileEdit');
        const patchProfile = vi.fn();
        const profile = useAccountInlineProfileEdit({
            session: ref<AuthSession | null>(session()),
            isDemoSession: computed(() => false),
            patchProfile,
        });

        profile.handleStartInlineProfileEdit();
        profile.editFirstName.value = 'Anna';
        profile.handleCancelInlineProfileEdit();

        expect(profile.inlineProfileEditing.value).toBe(false);
        expect(profile.editFirstName.value).toBe('Jan');
        expect(profile.isDiscardDialogOpen.value).toBe(false);
        expect(patchProfile).not.toHaveBeenCalled();
    });

    it('opens one dialog when navigation is requested more than once', async () => {
        const { useAccountInlineProfileEdit } =
            await import('./useAccountInlineProfileEdit');
        const profile = useAccountInlineProfileEdit({
            session: ref<AuthSession | null>(session()),
            isDemoSession: computed(() => false),
            patchProfile: vi.fn(),
        });

        profile.handleStartInlineProfileEdit();
        profile.editFirstName.value = 'Anna';

        const navigation = profile.requestDiscardChanges();

        expect(profile.requestDiscardChanges()).toBe(navigation);
        expect(profile.isDiscardDialogOpen.value).toBe(true);

        profile.finishDiscardDecision(true);

        expect(await navigation).toBe(true);
        expect(profile.isDiscardDialogOpen.value).toBe(false);
    });

    it('saves manager profile names and emits success toast', async () => {
        const { useAccountInlineProfileEdit } =
            await import('./useAccountInlineProfileEdit');
        const patchProfile = vi.fn().mockResolvedValue(undefined);
        const profile = useAccountInlineProfileEdit({
            session: ref<AuthSession | null>(session()),
            isDemoSession: computed(() => false),
            patchProfile,
        });

        profile.handleStartInlineProfileEdit();
        profile.editFirstName.value = ' Anna ';
        profile.editLastName.value = ' Nowak ';

        await profile.handleInlineProfileSubmit();

        expect(patchProfile).toHaveBeenCalledWith({
            firstName: 'Anna',
            lastName: 'Nowak',
        });
        expect(profile.inlineProfileEditing.value).toBe(false);
        expect(addToastMock).toHaveBeenCalledWith({
            variant: 'success',
            title: 'Profil zaktualizowany',
        });
    });

    it('saves student phone and bio with nullable empty values', async () => {
        const { useAccountInlineProfileEdit } =
            await import('./useAccountInlineProfileEdit');
        const patchProfile = vi.fn().mockResolvedValue(undefined);
        const profile = useAccountInlineProfileEdit({
            session: ref<AuthSession | null>(
                session({
                    role: 'STUDENT',
                    firstName: undefined,
                    lastName: undefined,
                    phone: '123',
                    bio: 'old',
                }),
            ),
            isDemoSession: computed(() => false),
            patchProfile,
        });

        profile.handleStartInlineProfileEdit();
        profile.editPhone.value = ' ';
        profile.editBio.value = ' Nowy opis ';

        await profile.handleInlineProfileSubmit();

        expect(patchProfile).toHaveBeenCalledWith({
            phone: null,
            bio: 'Nowy opis',
        });
    });

    it('emits error toast when profile save fails', async () => {
        const { useAccountInlineProfileEdit } =
            await import('./useAccountInlineProfileEdit');
        const patchProfile = vi
            .fn()
            .mockRejectedValue({ data: { message: 'Save rejected' } });
        const profile = useAccountInlineProfileEdit({
            session: ref<AuthSession | null>(session()),
            isDemoSession: computed(() => false),
            patchProfile,
        });

        profile.handleStartInlineProfileEdit();
        profile.editFirstName.value = 'Anna';
        await profile.handleInlineProfileSubmit();

        expect(addToastMock).toHaveBeenCalledWith({
            variant: 'error',
            title: 'Nie zapisano zmian',
            description: 'Save rejected',
        });
        expect(profile.isInlineProfileSaving.value).toBe(false);
    });
});
