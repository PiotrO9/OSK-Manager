/** Nazwa cookie na bezpieczny względny URL powrotu po logowaniu (bez ujawniania w pasku adresu). */
export const AUTH_RETURN_TO_COOKIE_NAME = 'auth_return_to';

const AUTH_RETURN_BASE_URL = 'https://osk-manager.local';

function hasUnsafePathCharacters(path: string): boolean {
    if (path.includes('\\')) return true;

    return Array.from(path).some((character) => {
        const codePoint = character.codePointAt(0) ?? 0;

        return codePoint < 32 || codePoint === 127;
    });
}

export function isSafeRelativeRedirectPath(path: string): boolean {
    if (
        !path.startsWith('/') ||
        path.startsWith('//') ||
        hasUnsafePathCharacters(path)
    ) {
        return false;
    }

    try {
        const baseUrl = new URL(AUTH_RETURN_BASE_URL);
        const resolvedUrl = new URL(path, baseUrl);

        if (resolvedUrl.origin !== baseUrl.origin) return false;

        if (
            resolvedUrl.pathname === '/login' ||
            resolvedUrl.pathname.startsWith('/login/')
        ) {
            return false;
        }
    } catch {
        return false;
    }

    return true;
}

export function getAuthReturnToCookieBaseOptions() {
    return {
        path: '/' as const,
        maxAge: 600,
        sameSite: 'lax' as const,
    };
}
