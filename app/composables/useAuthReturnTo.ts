import {
    AUTH_RETURN_TO_COOKIE_NAME,
    getAuthReturnToCookieBaseOptions,
    isSafeRelativeRedirectPath,
} from '~/utils/authReturnPath';

export function useAuthReturnTo() {
    const cookie = useCookie<string | null>(AUTH_RETURN_TO_COOKIE_NAME, {
        ...getAuthReturnToCookieBaseOptions(),
        default: () => null,
    });

    function setReturnTo(path: string): void {
        if (!isSafeRelativeRedirectPath(path)) return;

        cookie.value = path;
    }

    /**
     * Odczytuje zapamiętaną ścieżkę i kasuje cookie (jednorazowe użycie).
     */
    function consumeReturnTo(): string | null {
        const value = cookie.value;

        cookie.value = null;

        if (value && isSafeRelativeRedirectPath(value)) return value;

        return null;
    }

    return {
        cookie,
        setReturnTo,
        consumeReturnTo,
    };
}
