import {
    AUTH_RETURN_TO_COOKIE_NAME,
    getAuthReturnToCookieBaseOptions,
    isSafeRelativeRedirectPath,
} from '~/utils/auth/authReturnPath';

import { canonicalizeAppUrl } from '~~/shared/routing/routePaths';

export function useAuthReturnTo() {
    const cookie = useCookie<string | null>(AUTH_RETURN_TO_COOKIE_NAME, {
        ...getAuthReturnToCookieBaseOptions(),
        default: () => null,
    });

    function setReturnTo(path: string): void {
        if (!isSafeRelativeRedirectPath(path)) return;

        cookie.value = canonicalizeAppUrl(path);
    }

    /**
     * Odczytuje zapamiętaną ścieżkę i kasuje cookie (jednorazowe użycie).
     */
    function consumeReturnTo(): string | null {
        const value = cookie.value;

        cookie.value = null;

        if (value && isSafeRelativeRedirectPath(value))
            return canonicalizeAppUrl(value);

        return null;
    }

    return {
        cookie,
        setReturnTo,
        consumeReturnTo,
    };
}
