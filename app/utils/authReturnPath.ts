/** Nazwa cookie na bezpieczny względny URL powrotu po logowaniu (bez ujawniania w pasku adresu). */
export const AUTH_RETURN_TO_COOKIE_NAME = 'auth_return_to';

export function isSafeRelativeRedirectPath(path: string): boolean {
    if (!path.startsWith('/') || path.startsWith('//')) return false;

    return true;
}

export function getAuthReturnToCookieBaseOptions() {
    return {
        path: '/' as const,
        maxAge: 600,
        sameSite: 'lax' as const,
    };
}
