import type { ComputedRef } from 'vue';
import { normalizeBffPhotoUrl } from '~/utils/api/bffPhotoUpload';
import { getApiFetchErrorMessage } from '~/utils/api/apiFetchErrorMessage';
import { requestBffData } from '../core/useApi';
import { useAppToast } from '../core/useAppToast';

const MAX_AVATAR_BYTES = 5 * 1024 * 1024;
const ALLOWED_AVATAR_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

interface UseAccountAvatarUploadInput {
    avatarSrc: ComputedRef<string>;
    isDemoSession: ComputedRef<boolean>;
    refreshProfileFromServer: () => Promise<void>;
}

export function useAccountAvatarUpload(input: UseAccountAvatarUploadInput) {
    const { addToast } = useAppToast();

    const uploadedAvatarSrc = shallowRef('');
    const isAvatarUploadLoading = shallowRef(false);
    const avatarImageFailed = shallowRef(false);

    const avatarSrc = computed(
        () => uploadedAvatarSrc.value || input.avatarSrc.value,
    );

    const showAvatarImage = computed(
        () => Boolean(avatarSrc.value) && !avatarImageFailed.value,
    );

    function handleAvatarImageError() {
        avatarImageFailed.value = true;
    }

    async function handleAvatarFileChange(event: Event) {
        const inputElement = event.target as HTMLInputElement;
        const file = inputElement.files?.[0] ?? null;

        inputElement.value = '';

        if (!file || input.isDemoSession.value) return;

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
            const body = new FormData();

            body.append('file', file, file.name);

            uploadedAvatarSrc.value = await requestBffData<string>(
                'POST',
                '/api/auth/profile/avatar',
                {
                    body,
                    fallbackMessage: 'Upload nie powiódł się.',
                    invalidMessage: 'Nieprawidłowa odpowiedź serwera.',
                    normalize: normalizeBffPhotoUrl,
                },
            );

            try {
                await input.refreshProfileFromServer();
            } catch {
                addToast({
                    variant: 'warning',
                    title: 'Zdjęcie zostało zapisane',
                    description:
                        'Nie udało się odświeżyć profilu. Nowe zdjęcie zobaczysz także po ponownym wejściu na stronę.',
                });

                return;
            }

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

    watch(input.avatarSrc, () => {
        uploadedAvatarSrc.value = '';
    });

    watch(avatarSrc, () => {
        avatarImageFailed.value = false;
    });

    return {
        avatarSrc,
        handleAvatarFileChange,
        handleAvatarImageError,
        isAvatarUploadLoading,
        showAvatarImage,
    };
}
