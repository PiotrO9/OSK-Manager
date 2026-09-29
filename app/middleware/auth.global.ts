import { useAuthReturnTo } from '~/composables/auth/useAuthReturnTo';
import { useAuthSession } from '~/composables/auth/useAuthSession';

const PUBLIC_PATH_PREFIXES = ['/login', '/palette-test'] as const;

function isPublicPath(path: string): boolean {
    for (const prefix of PUBLIC_PATH_PREFIXES) {
        if (path === prefix || path.startsWith(`${prefix}/`)) return true;
    }

    return false;
}

export default defineNuxtRouteMiddleware(async (to) => {
    const isLoginPath = to.path === '/login' || to.path.startsWith('/login/');

    if (isPublicPath(to.path) && !isLoginPath) return;

    const { checkSession } = useAuthSession();

    /*
     * Zawsze wołamy checkSession (GET /api/auth/me + ew. refresh), nie ufamy samemu
     * useState z pamięci — inaczej po wygaśnięciu access tokena UI zostaje „zalogowane”.
     */
    const hasSession = await checkSession();

    if (isLoginPath) return;

    if (hasSession) return;

    const redirectTarget = to.fullPath || '/';
    const { setReturnTo } = useAuthReturnTo();

    setReturnTo(redirectTarget);

    return navigateTo('/login');
});
