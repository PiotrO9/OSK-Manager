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

    const avatarFileInputRef = ref<HTMLInputElement | null>(null);
    const isAvatarUploadLoading = ref(false);
    const avatarImageFailed = ref(false);

    const showAvatarImage = computed(
        () => Boolean(input.avatarSrc.value) && !avatarImageFailed.value,
    );

    function handleAvatarImageError() {
        avatarImageFailed.value = true;
    }

    function handleChooseAvatarClick() {
        if (input.isDemoSession.value || isAvatarUploadLoading.value) return;

        avatarFileInputRef.value?.click();
    }

    function handleChooseAvatarKeyDown(event: KeyboardEvent) {
        if (event.key !== 'Enter' && event.key !== ' ') return;

        event.preventDefault();
        handleChooseAvatarClick();
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

            await requestBffData<string>('POST', '/api/auth/profile/avatar', {
                body,
                fallbackMessage: 'Upload nie powiódł się.',
                invalidMessage: 'Nieprawidłowa odpowiedź serwera.',
                normalize: normalizeBffPhotoUrl,
            });

            await input.refreshProfileFromServer();

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
        avatarImageFailed.value = false;
    });

    return {
        avatarFileInputRef,
        handleAvatarFileChange,
        handleAvatarImageError,
        handleChooseAvatarClick,
        handleChooseAvatarKeyDown,
        isAvatarUploadLoading,
        showAvatarImage,
    };
}
