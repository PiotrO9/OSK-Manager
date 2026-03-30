const PUBLIC_PATH_PREFIXES = ['/login'] as const;

function isPublicPath(path: string): boolean {
    for (const prefix of PUBLIC_PATH_PREFIXES) {
        if (path === prefix || path.startsWith(`${prefix}/`)) return true;
    }

    return false;
}

export default defineNuxtRouteMiddleware(async (to) => {
    if (isPublicPath(to.path)) return;

    const { checkSession } = useAuthSession();

    /*
     * Zawsze wołamy checkSession (GET /api/auth/me + ew. refresh), nie ufamy samemu
     * useState z pamięci — inaczej po wygaśnięciu access tokena UI zostaje „zalogowane”.
     */
    const hasSession = await checkSession();

    if (hasSession) return;

    const redirectTarget = to.fullPath || '/';

    return navigateTo({
        path: '/login',
        query: { redirect: redirectTarget },
    });
});
