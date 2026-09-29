import { beforeEach, describe, expect, it, vi } from 'vitest';
import { computed, ref, shallowRef, watch } from 'vue';

const requestBffData = vi.hoisted(() => vi.fn());
const addToastMock = vi.hoisted(() => vi.fn());

vi.mock('../core/useApi', () => ({
    requestBffData,
}));

vi.mock('../core/useAppToast', () => ({
    useAppToast: () => ({
        addToast: addToastMock,
    }),
}));

function installVueGlobals(options: {
    addToast?: (toast: Record<string, unknown>) => void;
}): void {
    addToastMock.mockImplementation(options.addToast ?? vi.fn());
    vi.stubGlobal('ref', ref);
    vi.stubGlobal('shallowRef', shallowRef);
    vi.stubGlobal('computed', computed);
    vi.stubGlobal('watch', watch);
}

function fileInputEvent(file: File | null): Event {
    const input = {
        files: file ? [file] : [],
        value: 'selected-file',
    };

    return { target: input } as unknown as Event;
}

describe('useAccountAvatarUpload', () => {
    beforeEach(() => {
        vi.unstubAllGlobals();
        requestBffData.mockReset();
        addToastMock.mockReset();
    });

    it('rejects unsupported avatar file types before upload', async () => {
        const addToast = vi.fn();

        installVueGlobals({ addToast });
        const { useAccountAvatarUpload } =
            await import('./useAccountAvatarUpload');
        const avatar = useAccountAvatarUpload({
            avatarSrc: computed(() => ''),
            isDemoSession: computed(() => false),
            refreshProfileFromServer: vi.fn(),
        });

        await avatar.handleAvatarFileChange(
            fileInputEvent(
                new File(['x'], 'avatar.gif', { type: 'image/gif' }),
            ),
        );

        expect(requestBffData).not.toHaveBeenCalled();
        expect(addToast).toHaveBeenCalledWith({
            variant: 'error',
            title: 'Nieobsługiwany format',
            description: 'Dozwolone: JPEG, PNG, WebP.',
        });
    });

    it('rejects avatars larger than 5 MB before upload', async () => {
        const addToast = vi.fn();

        installVueGlobals({ addToast });
        const { useAccountAvatarUpload } =
            await import('./useAccountAvatarUpload');
        const avatar = useAccountAvatarUpload({
            avatarSrc: computed(() => ''),
            isDemoSession: computed(() => false),
            refreshProfileFromServer: vi.fn(),
        });

        await avatar.handleAvatarFileChange(
            fileInputEvent(
                new File([new Uint8Array(5 * 1024 * 1024 + 1)], 'large.png', {
                    type: 'image/png',
                }),
            ),
        );

        expect(requestBffData).not.toHaveBeenCalled();
        expect(addToast).toHaveBeenCalledWith({
            variant: 'error',
            title: 'Plik za duży',
            description: 'Maksymalny rozmiar avatara to 5 MB.',
        });
    });

    it('uploads valid avatar file, refreshes profile and emits success toast', async () => {
        const addToast = vi.fn();
        const refreshProfileFromServer = vi.fn().mockResolvedValue(undefined);

        requestBffData.mockResolvedValue('/avatar.webp');
        installVueGlobals({ addToast });

        const { useAccountAvatarUpload } =
            await import('./useAccountAvatarUpload');
        const avatar = useAccountAvatarUpload({
            avatarSrc: computed(() => ''),
            isDemoSession: computed(() => false),
            refreshProfileFromServer,
        });

        await avatar.handleAvatarFileChange(
            fileInputEvent(
                new File(['avatar'], 'avatar.webp', { type: 'image/webp' }),
            ),
        );

        expect(requestBffData).toHaveBeenCalledWith(
            'POST',
            '/api/auth/profile/avatar',
            expect.objectContaining({
                fallbackMessage: 'Upload nie powiódł się.',
                invalidMessage: 'Nieprawidłowa odpowiedź serwera.',
            }),
        );
        expect(refreshProfileFromServer).toHaveBeenCalledOnce();
        expect(addToast).toHaveBeenCalledWith({
            variant: 'success',
            title: 'Avatar zaktualizowany',
        });
        expect(avatar.isAvatarUploadLoading.value).toBe(false);
    });

    it('keeps the uploaded avatar and reports a refresh warning', async () => {
        const addToast = vi.fn();

        requestBffData.mockResolvedValue('/avatar-new.webp');
        installVueGlobals({ addToast });

        const { useAccountAvatarUpload } =
            await import('./useAccountAvatarUpload');
        const avatar = useAccountAvatarUpload({
            avatarSrc: computed(() => '/avatar-old.webp'),
            isDemoSession: computed(() => false),
            refreshProfileFromServer: vi
                .fn()
                .mockRejectedValue(new Error('refresh failed')),
        });

        await avatar.handleAvatarFileChange(
            fileInputEvent(
                new File(['avatar'], 'avatar.webp', { type: 'image/webp' }),
            ),
        );

        expect(avatar.avatarSrc.value).toBe('/avatar-new.webp');
        expect(addToast).toHaveBeenCalledWith({
            variant: 'warning',
            title: 'Zdjęcie zostało zapisane',
            description:
                'Nie udało się odświeżyć profilu. Nowe zdjęcie zobaczysz także po ponownym wejściu na stronę.',
        });
    });

    it('emits error toast when avatar upload fails', async () => {
        const addToast = vi.fn();

        requestBffData.mockRejectedValue({
            data: { message: 'Upload rejected' },
        });
        installVueGlobals({ addToast });

        const { useAccountAvatarUpload } =
            await import('./useAccountAvatarUpload');
        const avatar = useAccountAvatarUpload({
            avatarSrc: computed(() => ''),
            isDemoSession: computed(() => false),
            refreshProfileFromServer: vi.fn(),
        });

        await avatar.handleAvatarFileChange(
            fileInputEvent(
                new File(['avatar'], 'avatar.webp', { type: 'image/webp' }),
            ),
        );

        expect(addToast).toHaveBeenCalledWith({
            variant: 'error',
            title: 'Upload nie powiódł się',
            description: 'Upload rejected',
        });
        expect(avatar.isAvatarUploadLoading.value).toBe(false);
    });
});
